import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository } from '@todo/db';

export async function meRoute(server: FastifyInstance): Promise<void> {
  server.get(
    '/me',
    {
      schema: {
        tags: ['auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  createdAt: { type: 'string' },
                },
              },
              meta: { type: 'object' },
            },
          },
        },
      },
      preHandler: [server.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.id;

      const userRepo = new UserRepository();
      const user = await userRepo.findById(userId);

      if (!user) {
        return reply.status(404).send({
          type: 'https://api.todo.app/errors/not-found',
          title: 'Not Found',
          status: 404,
          detail: 'User not found',
          instance: request.url,
        });
      }

      return reply.status(200).send({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      });
    }
  );
}
