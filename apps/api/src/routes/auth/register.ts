import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema } from '@todo/shared';
import { UserRepository, SessionRepository } from '@todo/db';
import { AuthService, ConflictError } from '../../services/auth-service.js';
import { jwtConfig } from '../../config/index.js';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export async function registerRoute(server: FastifyInstance): Promise<void> {
  server.post<{ Body: RegisterBody }>(
    '/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 1, maxLength: 100 },
          },
        },
        response: {
          201: {
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
                      createdAt: { type: 'string' },
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
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  requestId: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      // Validate input
      const parsed = registerSchema.safeParse(request.body);
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

        const result = await authService.register(parsed.data);

        // Set refresh token cookie
        reply.setCookie(jwtConfig.cookie.name, result.tokens.refreshToken, {
          httpOnly: jwtConfig.cookie.httpOnly,
          secure: jwtConfig.cookie.secure,
          sameSite: jwtConfig.cookie.sameSite,
          path: jwtConfig.cookie.path,
          maxAge: jwtConfig.cookie.maxAge,
        });

        return reply.status(201).send({
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              createdAt: result.user.createdAt.toISOString(),
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
        if (error instanceof ConflictError) {
          return reply.status(409).send({
            type: 'https://api.todo.app/errors/conflict',
            title: 'Conflict',
            status: 409,
            detail: error.message,
            instance: request.url,
          });
        }
        throw error;
      }
    }
  );
}
