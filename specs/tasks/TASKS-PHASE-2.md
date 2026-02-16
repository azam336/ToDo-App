# Phase II Task Breakdown

## Metadata
| Field | Value |
|-------|-------|
| **Phase** | II - Full Stack Web |
| **Total Tasks** | 58 |
| **Estimated Effort** | 8-10 days |
| **Status** | Pending Approval |
| **Prerequisites** | Phase I Complete |

---

## Task Dependency Graph

```
TASK-2-000 (Setup)
    │
    ├──▶ TASK-2-003 (Database Schema - FEAT-2-003)
    │         │
    │         └──▶ TASK-2-004 (Authentication - FEAT-2-004)
    │                   │
    │                   └──▶ TASK-2-002 (REST API - FEAT-2-002)
    │                             │
    │                             └──▶ TASK-2-001 (Web UI - FEAT-2-001)
    │
    └──▶ TASK-2-005 (Integration & E2E)

All ──▶ TASK-2-006 (Final Verification)
```

---

## TASK-2-000: Project Setup

### TASK-2-000-01: Setup packages/db Package
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | Phase I Complete |

**Deliverables:**
- [ ] Create `packages/db/package.json`
- [ ] Create `packages/db/tsconfig.json`
- [ ] Add dependencies (drizzle-orm, pg, drizzle-kit)
- [ ] Create `packages/db/drizzle.config.ts`
- [ ] Create directory structure (schema/, migrations/, repositories/)

**Files:**
- `packages/db/package.json`
- `packages/db/tsconfig.json`
- `packages/db/drizzle.config.ts`
- `packages/db/src/index.ts`

---

### TASK-2-000-02: Setup packages/shared Package
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | - |

**Deliverables:**
- [ ] Create `packages/shared/package.json`
- [ ] Create `packages/shared/tsconfig.json`
- [ ] Create directory structure (types/, validation/, utils/)

**Files:**
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`

---

### TASK-2-000-03: Setup apps/api Package
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-000-01, TASK-2-000-02 |

**Deliverables:**
- [ ] Create `apps/api/package.json`
- [ ] Create `apps/api/tsconfig.json`
- [ ] Add dependencies (fastify, @fastify/*, argon2, etc.)
- [ ] Create directory structure
- [ ] Configure build scripts

**Files:**
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/vitest.config.ts`

---

### TASK-2-000-04: Setup apps/web Package
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-000-02 |

**Deliverables:**
- [ ] Create Next.js app with `create-next-app`
- [ ] Configure Tailwind CSS
- [ ] Add dependencies (react-query, react-hook-form, zod, etc.)
- [ ] Configure TypeScript paths
- [ ] Setup app router structure

