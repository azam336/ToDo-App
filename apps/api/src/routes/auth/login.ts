import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { loginSchema } from '@todo/shared';
import { UserRepository, SessionRepository } from '@todo/db';
import { AuthService, UnauthorizedError } from '../../services/auth-service.js';
import { jwtConfig } from '../../config/index.js';

interface LoginBody {
  email: string;
  password: string;
}

export async function loginRoute(server: FastifyInstance): Promise<void> {
  server.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'Login with email and password',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
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
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      // Validate input
      const parsed = loginSchema.safeParse(request.body);
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

      try {
        const userRepo = new UserRepository();
        const sessionRepo = new SessionRepository();
        const authService = new AuthService(userRepo, sessionRepo, server.jwt);

        const result = await authService.login(parsed.data);

        // Set refresh token cookie
        reply.setCookie(jwtConfig.cookie.name, result.tokens.refreshToken, {
          httpOnly: jwtConfig.cookie.httpOnly,
          secure: jwtConfig.cookie.secure,
          sameSite: jwtConfig.cookie.sameSite,
          path: jwtConfig.cookie.path,
          maxAge: jwtConfig.cookie.maxAge,
        });

        return reply.status(200).send({
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
            },
            tokens: {
              accessToken: result.tokens.accessToken,
              expiresIn: result.tokens.expiresIn,
            },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: request.id,
          },
        });
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return reply.status(401).send({
            type: 'https://api.todo.app/errors/unauthorized',
            title: 'Unauthorized',
            status: 401,
            detail: 'Invalid email or password',
            instance: request.url,
          });
        }
        throw error;
      }
    }
  );
}
