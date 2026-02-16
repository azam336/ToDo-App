# ARCH-002: Phase II Full Stack Architecture

## Metadata
| Field | Value |
|-------|-------|
| **Document ID** | ARCH-002 |
| **Phase** | II - Full Stack Web |
| **Status** | Draft |
| **Constitution Refs** | AP-01, AP-02, AP-03, CN-01, CN-02, CN-03, CN-04, CN-05, DP-01, DP-02, DP-03, DP-04 |

---

## Executive Summary

Phase II evolves the Todo System from a CLI application to a production-ready full-stack web application. The design prioritizes:

1. **API-First Design** - RESTful API with OpenAPI documentation
2. **Clean Separation** - Frontend, Backend, and Database as distinct layers
3. **Reuse of Core** - Leverage `@todo/core` domain logic unchanged
4. **Multi-User Support** - JWT-based authentication and user isolation
5. **Real-Time Updates** - WebSocket support for live sync

---

## Architecture Overview

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│                                 apps/web                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │   Pages/      │  │  Components/  │  │    Hooks/     │  │   Store/    │  │
│  │   App Router  │  │   UI Library  │  │  API Client   │  │   State     │  │
│  └───────┬───────┘  └───────────────┘  └───────┬───────┘  └─────────────┘  │
│          │                                      │                           │
│          └──────────────────┬───────────────────┘                           │
│                             │                                               │
│                      ┌──────▼──────┐                                        │
│                      │ API Client  │ (fetch / React Query)                  │
│                      └──────┬──────┘                                        │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Fastify)                               │
│                                 apps/api                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │   Routes/     │  │  Middleware/  │  │   Plugins/    │  │  WebSocket  │  │
│  │   Handlers    │  │  Auth/CORS    │  │  Swagger/JWT  │  │   Server    │  │
│  └───────┬───────┘  └───────┬───────┘  └───────────────┘  └──────┬──────┘  │
│          │                  │                                     │         │
│          └──────────────────┴─────────────────────────────────────┘         │
│                                      │                                       │
│                              ┌───────▼───────┐                               │
│                              │   Services    │ (from @todo/core + new)       │
│                              └───────┬───────┘                               │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PACKAGES                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  packages/core  │    │  packages/db    │    │ packages/shared │         │
│  │  (Domain Logic) │    │  (Drizzle ORM)  │    │  (Types/Utils)  │         │
│  └────────┬────────┘    └────────┬────────┘    └─────────────────┘         │
│           │                      │                                          │
│           └──────────────────────┘                                          │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INFRASTRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌─────────────────┐                            │
│  │  PostgreSQL 16  │         │    Redis 7      │                            │
│  │  (Primary DB)   │         │ (Session/Cache) │                            │
│  └─────────────────┘         └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### Frontend Layer (`apps/web`)

**Purpose:** React-based SPA with server-side rendering capabilities

| Component | Responsibility |
|-----------|---------------|
| `app/` | Next.js App Router pages and layouts |
| `components/` | Reusable UI components (Tailwind CSS) |
| `hooks/` | Custom React hooks for data fetching and state |
| `lib/` | API client, utilities, validation |
| `store/` | Client-side state management |

**Technology Stack:**
- Next.js 14 with App Router
- React 18 with Server Components
- Tailwind CSS for styling
- React Query for server state
- Zod for client-side validation

**Rules:**
- Server components for initial render
- Client components for interactivity
- API calls via React Query
- Form validation with react-hook-form + Zod

---

### Backend Layer (`apps/api`)

**Purpose:** RESTful API server with authentication and real-time support

| Component | Responsibility |
|-----------|---------------|
| `routes/` | API route definitions and handlers |
| `middleware/` | Authentication, authorization, validation |
| `plugins/` | Fastify plugins (Swagger, JWT, CORS) |
| `services/` | Business logic orchestration |
| `websocket/` | Real-time event broadcasting |

**Technology Stack:**
- Fastify 4.x for HTTP server
- @fastify/jwt for authentication
- @fastify/swagger for API documentation
- @fastify/websocket for real-time
- @fastify/cors for cross-origin requests

**Rules:**
- All routes documented with OpenAPI
- Request/response validation with Zod
- Consistent error responses (RFC 7807)
- Health and readiness endpoints required

---

### Database Layer (`packages/db`)

