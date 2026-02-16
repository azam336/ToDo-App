# FEAT-2-002: REST API

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-2-002 |
| **Phase** | II - Full Stack Web |
| **Status** | Draft |
| **Priority** | P0 - Critical |
| **Constitution Refs** | AP-01, AP-02, CN-01, CN-04, CN-05, Article VI (API Design) |
| **Architecture Ref** | ARCH-002 |

---

## Overview

### Description
Implement a RESTful API using Fastify that exposes all todo operations with authentication, validation, and OpenAPI documentation. The API follows the Constitution's API design standards (Article VI).

### User Stories

```gherkin
AS A frontend application
I WANT TO call a REST API for todo operations
SO THAT users can manage todos through the web interface

AS A developer
I WANT TO have OpenAPI documentation
SO THAT I can understand and integrate with the API

AS a system administrator
I WANT health check endpoints
SO THAT I can monitor service availability
```

### Acceptance Criteria

- [ ] AC-01: All CRUD endpoints for todos are implemented
- [ ] AC-02: All endpoints require authentication (except health/auth)
- [ ] AC-03: Request validation with proper error messages
- [ ] AC-04: Response format matches Constitution Article VI
- [ ] AC-05: OpenAPI 3.1 documentation available at /docs
- [ ] AC-06: Health check endpoints at /health and /ready
- [ ] AC-07: CORS configured for frontend origin
- [ ] AC-08: Rate limiting applied to all endpoints
- [ ] AC-09: Request logging with correlation IDs

---

## API Endpoints

### Health Endpoints

