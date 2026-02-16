import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.js';
import { authRoutes } from './auth/index.js';
import { todoRoutes } from './todos/index.js';

export async function registerRoutes(server: FastifyInstance): Promise<void> {
  // Health routes (no prefix)
  await server.register(healthRoutes);

  // Auth routes
  await server.register(authRoutes, { prefix: '/api/v1/auth' });

  // Todo routes
  await server.register(todoRoutes, { prefix: '/api/v1/todos' });
}
