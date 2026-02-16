import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository, SessionRepository } from '@todo/db';
import { AuthService } from '../../services/auth-service.js';
import { jwtConfig } from '../../config/index.js';

export async function logoutRoute(server: FastifyInstance): Promise<void> {
  server.post(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        summary: 'Logout and invalidate refresh token',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
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
      const refreshToken = request.cookies[jwtConfig.cookie.name];

      if (refreshToken) {
        const userRepo = new UserRepository();
        const sessionRepo = new SessionRepository();
        const authService = new AuthService(userRepo, sessionRepo, server.jwt);

        await authService.logout(refreshToken);
      }

      // Clear refresh token cookie
      reply.clearCookie(jwtConfig.cookie.name, {
        path: jwtConfig.cookie.path,
      });

      return reply.status(200).send({
        data: {
          message: 'Logged out successfully',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      });
    }
  );
}
