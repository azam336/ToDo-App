import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyRequest } from 'fastify';

export async function registerRateLimit(server: FastifyInstance): Promise<void> {
  await server.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request: FastifyRequest) => {
      // Use user ID if authenticated, IP otherwise
      const user = (request as any).user;
      return user?.id ?? request.ip;
    },
    errorResponseBuilder: (request, context) => ({
      type: 'https://api.todo.app/errors/rate-limit',
      title: 'Too Many Requests',
      status: 429,
      detail: `Rate limit exceeded. Try again in ${context.after}`,
      instance: request.url,
    }),
  });
}
