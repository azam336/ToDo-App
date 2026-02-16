import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { updateTodoSchema } from '@todo/shared';
import { PostgresTodoRepository } from '@todo/db';

interface UpdateTodoParams {
  id: string;
}

interface UpdateTodoBody {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string | null;
  tags?: string[];
}

export async function updateTodo(server: FastifyInstance): Promise<void> {
  server.patch<{ Params: UpdateTodoParams; Body: UpdateTodoBody }>(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        summary: 'Update a todo',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 2000 },
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: { type: 'object' },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: UpdateTodoParams; Body: UpdateTodoBody }>, reply: FastifyReply) => {
      const userId = request.user.id;
      const todoId = request.params.id;

      // Validate input
      const parsed = updateTodoSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          type: 'https://api.todo.app/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'Request validation failed',
          instance: request.url,
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            code: e.code,
            message: e.message,
          })),
        });
      }

      const repository = new PostgresTodoRepository(userId);

      // Check if todo exists
      const existing = await repository.findById(todoId);
      if (!existing) {
        return reply.status(404).send({
          type: 'https://api.todo.app/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: `Todo with ID '${todoId}' not found`,
          instance: request.url,
        });
      }

      // Check business rule: cannot update completed todo
      if (existing.status === 'completed' && parsed.data.status !== 'pending' && parsed.data.status !== 'in_progress') {
        // Allow uncompleting, but not other updates
        const hasOtherChanges = Object.keys(parsed.data).some(
          (key) => key !== 'status'
        );
        if (hasOtherChanges && !parsed.data.status) {
          return reply.status(422).send({
            type: 'https://api.todo.app/errors/business-rule',
            title: 'Business Rule Violation',
            status: 422,
            detail: 'Cannot update a completed todo',
            instance: request.url,
            rule: 'BR-02',
          });
        }
      }

      const updateData: Parameters<typeof repository.update>[1] = {};

      if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
      if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
      if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
      if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
      if (parsed.data.dueDate !== undefined) {
        updateData.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
      }
      if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags;

      const todo = await repository.update(todoId, updateData);

      return reply.status(200).send({
        data: {
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          dueDate: todo.dueDate?.toISOString() ?? null,
          tags: todo.tags,
          createdAt: todo.createdAt.toISOString(),
          updatedAt: todo.updatedAt.toISOString(),
          completedAt: todo.completedAt?.toISOString() ?? null,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      });
    }
  );
}