**Purpose:** Type-safe database access with migrations

| Component | Responsibility |
|-----------|---------------|
| `schema/` | Drizzle schema definitions |
| `migrations/` | Versioned database migrations |
| `repositories/` | Data access implementations |
| `seeds/` | Development seed data |

**Technology Stack:**
- Drizzle ORM for type-safe queries
- PostgreSQL 16 as primary database
- drizzle-kit for migrations

**Rules:**
- All schema changes via migrations
- Migrations are reversible
- No raw SQL in application code
- Repository pattern for data access

---

### Shared Package (`packages/shared`)

**Purpose:** Common types and utilities shared between frontend and backend

| Component | Responsibility |
|-----------|---------------|
| `types/` | API request/response types |
| `validation/` | Shared Zod schemas |
| `utils/` | Common utility functions |
| `constants/` | Shared constants |

---

## Package Structure

### apps/web (Frontend)

```
apps/web/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Authenticated layout
│   │   ├── page.tsx            # Todo dashboard
│   │   └── todos/
│   │       ├── page.tsx        # Todo list
│   │       ├── [id]/page.tsx   # Todo detail
│   │       └── new/page.tsx    # Create todo
│   └── api/                    # API routes (if needed)
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── todo/                   # Todo-specific components
│   │   ├── todo-card.tsx
│   │   ├── todo-form.tsx
│   │   ├── todo-list.tsx
│   │   ├── todo-filters.tsx
│   │   └── priority-badge.tsx
│   ├── layout/                 # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── auth/                   # Auth components
│       ├── login-form.tsx
│       └── register-form.tsx
├── hooks/
│   ├── use-todos.ts            # Todo CRUD hooks
│   ├── use-auth.ts             # Auth hooks
│   └── use-websocket.ts        # Real-time hooks
├── lib/
│   ├── api-client.ts           # HTTP client
│   ├── auth.ts                 # Auth utilities
│   └── utils.ts                # General utilities
├── store/
│   └── auth-store.ts           # Auth state
└── __tests__/
    ├── components/
    └── hooks/
```

### apps/api (Backend)

```
apps/api/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                # Entry point
│   ├── server.ts               # Fastify server setup
│   ├── config/
│   │   ├── index.ts            # Configuration loader
│   │   └── env.ts              # Environment validation
│   ├── plugins/
│   │   ├── index.ts            # Plugin registration
│   │   ├── swagger.ts          # OpenAPI docs
│   │   ├── jwt.ts              # JWT authentication
│   │   ├── cors.ts             # CORS configuration
│   │   └── error-handler.ts    # Global error handling
│   ├── middleware/
│   │   ├── auth.ts             # Authentication middleware
│   │   ├── validate.ts         # Request validation
│   │   └── rate-limit.ts       # Rate limiting
│   ├── routes/
│   │   ├── index.ts            # Route registration
│   │   ├── health.ts           # Health check endpoints
│   │   ├── auth/
│   │   │   ├── index.ts
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   ├── refresh.ts
│   │   │   └── logout.ts
│   │   └── todos/
│   │       ├── index.ts
│   │       ├── create.ts
│   │       ├── list.ts
│   │       ├── get.ts
│   │       ├── update.ts
│   │       └── delete.ts
│   ├── services/
│   │   ├── auth-service.ts     # Authentication logic
│   │   ├── user-service.ts     # User management
│   │   └── todo-service.ts     # Todo operations (extends core)
│   ├── websocket/
│   │   ├── index.ts            # WebSocket setup
│   │   └── handlers.ts         # Event handlers
│   └── __tests__/
│       ├── routes/
│       └── services/
└── drizzle.config.ts
```

### packages/db (Database)

```
packages/db/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── src/
│   ├── index.ts                # Public exports
│   ├── client.ts               # Database client
│   ├── schema/
│   │   ├── index.ts
│   │   ├── users.ts            # User table
│   │   ├── todos.ts            # Todo table
│   │   └── sessions.ts         # Session table
│   ├── repositories/
│   │   ├── index.ts
│   │   ├── user-repository.ts
│   │   ├── todo-repository.ts  # Implements TodoRepository port
│   │   └── session-repository.ts
│   └── migrations/
│       ├── 0000_initial.sql
│       └── meta/
└── seeds/
    └── dev-seed.ts
```

### packages/shared

