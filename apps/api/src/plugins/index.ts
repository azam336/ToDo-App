import type { FastifyInstance } from 'fastify';
import { registerCors } from './cors.js';
import { registerJwt } from './jwt.js';
import { registerSwagger } from './swagger.js';
import { registerRateLimit } from './rate-limit.js';
import { errorHandler } from './error-handler.js';

export async function registerPlugins(server: FastifyInstance): Promise<void> {
  // Register plugins in order
  await registerCors(server);
  await registerJwt(server);
  await registerSwagger(server);
  await registerRateLimit(server);

  // Set global error handler
  server.setErrorHandler(errorHandler);
}

export { errorHandler };
