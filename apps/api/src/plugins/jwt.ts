import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { jwtConfig } from '../config/index.js';

export async function registerJwt(server: FastifyInstance): Promise<void> {
  // Register cookie plugin for refresh tokens
  await server.register(cookie);

  // Register JWT plugin
  await server.register(jwt, {
    secret: jwtConfig.access.secret,
    sign: {
      expiresIn: jwtConfig.access.expiresIn,
    },
  });

  // Add authenticate decorator
  server.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          type: 'https://api.todo.app/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Invalid or expired authentication token',
          instance: request.url,
        });
      }
    }
  );
}

// Type declarations for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      jti: string;
    };
    user: {
      id: string;
      email: string;
    };
  }
}