**Files:**
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/next.config.js`
- `apps/web/tailwind.config.js`
- `apps/web/postcss.config.js`

---

### TASK-2-000-05: Setup Docker Compose for Local Dev
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | - |

**Deliverables:**
- [ ] Create `docker-compose.yml` for PostgreSQL and Redis
- [ ] Create `.env.example` with required variables
- [ ] Add npm scripts for docker management
- [ ] Document local setup in README

**Files:**
- `docker-compose.yml`
- `.env.example`
- `README.md` (update)

---

## TASK-2-003: Database Schema (FEAT-2-003)

### TASK-2-003-01: Create Users Schema
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-000-01 |

**Deliverables:**
- [ ] Define users table schema with Drizzle
- [ ] Define User and NewUser types
- [ ] Export from schema index

**Files:**
- `packages/db/src/schema/users.ts`
- `packages/db/src/schema/index.ts`

---

### TASK-2-003-02: Create Todos Schema
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-003-01 |

**Deliverables:**
- [ ] Define todo_status enum
- [ ] Define todo_priority enum
- [ ] Define todos table schema
- [ ] Define DbTodo and NewDbTodo types
- [ ] Add foreign key to users

**Files:**
- `packages/db/src/schema/todos.ts`

---

### TASK-2-003-03: Create Sessions Schema
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-003-01 |

**Deliverables:**
- [ ] Define sessions table schema
- [ ] Define Session and NewSession types
- [ ] Add foreign key to users

**Files:**
- `packages/db/src/schema/sessions.ts`

---

### TASK-2-003-04: Create Database Client
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-003-02, TASK-2-003-03 |

**Deliverables:**
- [ ] Create PostgreSQL connection pool
- [ ] Create Drizzle client instance
- [ ] Implement health check function
- [ ] Implement graceful shutdown

**Files:**
- `packages/db/src/client.ts`

---

### TASK-2-003-05: Implement PostgresTodoRepository
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Blocked By** | TASK-2-003-04 |

**Deliverables:**
- [ ] Implement TodoRepository interface from @todo/core
- [ ] Implement create() method
- [ ] Implement findById() method
- [ ] Implement findAll() with filters, sorting, pagination
- [ ] Implement update() method
- [ ] Implement delete() method
- [ ] Implement exists() method
- [ ] Implement count() method
- [ ] Add proper user isolation (userId filter)

**Files:**
- `packages/db/src/repositories/todo-repository.ts`
- `packages/db/src/repositories/index.ts`

---

### TASK-2-003-06: Implement UserRepository
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-003-04 |

**Deliverables:**
- [ ] Create UserRepository interface
- [ ] Implement create() method
- [ ] Implement findById() method
- [ ] Implement findByEmail() method
- [ ] Implement update() method

**Files:**
- `packages/db/src/repositories/user-repository.ts`

---

### TASK-2-003-07: Create Initial Migration
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-003-03 |

**Deliverables:**
- [ ] Generate migration with drizzle-kit
- [ ] Create enums (todo_status, todo_priority)
- [ ] Create users table with indexes
- [ ] Create todos table with indexes and constraints
- [ ] Create sessions table with indexes
- [ ] Create updated_at trigger function
- [ ] Create rollback migration

**Files:**
- `packages/db/src/migrations/0000_initial.sql`
- `packages/db/src/migrations/meta/`

---

### TASK-2-003-08: Create Development Seed
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P1 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-003-07 |

**Deliverables:**
- [ ] Create seed script with test user
- [ ] Create sample todos with various states
- [ ] Add npm script for seeding

**Files:**
- `packages/db/seeds/dev-seed.ts`
- `packages/db/package.json` (update)

---

### TASK-2-003-09: Write Database Unit Tests
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-003 |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Blocked By** | TASK-2-003-05, TASK-2-003-06 |

**Deliverables:**
- [ ] Test TodoRepository CRUD operations
- [ ] Test filtering and pagination
- [ ] Test user isolation
- [ ] Test UserRepository operations
- [ ] Test constraints and validations

**Files:**
- `packages/db/src/__tests__/todo-repository.test.ts`
- `packages/db/src/__tests__/user-repository.test.ts`

---

## TASK-2-004: Authentication (FEAT-2-004)

### TASK-2-004-01: Implement Password Utilities
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-000-03 |

**Deliverables:**
- [ ] Implement hashPassword() with Argon2id
- [ ] Implement verifyPassword()
- [ ] Configure OWASP recommended parameters
- [ ] Write unit tests

**Files:**
- `apps/api/src/utils/password.ts`
- `apps/api/src/__tests__/utils/password.test.ts`

---

### TASK-2-004-02: Create JWT Configuration
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-000-03 |

**Deliverables:**
- [ ] Create JWT config with environment variables
- [ ] Define access token settings (secret, expiry, algorithm)
- [ ] Define refresh token settings
- [ ] Define cookie settings

**Files:**
- `apps/api/src/config/jwt.ts`
- `apps/api/src/config/index.ts`

---

### TASK-2-004-03: Implement Auth Service
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Blocked By** | TASK-2-004-01, TASK-2-004-02, TASK-2-003-06 |

**Deliverables:**
- [ ] Implement register() method
- [ ] Implement login() method with timing-safe comparison
- [ ] Implement refresh() method with token rotation
- [ ] Implement logout() method
- [ ] Implement generateTokens() helper
- [ ] Add reuse detection logic

**Files:**
- `apps/api/src/services/auth-service.ts`
- `apps/api/src/services/index.ts`

---

### TASK-2-004-04: Implement Register Route
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-004-03 |

**Deliverables:**
- [ ] Create POST /api/v1/auth/register route
- [ ] Add request validation schema
- [ ] Set refresh token cookie
- [ ] Return user and access token
- [ ] Handle duplicate email error

**Files:**
- `apps/api/src/routes/auth/register.ts`
- `apps/api/src/routes/auth/index.ts`

---

### TASK-2-004-05: Implement Login Route
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-004-03 |

**Deliverables:**
- [ ] Create POST /api/v1/auth/login route
- [ ] Add request validation
- [ ] Set refresh token cookie
- [ ] Return user and access token
- [ ] Handle invalid credentials (no detail leak)

**Files:**
- `apps/api/src/routes/auth/login.ts`

---

### TASK-2-004-06: Implement Refresh Route
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-004-03 |

**Deliverables:**
- [ ] Create POST /api/v1/auth/refresh route
- [ ] Read refresh token from cookie
- [ ] Validate and rotate token
- [ ] Set new refresh token cookie
- [ ] Return new access token

**Files:**
- `apps/api/src/routes/auth/refresh.ts`

---

### TASK-2-004-07: Implement Logout Route
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-004-03 |

**Deliverables:**
- [ ] Create POST /api/v1/auth/logout route
- [ ] Require authentication
- [ ] Revoke refresh token
- [ ] Clear refresh token cookie

**Files:**
- `apps/api/src/routes/auth/logout.ts`

---

### TASK-2-004-08: Implement Session Repository
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-003-03 |

**Deliverables:**
- [ ] Create SessionRepository interface
- [ ] Implement create() method
- [ ] Implement findById() method
- [ ] Implement revoke() method
- [ ] Implement revokeAllUserSessions() method
- [ ] Implement markUsed() method

**Files:**
- `packages/db/src/repositories/session-repository.ts`

---

### TASK-2-004-09: Create Frontend Auth Manager
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-000-04 |

**Deliverables:**
- [ ] Create AuthManager class
- [ ] Implement login() method
- [ ] Implement register() method
- [ ] Implement refresh() method with auto-schedule
- [ ] Implement logout() method
- [ ] Create useAuth hook
- [ ] Create AuthProvider context

**Files:**
- `apps/web/lib/auth.ts`
- `apps/web/hooks/use-auth.ts`
- `apps/web/contexts/auth-context.tsx`

---

### TASK-2-004-10: Create Login Form Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-004-09 |

**Deliverables:**
- [ ] Create LoginForm component
- [ ] Add email and password inputs
- [ ] Implement form validation with Zod
- [ ] Handle submit with loading state
- [ ] Display error messages
- [ ] Redirect on success

**Files:**
- `apps/web/components/auth/login-form.tsx`
- `apps/web/app/(auth)/login/page.tsx`

---

### TASK-2-004-11: Create Register Form Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-004-09 |

**Deliverables:**
- [ ] Create RegisterForm component
- [ ] Add email, password, confirm password, name inputs
- [ ] Implement form validation
- [ ] Handle submit with loading state
- [ ] Display error messages
- [ ] Redirect on success

**Files:**
- `apps/web/components/auth/register-form.tsx`
- `apps/web/app/(auth)/register/page.tsx`

---

### TASK-2-004-12: Write Auth Tests
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-004 |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Blocked By** | TASK-2-004-07 |

**Deliverables:**
- [ ] Unit tests for password utilities
- [ ] Unit tests for AuthService
- [ ] Integration tests for auth routes
- [ ] Test rate limiting
- [ ] Test token rotation and reuse detection

**Files:**
- `apps/api/src/__tests__/auth/auth-service.test.ts`
- `apps/api/src/__tests__/routes/auth.test.ts`

---

## TASK-2-002: REST API (FEAT-2-002)

### TASK-2-002-01: Create Fastify Server
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-000-03 |

**Deliverables:**
- [ ] Create server.ts with Fastify setup
- [ ] Configure logging with pino
- [ ] Configure request ID generation
- [ ] Create server start/stop functions
- [ ] Add graceful shutdown handling

**Files:**
- `apps/api/src/server.ts`
- `apps/api/src/index.ts`

---

### TASK-2-002-02: Setup Configuration
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-002-01 |

**Deliverables:**
- [ ] Create config loader from environment
- [ ] Validate required environment variables
- [ ] Export typed configuration object

**Files:**
- `apps/api/src/config/index.ts`
- `apps/api/src/config/env.ts`

---

### TASK-2-002-03: Register Fastify Plugins
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-2-002-01 |

**Deliverables:**
- [ ] Register @fastify/cors with config
- [ ] Register @fastify/jwt
- [ ] Register @fastify/cookie
- [ ] Register @fastify/swagger with OpenAPI config
- [ ] Register @fastify/swagger-ui at /docs
- [ ] Register @fastify/rate-limit
- [ ] Create global error handler plugin

**Files:**
- `apps/api/src/plugins/index.ts`
- `apps/api/src/plugins/cors.ts`
- `apps/api/src/plugins/jwt.ts`
- `apps/api/src/plugins/swagger.ts`
- `apps/api/src/plugins/rate-limit.ts`
- `apps/api/src/plugins/error-handler.ts`

---

### TASK-2-002-04: Create Auth Middleware
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-002-03 |

**Deliverables:**
- [ ] Create authenticate preHandler
- [ ] Verify JWT and extract user
- [ ] Decorate request with user
- [ ] Handle invalid/expired tokens

**Files:**
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/middleware/index.ts`

