import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkDatabaseHealth } from '@todo/db';

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  // Basic health check
  server.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Basic health check',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              version: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    }
  );

  // Readiness check with dependencies
  server.get(
    '/ready',
    {
      schema: {
        tags: ['health'],
        summary: 'Readiness check with dependency status',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              checks: {
                type: 'object',
                properties: {
                  database: { type: 'string' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
          503: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              checks: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dbHealthy = await checkDatabaseHealth();

      const checks = {
        database: dbHealthy ? 'up' : 'down',
      };

      const allHealthy = dbHealthy;

      const response = {
        status: allHealthy ? 'ready' : 'not_ready',
        checks,
        timestamp: new Date().toISOString(),
      };

      return reply.status(allHealthy ? 200 : 503).send(response);
    }
  );
}
