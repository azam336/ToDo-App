import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PostgresTodoRepository } from '@todo/db';

interface CompleteTodoParams {
  id: string;
}

export async function completeTodo(server: FastifyInstance): Promise<void> {
  server.post<{ Params: CompleteTodoParams }>(
    '/:id/complete',
    {
      schema: {
        tags: ['todos'],
        summary: 'Mark a todo as completed',
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
              data: { type: 'object' },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CompleteTodoParams }>, reply: FastifyReply) => {
      const userId = request.user.id;
      const todoId = request.params.id;

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

      if (existing.status === 'completed') {
        // Already completed, return as-is
        return reply.status(200).send({
          data: {
            id: existing.id,
            title: existing.title,
            description: existing.description,
            status: existing.status,
            priority: existing.priority,
            dueDate: existing.dueDate?.toISOString() ?? null,
            tags: existing.tags,
            createdAt: existing.createdAt.toISOString(),
            updatedAt: existing.updatedAt.toISOString(),
            completedAt: existing.completedAt?.toISOString() ?? null,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: request.id,
          },
        });
      }

      const todo = await repository.update(todoId, { status: 'completed' });

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

export async function uncompleteTodo(server: FastifyInstance): Promise<void> {
  server.post<{ Params: CompleteTodoParams }>(
    '/:id/uncomplete',
    {
      schema: {
        tags: ['todos'],
        summary: 'Mark a completed todo as pending',
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
              data: { type: 'object' },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: CompleteTodoParams }>, reply: FastifyReply) => {
      const userId = request.user.id;
      const todoId = request.params.id;

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

      const todo = await repository.update(todoId, { status: 'pending' });

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