---

### TASK-2-002-05: Create Health Check Routes
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-2-002-01 |

**Deliverables:**
- [ ] Create GET /health route
- [ ] Create GET /ready route with DB/Redis checks
- [ ] Return proper status codes

**Files:**
- `apps/api/src/routes/health.ts`

---

### TASK-2-002-06: Implement Todo Routes
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 3 hours |
| **Blocked By** | TASK-2-002-04, TASK-2-003-05 |

**Deliverables:**
- [ ] Create GET /api/v1/todos (list with filters)
- [ ] Create POST /api/v1/todos (create)
- [ ] Create GET /api/v1/todos/:id (get by ID)
- [ ] Create PATCH /api/v1/todos/:id (update)
- [ ] Create DELETE /api/v1/todos/:id (delete)
- [ ] Create POST /api/v1/todos/:id/complete
- [ ] Create POST /api/v1/todos/:id/uncomplete
- [ ] Add OpenAPI schemas for all routes
- [ ] Add request validation

**Files:**
- `apps/api/src/routes/todos/index.ts`
- `apps/api/src/routes/todos/list.ts`
- `apps/api/src/routes/todos/create.ts`
- `apps/api/src/routes/todos/get.ts`
- `apps/api/src/routes/todos/update.ts`
- `apps/api/src/routes/todos/delete.ts`
- `apps/api/src/routes/todos/complete.ts`

