import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PostgresTodoRepository } from '@todo/db';

interface GetTodoParams {
  id: string;
}

export async function getTodo(server: FastifyInstance): Promise<void> {
  server.get<{ Params: GetTodoParams }>(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        summary: 'Get a todo by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
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
    async (request: FastifyRequest<{ Params: GetTodoParams }>, reply: FastifyReply) => {
      const userId = request.user.id;
      const todoId = request.params.id;

      const repository = new PostgresTodoRepository(userId);
      const todo = await repository.findById(todoId);

      if (!todo) {
        return reply.status(404).send({
          type: 'https://api.todo.app/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: `Todo with ID '${todoId}' not found`,
          instance: request.url,
        });
      }

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
