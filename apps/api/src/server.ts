import Fastify, { type FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import { config } from './config/index.js';
import { registerPlugins } from './plugins/index.js';
import { registerRoutes } from './routes/index.js';
import { closeDatabaseConnection } from '@todo/db';

export async function buildServer(): Promise<FastifyInstance> {
  // Build logger config without conditional undefined (exactOptionalPropertyTypes)
  const loggerConfig = config.NODE_ENV === 'development'
    ? {
        level: config.LOG_LEVEL,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : { level: config.LOG_LEVEL };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const server: FastifyInstance = Fastify({
    logger: loggerConfig as any,
    genReqId: () => `req_${nanoid(10)}`,
  });

  // Register plugins
  await registerPlugins(server);

  // Register routes
  await registerRoutes(server);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);

    try {
      await server.close();
      await closeDatabaseConnection();
      server.log.info('Server closed successfully');
      process.exit(0);
    } catch (err) {
      server.log.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

export async function startServer() {
  const server = await buildServer();

  try {
    await server.listen({
      port: config.PORT,
      host: config.HOST,
    });

    server.log.info(`Server running at http://${config.HOST}:${config.PORT}`);
    server.log.info(`API docs available at http://${config.HOST}:${config.PORT}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  return server;
}