---

### TASK-2-002-07: Create API Todo Service
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-003-05 |

**Deliverables:**
- [ ] Create TodoService wrapper for API
- [ ] Inject PostgresTodoRepository
- [ ] Use @todo/core TodoService internally
- [ ] Add any API-specific logic

**Files:**
- `apps/api/src/services/todo-service.ts`

---

### TASK-2-002-08: Write API Tests
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-002 |
| **Priority** | P0 |
| **Estimate** | 3 hours |
| **Blocked By** | TASK-2-002-06 |

**Deliverables:**
- [ ] Test all todo CRUD endpoints
- [ ] Test authentication requirements
- [ ] Test user isolation
- [ ] Test validation errors
- [ ] Test pagination and filtering
- [ ] Test error responses

**Files:**
- `apps/api/src/__tests__/routes/todos.test.ts`
- `apps/api/src/__tests__/routes/health.test.ts`

---

## TASK-2-001: Web UI Components (FEAT-2-001)

### TASK-2-001-01: Create Dashboard Layout
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-2-000-04 |

**Deliverables:**
- [ ] Create dashboard layout.tsx with auth check
- [ ] Create page.tsx for dashboard home
- [ ] Implement responsive sidebar
- [ ] Implement header with user menu

**Files:**
- `apps/web/app/(dashboard)/layout.tsx`
- `apps/web/app/(dashboard)/page.tsx`

---

### TASK-2-001-02: Create Base UI Components
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 3 hours |
| **Blocked By** | TASK-2-000-04 |

**Deliverables:**
- [ ] Create Button component with variants
- [ ] Create Input component
- [ ] Create Textarea component
- [ ] Create Select component
- [ ] Create Checkbox component
- [ ] Create Modal component
- [ ] Create Dialog component
- [ ] Create Toast/notification system
- [ ] Create Badge component
- [ ] Create Card component
- [ ] Create Avatar component
- [ ] Create Dropdown component

**Files:**
- `apps/web/components/ui/button.tsx`
- `apps/web/components/ui/input.tsx`
- `apps/web/components/ui/textarea.tsx`
- `apps/web/components/ui/select.tsx`
- `apps/web/components/ui/checkbox.tsx`
- `apps/web/components/ui/modal.tsx`
- `apps/web/components/ui/dialog.tsx`
- `apps/web/components/ui/toast.tsx`
- `apps/web/components/ui/badge.tsx`
- `apps/web/components/ui/card.tsx`
- `apps/web/components/ui/avatar.tsx`
- `apps/web/components/ui/dropdown.tsx`
- `apps/web/components/ui/index.ts`