```
packages/shared/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── api.ts              # API types
│   │   ├── auth.ts             # Auth types
│   │   └── todo.ts             # Todo API types
│   ├── validation/
│   │   ├── auth.ts             # Auth schemas
│   │   └── todo.ts             # Todo schemas
│   └── utils/
│       └── date.ts             # Date utilities
```

---

## API Design

### API Versioning

```
Base URL: /api/v1
```

### Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/register` | Create account | No |
| `POST` | `/api/v1/auth/login` | Authenticate | No |
| `POST` | `/api/v1/auth/refresh` | Refresh token | Yes |
| `POST` | `/api/v1/auth/logout` | Invalidate session | Yes |
| `GET` | `/api/v1/todos` | List todos | Yes |
| `POST` | `/api/v1/todos` | Create todo | Yes |
| `GET` | `/api/v1/todos/:id` | Get todo | Yes |
| `PATCH` | `/api/v1/todos/:id` | Update todo | Yes |
| `DELETE` | `/api/v1/todos/:id` | Delete todo | Yes |
| `POST` | `/api/v1/todos/:id/complete` | Complete todo | Yes |
| `GET` | `/health` | Health check | No |
| `GET` | `/ready` | Readiness check | No |

### Request/Response Examples

**Create Todo Request:**
```http
POST /api/v1/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project report",
  "description": "Quarterly review document",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59Z",
  "tags": ["work", "urgent"]
}
```

**Success Response:**
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

**Error Response:**
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
      "message": "Title is required"
    }
  ]
}
```

---

## Authentication Flow

### JWT Token Strategy

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  User   │      │ Frontend│      │  API    │      │   DB    │
└────┬────┘      └────┬────┘      └────┬────┘      └────┬────┘
     │                │                │                │
     │  1. Login      │                │                │
     │───────────────▶│                │                │
     │                │  2. POST /auth/login            │
     │                │───────────────▶│                │
     │                │                │  3. Verify     │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │  4. User data  │
     │                │                │◀───────────────│
     │                │                │                │
     │                │  5. JWT tokens │                │
     │                │◀───────────────│                │
     │  6. Store tokens                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │  7. API request│                │                │
     │───────────────▶│                │                │
     │                │  8. Bearer token               │
     │                │───────────────▶│                │
     │                │                │  9. Verify JWT │
     │                │                │───────────────▶│
     │                │  10. Response  │                │
     │◀───────────────│◀───────────────│                │
```

### Token Types

| Token | Location | Expiry | Purpose |
|-------|----------|--------|---------|
| Access Token | Memory/Header | 15 min | API authentication |
| Refresh Token | httpOnly Cookie | 7 days | Token renewal |

### Password Storage

- Algorithm: Argon2id
- Salt: Auto-generated per password
- Configuration: OWASP recommended parameters

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────────┐         ┌──────────────────────┐
│        users         │         │        todos         │
├──────────────────────┤         ├──────────────────────┤
│ id          UUID PK  │◀────────│ user_id    UUID FK   │
│ email       VARCHAR  │         │ id         UUID PK   │
│ password    VARCHAR  │         │ title      VARCHAR   │
│ name        VARCHAR  │         │ description TEXT     │
│ created_at  TIMESTMP │         │ status     ENUM      │
│ updated_at  TIMESTMP │         │ priority   ENUM      │
└──────────────────────┘         │ due_date   TIMESTMP  │
                                 │ tags       VARCHAR[] │
                                 │ created_at TIMESTMP  │
                                 │ updated_at TIMESTMP  │
                                 │ completed_at TIMESTMP│
                                 └──────────────────────┘
                                           │
┌──────────────────────┐                   │
│      sessions        │                   │
├──────────────────────┤                   │
│ id          UUID PK  │                   │
│ user_id     UUID FK  │───────────────────┘
│ token_hash  VARCHAR  │
│ expires_at  TIMESTMP │
│ created_at  TIMESTMP │
└──────────────────────┘
```

### Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | users_email_idx | email | Login lookup |
| todos | todos_user_id_idx | user_id | User's todos |
| todos | todos_user_status_idx | user_id, status | Filtered lists |
| todos | todos_user_due_idx | user_id, due_date | Due date sorting |
| sessions | sessions_token_idx | token_hash | Token validation |

---

## Real-Time Architecture

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `todo:created` | Server → Client | Todo | New todo created |
| `todo:updated` | Server → Client | Todo | Todo modified |
| `todo:deleted` | Server → Client | { id } | Todo removed |
| `todo:completed` | Server → Client | Todo | Todo completed |

### Connection Flow

```typescript
// Client connects with JWT
ws://api.todo.app/ws?token=<jwt>