#### GET /health
Basic health check for load balancer probes.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00Z",
  "version": "1.0.0"
}
```

#### GET /ready
Readiness check including dependencies.

**Response 200:**
```json
{
  "status": "ready",
  "checks": {
    "database": "up",
    "redis": "up"
  },
  "timestamp": "2024-12-01T10:00:00Z"
}
```

**Response 503 (Not Ready):**
```json
{
  "status": "not_ready",
  "checks": {
    "database": "down",
    "redis": "up"
  }
}
```

---

### Todo Endpoints

#### GET /api/v1/todos
List todos for authenticated user with filtering, sorting, and pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Filter by status (pending, in_progress, completed) |
| `priority` | string | - | Filter by priority (low, medium, high, urgent) |
| `tags` | string | - | Comma-separated tag filter |
| `search` | string | - | Search in title/description |
| `dueBefore` | ISO date | - | Filter todos due before date |
| `dueAfter` | ISO date | - | Filter todos due after date |
| `sort` | string | `-createdAt` | Sort field (prefix `-` for desc) |
| `limit` | number | 20 | Items per page (max 100) |
| `cursor` | string | - | Pagination cursor |

**Response 200:**
```json
{
  "data": [
    {
      "id": "01HQXYZ...",
      "title": "Complete project report",
      "description": "Quarterly review",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59Z",
      "tags": ["work", "urgent"],
      "createdAt": "2024-12-01T10:00:00Z",
      "updatedAt": "2024-12-01T10:00:00Z",
      "completedAt": null
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "nextCursor": "eyJpZCI6...",
    "hasMore": true,
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

#### POST /api/v1/todos
Create a new todo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Complete project report",
  "description": "Quarterly review document",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["work", "urgent"]
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `title` | Required, 1-200 characters |
| `description` | Optional, max 2000 characters |
| `priority` | Optional, enum: low, medium, high, urgent |
| `dueDate` | Optional, ISO8601, must be future date |
| `tags` | Optional, array, max 10 items, each max 50 chars |

**Response 201:**
```json
{
  "data": {
    "id": "01HQXYZ...",
    "title": "Complete project report",
    "description": "Quarterly review document",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59Z",
    "tags": ["work", "urgent"],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z",
    "completedAt": null
  },
  "meta": {
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

**Response 400 (Validation Error):**
```json
{
  "type": "https://api.todo.app/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "/api/v1/todos",
  "errors": [
    {
      "field": "title",
      "code": "too_small",
      "message": "Title must be at least 1 character"
    },
    {
      "field": "dueDate",
      "code": "invalid_date",
      "message": "Due date cannot be in the past"
    }
  ]
}
```

---

#### GET /api/v1/todos/:id
Get a single todo by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "data": {
    "id": "01HQXYZ...",
    "title": "Complete project report",
    "description": "Quarterly review document",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59Z",
    "tags": ["work", "urgent"],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z",
    "completedAt": null
  },
  "meta": {
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

**Response 404:**
```json
{
  "type": "https://api.todo.app/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Todo with ID '01HQXYZ...' not found",
  "instance": "/api/v1/todos/01HQXYZ..."
}
```

---

#### PATCH /api/v1/todos/:id
Update a todo. Supports partial updates.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (partial):**
```json
{
  "title": "Updated title",
  "priority": "urgent"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "01HQXYZ...",
    "title": "Updated title",
    "description": "Quarterly review document",
    "status": "pending",
    "priority": "urgent",
    "dueDate": "2024-12-31T23:59:59Z",
    "tags": ["work", "urgent"],
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T12:00:00Z",
    "completedAt": null
  },
  "meta": {
    "timestamp": "2024-12-01T12:00:00Z",
    "requestId": "req_def456"
  }
}
```

**Response 422 (Business Rule Violation):**
```json
{
  "type": "https://api.todo.app/errors/business-rule",
  "title": "Business Rule Violation",
  "status": 422,
  "detail": "Cannot update a completed todo",
  "instance": "/api/v1/todos/01HQXYZ...",
  "rule": "BR-02"
}
```

---

#### DELETE /api/v1/todos/:id
Delete a todo.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 204:**
No content.

**Response 404:**
```json
{
  "type": "https://api.todo.app/errors/not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Todo with ID '01HQXYZ...' not found",
  "instance": "/api/v1/todos/01HQXYZ..."
}
```

---

#### POST /api/v1/todos/:id/complete
Mark a todo as completed.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "data": {
    "id": "01HQXYZ...",
    "title": "Complete project report",
    "status": "completed",
    "completedAt": "2024-12-01T15:00:00Z",
    ...
  },
  "meta": { ... }
}
```

---

#### POST /api/v1/todos/:id/uncomplete
Mark a completed todo as pending.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "data": {
    "id": "01HQXYZ...",
    "title": "Complete project report",
    "status": "pending",
    "completedAt": null,
    ...
  },
  "meta": { ... }
}
```

---

## Technical Design

### Server Setup

```typescript
// apps/api/src/server.ts

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
    genReqId: () => `req_${nanoid(10)}`,
  });

  // Register plugins
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  await server.register(jwt, {
    secret: process.env.JWT_SECRET!,
  });

  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Todo API',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Register routes
  await server.register(healthRoutes);
  await server.register(authRoutes, { prefix: '/api/v1/auth' });
  await server.register(todoRoutes, { prefix: '/api/v1/todos' });

  // Error handler
  server.setErrorHandler(errorHandler);

  return server;
}
```

### Route Handler Example

```typescript
// apps/api/src/routes/todos/create.ts

import { FastifyPluginAsync } from 'fastify';
import { createTodoSchema, CreateTodoInput } from '@todo/shared';
import { TodoService } from '../../services/todo-service';

const createTodoRoute: FastifyPluginAsync = async (server) => {
  server.post<{ Body: CreateTodoInput }>(
    '/',
    {
      schema: {
        tags: ['todos'],
        summary: 'Create a new todo',
        security: [{ bearerAuth: [] }],
        body: createTodoSchema,
        response: {
          201: todoResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
      preHandler: [server.authenticate],
    },
    async (request, reply) => {
      const userId = request.user.id;
      const todoService = new TodoService(/* deps */);

      const todo = await todoService.create({
        ...request.body,
        userId,
      });

      return reply.status(201).send({
        data: todo,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      });
    }
  );
};

export default createTodoRoute;
```

### Authentication Middleware

```typescript
// apps/api/src/middleware/auth.ts

import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      type: 'https://api.todo.app/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid or expired authentication token',
      instance: request.url,
    });
  }
}

