import type { FastifyInstance } from 'fastify';
import { registerRoute } from './register.js';
import { loginRoute } from './login.js';
import { refreshRoute } from './refresh.js';
import { logoutRoute } from './logout.js';
import { meRoute } from './me.js';

export async function authRoutes(server: FastifyInstance): Promise<void> {
  await server.register(registerRoute);
  await server.register(loginRoute);
  await server.register(refreshRoute);
  await server.register(logoutRoute);
  await server.register(meRoute);
}
