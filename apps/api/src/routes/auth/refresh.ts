import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository, SessionRepository } from '@todo/db';
import { AuthService, UnauthorizedError } from '../../services/auth-service.js';
import { jwtConfig } from '../../config/index.js';

export async function refreshRoute(server: FastifyInstance): Promise<void> {
  server.post(
    '/refresh',
    {
      schema: {
        tags: ['auth'],
        summary: 'Refresh access token',
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  tokens: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      expiresIn: { type: 'number' },
                    },
                  },
                },
              },
              meta: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const refreshToken = request.cookies[jwtConfig.cookie.name];

      if (!refreshToken) {
        return reply.status(401).send({
          type: 'https://api.todo.app/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'No refresh token provided',
          instance: request.url,
        });
      }

      try {
        const userRepo = new UserRepository();
        const sessionRepo = new SessionRepository();
        const authService = new AuthService(userRepo, sessionRepo, server.jwt);

        const tokens = await authService.refresh(refreshToken);

        // Set new refresh token cookie
        reply.setCookie(jwtConfig.cookie.name, tokens.refreshToken, {
          httpOnly: jwtConfig.cookie.httpOnly,
          secure: jwtConfig.cookie.secure,
          sameSite: jwtConfig.cookie.sameSite,
          path: jwtConfig.cookie.path,
          maxAge: jwtConfig.cookie.maxAge,
        });

        return reply.status(200).send({
          data: {
            tokens: {
              accessToken: tokens.accessToken,
              expiresIn: tokens.expiresIn,
            },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: request.id,
          },
        });
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          // Clear the invalid cookie
          reply.clearCookie(jwtConfig.cookie.name, {
            path: jwtConfig.cookie.path,
          });

          return reply.status(401).send({
            type: 'https://api.todo.app/errors/unauthorized',
            title: 'Unauthorized',
            status: 401,
            detail: error.message,
            instance: request.url,
          });
        }
        throw error;
      }
    }
  );
}