---

### TASK-2-001-03: Create Layout Components
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-2-001-02 |

**Deliverables:**
- [ ] Create Header component with logo and user menu
- [ ] Create Sidebar component with navigation
- [ ] Create MobileNav for responsive navigation
- [ ] Create Footer component

**Files:**
- `apps/web/components/layout/header.tsx`
- `apps/web/components/layout/sidebar.tsx`
- `apps/web/components/layout/mobile-nav.tsx`
- `apps/web/components/layout/footer.tsx`
- `apps/web/components/layout/index.ts`

---

### TASK-2-001-04: Create Todo Card Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-2-001-02 |

**Deliverables:**
- [ ] Create TodoCard component
- [ ] Display title, description preview, priority badge
- [ ] Display due date with relative formatting
- [ ] Display tags as pills
- [ ] Add completion checkbox
- [ ] Add hover effects
- [ ] Style completed and overdue states

**Files:**
- `apps/web/components/todo/todo-card.tsx`
- `apps/web/components/todo/priority-badge.tsx`
- `apps/web/components/todo/due-date-badge.tsx`
- `apps/web/components/todo/tag-list.tsx`

---

### TASK-2-001-05: Create Todo List Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-001-04 |

**Deliverables:**
- [ ] Create TodoList container component
- [ ] Implement infinite scroll or pagination
- [ ] Show loading skeletons
- [ ] Handle empty state

**Files:**
- `apps/web/components/todo/todo-list.tsx`
- `apps/web/components/todo/empty-state.tsx`
- `apps/web/components/common/loading-spinner.tsx`

---

### TASK-2-001-06: Create Todo Form Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-2-001-02 |

**Deliverables:**
- [ ] Create TodoForm with react-hook-form
- [ ] Add title input (required)
- [ ] Add description textarea
- [ ] Add priority select
- [ ] Add due date picker
- [ ] Add tags input (chips)
- [ ] Implement Zod validation
- [ ] Handle create and edit modes

**Files:**
- `apps/web/components/todo/todo-form.tsx`
- `apps/web/components/ui/date-picker.tsx`
- `apps/web/components/ui/tag-input.tsx`

---

### TASK-2-001-07: Create Todo Modal Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-001-06 |

**Deliverables:**
- [ ] Create TodoModal wrapper
- [ ] Handle create/edit mode
- [ ] Manage open/close state
- [ ] Show success/error toast

**Files:**
- `apps/web/components/todo/todo-modal.tsx`

---

### TASK-2-001-08: Create Todo Filters Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-001-02 |

**Deliverables:**
- [ ] Create TodoFilters component
- [ ] Add status filter (checkbox group)
- [ ] Add priority filter (checkbox group)
- [ ] Add due date filter (radio group)
- [ ] Add tags filter (multi-select)
- [ ] Sync filters with URL params
- [ ] Add clear all button

**Files:**
- `apps/web/components/todo/todo-filters.tsx`

---

### TASK-2-001-09: Create Todo Search Component
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-2-001-02 |

**Deliverables:**
- [ ] Create TodoSearch component
- [ ] Implement debounced search input
- [ ] Add clear button
- [ ] Sync with URL params

**Files:**
- `apps/web/components/todo/todo-search.tsx`
- `apps/web/components/todo/todo-sort.tsx`

---

### TASK-2-001-10: Create Todo Hooks
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-2-001-11 |

**Deliverables:**
- [ ] Create useTodos hook with React Query
- [ ] Create useCreateTodo mutation hook
- [ ] Create useUpdateTodo mutation hook
- [ ] Create useDeleteTodo mutation hook
- [ ] Create useCompleteTodo mutation hook
- [ ] Handle optimistic updates
- [ ] Handle cache invalidation

**Files:**
- `apps/web/hooks/use-todos.ts`

---

### TASK-2-001-11: Create API Client
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-2-004-09 |

**Deliverables:**
- [ ] Create ApiClient class
- [ ] Implement fetch wrapper with auth
- [ ] Handle API errors
- [ ] Implement todo API methods
- [ ] Integrate with auth token

**Files:**
- `apps/web/lib/api-client.ts`
- `apps/web/lib/api-error.ts`

---

### TASK-2-001-12: Write UI Component Tests
| Field | Value |
|-------|-------|
| **Feature** | FEAT-2-001 |
| **Priority** | P0 |
| **Estimate** | 3 hours |
| **Blocked By** | TASK-2-001-10 |

