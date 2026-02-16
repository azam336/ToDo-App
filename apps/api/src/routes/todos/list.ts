import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { todoFiltersSchema } from '@todo/shared';
import { PostgresTodoRepository } from '@todo/db';

export async function listTodos(server: FastifyInstance): Promise<void> {
  server.get(
    '/',
    {
      schema: {
        tags: ['todos'],
        summary: 'List todos with optional filters',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            tags: { type: 'string' },
            search: { type: 'string' },
            dueBefore: { type: 'string', format: 'date-time' },
            dueAfter: { type: 'string', format: 'date-time' },
            sort: { type: 'string' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            cursor: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                    priority: { type: 'string' },
                    dueDate: { type: 'string', nullable: true },
                    tags: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    completedAt: { type: 'string', nullable: true },
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
      const userId = request.user.id;

      // Validate filters
      const parsed = todoFiltersSchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          type: 'https://api.todo.app/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid query parameters',
          instance: request.url,
          errors: parsed.error.errors.map((e) => ({
            field: e.path.join('.'),
            code: e.code,
            message: e.message,
          })),
        });
      }

      const filters = parsed.data;
      const repository = new PostgresTodoRepository(userId);

      // Build query
      const query: Parameters<typeof repository.findAll>[0] = {};

      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.search) query.search = filters.search;
      if (filters.dueBefore) query.dueBefore = new Date(filters.dueBefore);
      if (filters.dueAfter) query.dueAfter = new Date(filters.dueAfter);
      if (filters.limit) query.limit = filters.limit;

      // Parse sort
      if (filters.sort) {
        const desc = filters.sort.startsWith('-');
        const field = desc ? filters.sort.slice(1) : filters.sort;
        query.sort = {
          field: field as 'createdAt' | 'dueDate' | 'priority' | 'title',
          order: desc ? 'desc' : 'asc',
        };
      }

      const todos = await repository.findAll(query);
      const total = await repository.count(query);

      return reply.status(200).send({
        data: todos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          dueDate: todo.dueDate?.toISOString() ?? null,
          tags: todo.tags,
          createdAt: todo.createdAt.toISOString(),
          updatedAt: todo.updatedAt.toISOString(),
          completedAt: todo.completedAt?.toISOString() ?? null,
        })),
        meta: {
          total,
          limit: filters.limit ?? 20,
          hasMore: todos.length === (filters.limit ?? 20),
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      });
    }
  );
}