// Server validates and subscribes to user channel
// Events broadcast to all user's connected clients
```

---

## Security Considerations

### Input Validation

- All inputs validated with Zod schemas
- Validation at API boundary only
- Parameterized queries via Drizzle (no SQL injection)

### Authentication

- JWT with RS256 signing
- Short-lived access tokens (15 min)
- Refresh token rotation
- Secure cookie flags (httpOnly, secure, sameSite)

### Authorization

- User can only access own todos (BR-04)
- User ID extracted from JWT, never from request body
- Middleware enforces authentication on protected routes

### Rate Limiting

- 100 requests/minute per IP for unauthenticated
- 1000 requests/minute per user for authenticated
- Separate limits for auth endpoints (10/minute)

---

## Observability

### Logging

```typescript
// Structured JSON logging
{
  "level": "info",
  "timestamp": "2024-12-01T10:00:00Z",
  "requestId": "req_abc123",
  "userId": "usr_xyz789",
  "method": "POST",
  "path": "/api/v1/todos",
  "statusCode": 201,
  "responseTime": 45
}
```

### Health Endpoints

**GET /health** - Basic health check
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00Z"
}
```

**GET /ready** - Readiness with dependencies
```json
{
  "status": "ready",
  "checks": {
    "database": "up",
    "redis": "up"
  }
}
```

---

## Development Workflow

### Local Development

```bash
# Start all services
pnpm dev

# This runs:
# - apps/web: Next.js dev server (port 3000)
# - apps/api: Fastify dev server (port 3001)
# - PostgreSQL: Docker container (port 5432)
# - Redis: Docker container (port 6379)
```

### Environment Variables

```env
# apps/api/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/todo
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_ISSUER=todo-api

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Migration from Phase I

### Core Package Reuse

The `@todo/core` package remains unchanged. Phase II adds:

1. **New Repository Implementation**
   - `PostgresTodoRepository` implements `TodoRepository` port
   - Replaces `InMemoryTodoRepository`

2. **Extended Service Layer**
   - `TodoService` from core used directly
   - New `AuthService` and `UserService` added

3. **Multi-User Context**
   - `userId` added to all repository queries
   - User context injected via middleware

### Adapter Pattern

```typescript
// Phase I: In-memory
const repository = new InMemoryTodoRepository();

// Phase II: PostgreSQL
const repository = new PostgresTodoRepository(db);

// Same interface, different implementation
const todoService = new TodoService(repository, idGenerator, clock);
```

---

## Testing Strategy

### Test Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲           10% - Playwright
                 ╱──────╲
                ╱        ╲
               ╱Integration╲       30% - API tests, DB tests
              ╱────────────╲
             ╱              ╲
            ╱     Unit       ╲     60% - Components, Hooks, Services
           ╱──────────────────╲
```

### Test Types

| Layer | Framework | Scope |
|-------|-----------|-------|
| Frontend Unit | Vitest + Testing Library | Components, Hooks |
| Backend Unit | Vitest | Services, Utilities |
| API Integration | Vitest + Supertest | Route handlers |
| Database | Vitest | Repository queries |
| E2E | Playwright | Full user flows |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response (P95) | < 100ms | APM |
| Page Load (LCP) | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Database Query | < 50ms | Query logs |
| WebSocket Latency | < 100ms | Custom metrics |

---

## Decisions Log

| ID | Decision | Rationale | Alternatives Considered |
|----|----------|-----------|------------------------|
| D-010 | Use Next.js App Router | Server components, streaming, modern DX | Pages Router, Remix |
| D-011 | Use Fastify over Express | Performance, TypeScript, schema validation | Express, Hono |
| D-012 | Use Drizzle ORM | Type-safe, SQL-like, good DX | Prisma, TypeORM |
| D-013 | Use React Query | Server state management, caching | SWR, RTK Query |
| D-014 | JWT for auth | Stateless, scalable | Session-based |
| D-015 | PostgreSQL for DB | ACID, JSON support, mature | MySQL, SQLite |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