// Decorate Fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string };
    user: { id: string; email: string };
  }
}
```

### Error Handler

```typescript
// apps/api/src/plugins/error-handler.ts

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import {
  TodoNotFoundError,
  ValidationError,
  BusinessRuleError,
} from '@todo/core';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
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
  }

  // Domain errors
  if (error instanceof TodoNotFoundError) {
    return reply.status(404).send({
      type: 'https://api.todo.app/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: error.message,
      instance: request.url,
    });
  }

  if (error instanceof BusinessRuleError) {
    return reply.status(422).send({
      type: 'https://api.todo.app/errors/business-rule',
      title: 'Business Rule Violation',
      status: 422,
      detail: error.message,
      instance: request.url,
      rule: error.rule,
    });
  }

  // Default server error
  return reply.status(500).send({
    type: 'https://api.todo.app/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    instance: request.url,
  });
}
```

### Rate Limiting

```typescript
// apps/api/src/plugins/rate-limit.ts

import rateLimit from '@fastify/rate-limit';

export const rateLimitConfig = {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (request: FastifyRequest) => {
    // Use user ID if authenticated, IP otherwise
    return request.user?.id || request.ip;
  },
  errorResponseBuilder: (request, context) => ({
    type: 'https://api.todo.app/errors/rate-limit',
    title: 'Too Many Requests',
    status: 429,
    detail: `Rate limit exceeded. Try again in ${context.after}`,
    instance: request.url,
  }),
};
```

---

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | API response time (P95) | < 100ms |
| NFR-02 | Throughput | 1000 req/s |
| NFR-03 | Availability | 99.9% |
| NFR-04 | Error rate | < 0.1% |

---

## Test Cases

### Unit Tests

| Test ID | Description |
|---------|-------------|
| UT-API-001 | Create todo with valid data |
| UT-API-002 | Create todo with invalid data returns 400 |
| UT-API-003 | Get todo returns correct data |
| UT-API-004 | Get non-existent todo returns 404 |
| UT-API-005 | Update todo with partial data |
| UT-API-006 | Update completed todo returns 422 |
| UT-API-007 | Delete todo returns 204 |
| UT-API-008 | List todos with filters |
| UT-API-009 | List todos with pagination |

### Integration Tests

| Test ID | Description |
|---------|-------------|
| IT-API-001 | Full CRUD lifecycle |
| IT-API-002 | Authentication required |
| IT-API-003 | User isolation (can't access other's todos) |
| IT-API-004 | Rate limiting enforced |
| IT-API-005 | Health endpoints respond correctly |

---

## Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `fastify` | HTTP server | ^4.25.0 |
| `@fastify/cors` | CORS support | ^8.4.0 |
| `@fastify/jwt` | JWT authentication | ^8.0.0 |
| `@fastify/swagger` | OpenAPI generation | ^8.12.0 |
| `@fastify/swagger-ui` | Swagger UI | ^2.0.0 |
| `@fastify/rate-limit` | Rate limiting | ^9.0.0 |
| `zod` | Validation | ^3.23.0 |
| `pino` | Logging | ^8.17.0 |

---

## File Mapping

| File Path | Task ID |
|-----------|---------|
| `apps/api/src/server.ts` | TASK-2-002-01 |
| `apps/api/src/config/` | TASK-2-002-02 |
| `apps/api/src/plugins/*.ts` | TASK-2-002-03 |
| `apps/api/src/middleware/auth.ts` | TASK-2-002-04 |
| `apps/api/src/routes/health.ts` | TASK-2-002-05 |
| `apps/api/src/routes/todos/*.ts` | TASK-2-002-06 |
| `apps/api/src/services/todo-service.ts` | TASK-2-002-07 |
| `apps/api/src/__tests__/` | TASK-2-002-08 |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
