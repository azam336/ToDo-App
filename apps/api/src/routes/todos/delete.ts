import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PostgresTodoRepository } from '@todo/db';

interface DeleteTodoParams {
  id: string;
}

export async function deleteTodo(server: FastifyInstance): Promise<void> {
  server.delete<{ Params: DeleteTodoParams }>(
    '/:id',
    {
      schema: {
        tags: ['todos'],
        summary: 'Delete a todo',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          204: {
            type: 'null',
            description: 'Todo deleted successfully',
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: DeleteTodoParams }>, reply: FastifyReply) => {
      const userId = request.user.id;
      const todoId = request.params.id;

      const repository = new PostgresTodoRepository(userId);

      // Check if todo exists
      const exists = await repository.exists(todoId);
      if (!exists) {
        return reply.status(404).send({
          type: 'https://api.todo.app/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: `Todo with ID '${todoId}' not found`,
          instance: request.url,
        });
      }

      await repository.delete(todoId);

      return reply.status(204).send();
    }
  );
}
