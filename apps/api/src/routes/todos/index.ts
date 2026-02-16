import type { FastifyInstance } from 'fastify';
import { listTodos } from './list.js';
import { createTodo } from './create.js';
import { getTodo } from './get.js';
import { updateTodo } from './update.js';
import { deleteTodo } from './delete.js';
import { completeTodo, uncompleteTodo } from './complete.js';

export async function todoRoutes(server: FastifyInstance): Promise<void> {
  // Apply authentication to all routes in this plugin
  server.addHook('preHandler', server.authenticate);

  // Register routes
  await server.register(listTodos);
  await server.register(createTodo);
  await server.register(getTodo);
  await server.register(updateTodo);
  await server.register(deleteTodo);
  await server.register(completeTodo);
  await server.register(uncompleteTodo);
}
