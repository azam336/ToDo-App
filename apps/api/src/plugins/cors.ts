import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';

export async function registerCors(server: FastifyInstance): Promise<void> {
  await server.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