**Deliverables:**
- [ ] Unit tests for TodoCard
- [ ] Unit tests for TodoForm
- [ ] Unit tests for TodoFilters
- [ ] Unit tests for TodoSearch
- [ ] Integration tests for todo hooks
- [ ] Accessibility tests

**Files:**
- `apps/web/__tests__/components/todo-card.test.tsx`
- `apps/web/__tests__/components/todo-form.test.tsx`
- `apps/web/__tests__/hooks/use-todos.test.tsx`

---

## TASK-2-005: Integration & Polish

### TASK-2-005-01: API Integration Tests
| Field | Value |
|-------|-------|
| **Feature** | All Phase II |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Blocked By** | TASK-2-002-08 |

**Deliverables:**
- [ ] Test full auth flow (register → login → use → refresh → logout)
- [ ] Test full CRUD workflow
- [ ] Test user data isolation
- [ ] Test concurrent operations

**Files:**
- `apps/api/src/__tests__/integration/`

---

### TASK-2-005-02: E2E Tests with Playwright
| Field | Value |
|-------|-------|
| **Feature** | All Phase II |
| **Priority** | P0 |
| **Estimate** | 4 hours |
| **Blocked By** | TASK-2-001-12 |

**Deliverables:**
- [ ] Setup Playwright
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test todo CRUD via UI
- [ ] Test filtering and search
- [ ] Test responsive layouts
- [ ] Test keyboard navigation

**Files:**
- `apps/web/e2e/auth.spec.ts`
- `apps/web/e2e/todos.spec.ts`
- `apps/web/e2e/accessibility.spec.ts`
- `apps/web/playwright.config.ts`

---

### TASK-2-005-03: WebSocket Real-time Updates
| Field | Value |
|-------|-------|
| **Feature** | All Phase II |
| **Priority** | P1 |
| **Estimate** | 3 hours |
| **Blocked By** | TASK-2-002-06, TASK-2-001-10 |

**Deliverables:**
- [ ] Setup @fastify/websocket
- [ ] Implement todo event broadcasting
- [ ] Create useWebSocket hook
- [ ] Update UI on real-time events

**Files:**
- `apps/api/src/websocket/index.ts`
- `apps/api/src/websocket/handlers.ts`
- `apps/web/hooks/use-websocket.ts`

---

### TASK-2-005-04: Performance Optimization
| Field | Value |
|-------|-------|
| **Feature** | All Phase II |
| **Priority** | P1 |
| **Estimate** | 2 hours |
| **Blocked By** | TASK-2-005-02 |

**Deliverables:**
- [ ] Optimize database queries with proper indexes
- [ ] Add Redis caching for session validation
- [ ] Implement React Query cache strategies
- [ ] Lighthouse audit and fixes
- [ ] Bundle size analysis

**Files:**
- Various optimization updates

---

## TASK-2-006: Final Verification

### TASK-2-006-01: Documentation
| Field | Value |
|-------|-------|
| **Feature** | All Phase II |
| **Priority** | P1 |
| **Estimate** | 2 hours |
| **Blocked By** | All Phase II tasks |

**Deliverables:**
- [ ] Update main README with Phase II setup
- [ ] Document API endpoints
- [ ] Document environment variables
- [ ] Add architecture diagrams
- [ ] Write deployment guide

**Files:**
- `README.md`
- `apps/api/README.md`
- `apps/web/README.md`
- `docs/architecture.md`
- `docs/deployment.md`

---

### TASK-2-006-02: Final Verification
| Field | Value |
|-------|-------|
| **Feature** | All Phase II |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | All Phase II tasks |

**Deliverables:**
- [ ] Run full test suite
- [ ] Verify all acceptance criteria
- [ ] Manual smoke test
- [ ] Security review
- [ ] Update spec status to "Complete"

---

## Summary

| Category | Tasks | Estimated Hours |
|----------|-------|-----------------|
| Setup (TASK-2-000) | 5 | 4 |
| Database (TASK-2-003) | 9 | 9.5 |
| Authentication (TASK-2-004) | 12 | 12 |
| REST API (TASK-2-002) | 8 | 11 |
| Web UI (TASK-2-001) | 12 | 17 |
| Integration (TASK-2-005) | 4 | 11 |
| Final (TASK-2-006) | 2 | 3 |
| **Total** | **52** | **67.5** |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
