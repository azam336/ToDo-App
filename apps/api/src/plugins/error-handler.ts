import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { TodoNotFoundError, ValidationError, BusinessRuleError } from '@todo/core';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error);

  // Zod validation errors
  if (error instanceof ZodError) {
    reply.status(400).send({
      type: 'https://api.todo.app/errors/validation',
      title: 'Validation Error',
      status: 400,
      detail: 'Request validation failed',
      instance: request.url,
      errors: error.errors.map((e) => ({
        field: e.path.join('.'),
        code: e.code,
        message: e.message,
      })),
    });
    return;
  }

  // Domain errors
  if (error instanceof TodoNotFoundError) {
    reply.status(404).send({
      type: 'https://api.todo.app/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: error.message,
      instance: request.url,
    });
    return;
  }

  if (error instanceof ValidationError) {
    reply.status(400).send({
      type: 'https://api.todo.app/errors/validation',
      title: 'Validation Error',
      status: 400,
      detail: error.message,
      instance: request.url,
    });
    return;
  }

  if (error instanceof BusinessRuleError) {
    reply.status(422).send({
      type: 'https://api.todo.app/errors/business-rule',
      title: 'Business Rule Violation',
      status: 422,
      detail: error.message,
      instance: request.url,
      rule: error.rule,
    });
    return;
  }

  // Fastify validation errors
  if (error.validation) {
    reply.status(400).send({
      type: 'https://api.todo.app/errors/validation',
      title: 'Validation Error',
      status: 400,
      detail: 'Request validation failed',
      instance: request.url,
      errors: error.validation.map((v) => ({
        field: v.instancePath.replace(/^\//, '').replace(/\//g, '.') || v.params?.['missingProperty'] || 'unknown',
        code: v.keyword ?? 'validation',
        message: v.message ?? 'Invalid value',
      })),
    });
    return;
  }

  // Known error with status code
  if (error.statusCode && error.statusCode < 500) {
    reply.status(error.statusCode).send({
      type: `https://api.todo.app/errors/${error.code?.toLowerCase() ?? 'error'}`,
      title: error.name,
      status: error.statusCode,
      detail: error.message,
      instance: request.url,
    });
    return;
  }

  // Default server error
  reply.status(500).send({
    type: 'https://api.todo.app/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    instance: request.url,
  });
}
