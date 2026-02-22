import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createTodoSchema } from '@todo/shared';
import { PostgresTodoRepository } from '@todo/db';
import { TodoService } from '@todo/core';

interface CreateTodoBody {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags?: string[];
}

export async function createTodo(server: FastifyInstance): Promise<void> {
  server.post<{ Body: CreateTodoBody }>(
    '/',
    {
      schema: {
        tags: ['todos'],
        summary: 'Create a new todo',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 2000 },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            dueDate: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                  dueDate: { type: 'string', nullable: true },
                  tags: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  completedAt: { type: 'string', nullable: true },
                },
              },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateTodoBody }>, reply: FastifyReply) => {
      const userId = request.user.id;

      // Validate input
      const parsed = createTodoSchema.safeParse(request.body);
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

      const input: Parameters<typeof repository.create>[0] = {
        title: parsed.data.title,
      };
      if (parsed.data.description !== undefined) input.description = parsed.data.description;
      if (parsed.data.priority !== undefined) input.priority = parsed.data.priority;
      if (parsed.data.dueDate) input.dueDate = new Date(parsed.data.dueDate);
      if (parsed.data.tags !== undefined) input.tags = parsed.data.tags;

      const todo = await repository.create(input);

      return reply.status(201).send({
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
