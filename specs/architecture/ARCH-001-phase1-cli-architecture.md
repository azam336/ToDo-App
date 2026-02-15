# ARCH-001: Phase I CLI Architecture

## Metadata
| Field | Value |
|-------|-------|
| **Document ID** | ARCH-001 |
| **Phase** | I - CLI In-Memory |
| **Status** | Draft |
| **Constitution Refs** | AP-01, AP-02, AP-03, CN-01 |

---

## Executive Summary

Phase I establishes the foundational architecture for the Evolving Todo System. The design prioritizes:
1. **Clean Architecture** - Separation of domain, application, and infrastructure layers
2. **Testability** - All business logic testable without external dependencies
3. **Extensibility** - Easy to add new storage backends, interfaces, and features
4. **Type Safety** - Full TypeScript coverage with strict mode

---

## Architecture Overview

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLI Application                              │
│                         (apps/cli)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Commander.js │  │   Commands   │  │  Formatters  │               │
│  │   (parser)   │──│  (handlers)  │──│   (output)   │               │
│  └──────────────┘  └──────┬───────┘  └──────────────┘               │
│                           │                                          │
│                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Dependency Container                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Core Package                                 │
│                        (packages/core)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    APPLICATION LAYER                         │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  ┌─────────────────┐  ┌─────────────────┐                   │    │
│  │  │  TodoService    │  │ QueryBuilder    │                   │    │
│  │  │  (use cases)    │  │ (query logic)   │                   │    │
│  │  └────────┬────────┘  └────────┬────────┘                   │    │
│  └───────────┼────────────────────┼─────────────────────────────┘    │
│              │                    │                                  │
│  ┌───────────▼────────────────────▼─────────────────────────────┐    │
│  │                      DOMAIN LAYER                             │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │    │
│  │  │   Types     │  │  Validation │  │   Errors    │          │    │
│  │  │  (entities) │  │   (Zod)     │  │  (domain)   │          │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                      PORTS (Interfaces)                       │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │  ┌─────────────────────────────────────────────────────────┐ │    │
│  │  │              TodoRepository (interface)                  │ │    │
│  │  │  create() | findById() | update() | delete() | findAll() │ │    │
│  │  └─────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    ADAPTERS (Implementations)                 │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │  ┌─────────────────────────────────────────────────────────┐ │    │
│  │  │           InMemoryTodoRepository                         │ │    │
│  │  │              (Map-based storage)                         │ │    │
│  │  └─────────────────────────────────────────────────────────┘ │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### Domain Layer (`packages/core/src/domain/`)

**Purpose:** Pure business logic with zero external dependencies

| Component | Responsibility |
|-----------|---------------|
| `types/` | Entity definitions (Todo, User) |
| `validation/` | Zod schemas for input validation |
| `errors/` | Domain-specific error classes |

**Rules:**
- No imports from application or infrastructure layers
- No framework dependencies
- Must be fully unit testable

---

### Application Layer (`packages/core/src/services/`)

**Purpose:** Use cases and business workflows

| Component | Responsibility |
|-----------|---------------|
| `TodoService` | CRUD operations, business rules |
| `TodoQueryBuilder` | Query construction and filtering |

**Rules:**
- Depends on domain layer only
- Uses ports (interfaces) for infrastructure
- Orchestrates business operations

---

### Ports (`packages/core/src/ports/`)

**Purpose:** Interfaces defining infrastructure contracts

| Port | Methods |
|------|---------|
| `TodoRepository` | create, findById, findAll, update, delete |
| `IdGenerator` | generate() → string |
| `Clock` | now() → Date |

**Rules:**
- Pure TypeScript interfaces
- No implementation details
- Enable dependency injection

---

### Adapters (`packages/core/src/adapters/`)

**Purpose:** Concrete implementations of ports

| Adapter | Implements | Description |
|---------|------------|-------------|
| `InMemoryTodoRepository` | TodoRepository | Map-based storage |
| `NanoIdGenerator` | IdGenerator | UUID generation |
| `SystemClock` | Clock | System time |

**Rules:**
- Implements port interface exactly
- Can have external dependencies
- Swappable without affecting domain

---

### CLI Application (`apps/cli/`)

**Purpose:** User interface and command handling

| Component | Responsibility |
|-----------|---------------|
| `commands/` | Command handlers (add, list, etc.) |
| `formatters/` | Output formatting (table, JSON) |
| `utils/` | CLI utilities (colors, prompts) |
| `container.ts` | Dependency injection setup |

**Rules:**
- Depends on core package via public API
- Handles all user interaction
- Manages application lifecycle

---

## Package Structure

### packages/core

```
packages/core/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Public API exports
│   ├── types/
│   │   ├── index.ts
│   │   ├── todo.ts              # Todo entity
│   │   ├── query.ts             # Query types
│   │   └── common.ts            # Shared types
│   ├── validation/
│   │   ├── index.ts
│   │   └── todo.schema.ts       # Zod schemas
│   ├── errors/
│   │   ├── index.ts
│   │   ├── base.ts              # Base error class
│   │   ├── not-found.ts
│   │   └── validation.ts
│   ├── ports/
│   │   ├── index.ts
│   │   ├── todo-repository.ts
│   │   ├── id-generator.ts
│   │   └── clock.ts
│   ├── adapters/
│   │   ├── index.ts
│   │   ├── in-memory-todo-repository.ts
│   │   ├── nanoid-generator.ts
│   │   └── system-clock.ts
│   ├── services/
│   │   ├── index.ts
│   │   ├── todo-service.ts
│   │   └── todo-query-builder.ts
│   └── __tests__/
│       ├── todo-service.test.ts
│       ├── query-builder.test.ts
│       └── validation.test.ts
└── vitest.config.ts
```

### apps/cli

```
apps/cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Entry point
│   ├── container.ts             # DI container
│   ├── commands/
│   │   ├── index.ts             # Command registration
│   │   ├── add.ts
│   │   ├── list.ts
│   │   ├── show.ts
│   │   ├── update.ts
│   │   ├── delete.ts
│   │   └── complete.ts
│   ├── formatters/
│   │   ├── index.ts
│   │   ├── table.ts
│   │   ├── compact.ts
│   │   └── json.ts
│   ├── utils/
│   │   ├── output.ts
│   │   ├── interactive.ts
│   │   └── date.ts
│   └── error-handler.ts
└── vitest.config.ts
```

---

## Data Flow

### Create Todo Flow

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌────────────┐
│   User   │────▶│   CLI    │────▶│ TodoService │────▶│ Repository │
│ (input)  │     │ (parse)  │     │ (validate)  │     │  (store)   │
└──────────┘     └──────────┘     └─────────────┘     └────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │  Validator  │
                                  │   (Zod)     │
                                  └─────────────┘
```

**Sequence:**
1. User enters: `todo add "Buy milk" -p high`
2. CLI parses arguments via Commander.js
3. CLI calls `todoService.create(input)`
4. TodoService validates input with Zod schema
5. TodoService generates ID via IdGenerator
6. TodoService calls `repository.create(todo)`
7. Repository stores in Map
8. Todo returned to CLI
9. CLI formats and displays result

---

### List Todos Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌────────────┐
│   User   │────▶│   CLI    │────▶│ QueryBuilder │────▶│ Repository │
│ (query)  │     │ (parse)  │     │   (build)    │     │  (filter)  │
└──────────┘     └──────────┘     └──────────────┘     └────────────┘
                                                              │
                                                              ▼
                                                       ┌────────────┐
                                                       │ Formatter  │
                                                       │  (table)   │
                                                       └────────────┘
```

---

## Dependency Injection

### Container Setup

```typescript
// apps/cli/src/container.ts

import {
  TodoService,
  InMemoryTodoRepository,
  NanoIdGenerator,
  SystemClock
} from '@todo/core';

export function createContainer() {
  // Infrastructure
  const idGenerator = new NanoIdGenerator();
  const clock = new SystemClock();
  const repository = new InMemoryTodoRepository();

  // Services
  const todoService = new TodoService(repository, idGenerator, clock);

  return {
    todoService,
    repository,
  };
}

// Singleton for CLI lifetime
export const container = createContainer();
```

### Usage in Commands

```typescript
// apps/cli/src/commands/add.ts

import { container } from '../container';

export async function handleAdd(title: string, options: AddOptions) {
  const todo = await container.todoService.create({
    title,
    description: options.description,
    priority: options.priority,
    dueDate: options.due ? parseDate(options.due) : undefined,
    tags: options.tags?.split(','),
  });

  return todo;
}
```

---

## Error Handling Strategy

### Error Hierarchy

```typescript
// Base error
class TodoAppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// Domain errors
class ValidationError extends TodoAppError {
  constructor(public errors: ZodError) {
    super('Validation failed', 'VALIDATION_ERROR', 400);
  }
}

class TodoNotFoundError extends TodoAppError {
  constructor(public todoId: string) {
    super(`Todo not found: ${todoId}`, 'NOT_FOUND', 404);
  }
}

class BusinessRuleError extends TodoAppError {
  constructor(message: string, public rule: string) {
    super(message, 'BUSINESS_RULE', 422);
  }
}
```

### Error Mapping

| Error Type | Exit Code | User Message |
|------------|-----------|--------------|
| ValidationError | 4 | Formatted field errors |
| TodoNotFoundError | 3 | "Todo not found" |
| BusinessRuleError | 1 | Rule violation message |
| Unknown | 1 | "An unexpected error occurred" |

---

## Testing Strategy

### Test Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲          10% - CLI workflows
                 ╱──────╲
                ╱        ╲
               ╱Integration╲      30% - Service + Repository
              ╱────────────╲
             ╱              ╲
            ╱     Unit       ╲    60% - Pure functions, validation
           ╱──────────────────╲
```

### Test Organization

| Layer | Test Type | Location | Framework |
|-------|-----------|----------|-----------|
| Domain | Unit | `packages/core/src/__tests__/` | Vitest |
| Service | Unit/Integration | `packages/core/src/__tests__/` | Vitest |
| CLI | Integration | `apps/cli/src/__tests__/` | Vitest |
| E2E | E2E | `apps/cli/e2e/` | Vitest |

### Test Utilities

```typescript
// packages/core/src/__tests__/helpers.ts

export function createTestTodo(overrides?: Partial<Todo>): Todo {
  return {
    id: 'test-id-123',
    title: 'Test Todo',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: null,
    tags: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    completedAt: null,
    ...overrides,
  };
}

export function createMockRepository(): TodoRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
  };
}
```

---

## Performance Considerations

### In-Memory Storage

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| Create | O(1) | O(1) |
| Read by ID | O(1) | O(1) |
| Update | O(1) | O(1) |
| Delete | O(1) | O(1) |
| List All | O(n) | O(n) |
| Filter | O(n) | O(k) where k = results |

### Memory Budget

| Metric | Target |
|--------|--------|
| Startup time | < 100ms |
| Memory per todo | ~1KB |
| 1000 todos | < 10MB |

---

## Future Extensibility

### Phase II Preparation

The architecture supports easy transition to Phase II:

1. **Repository Swap**
   - Replace `InMemoryTodoRepository` with `PostgresTodoRepository`
   - No changes to domain or service layers

2. **Multi-User Support**
   - Add `userId` to queries
   - Inject user context into service

3. **API Layer**
   - TodoService is framework-agnostic
   - Can be used directly in Fastify handlers

---

## Decisions Log

| ID | Decision | Rationale | Alternatives Considered |
|----|----------|-----------|------------------------|
| D-001 | Use Commander.js | Industry standard, great TS support | yargs, oclif |
| D-002 | Use Zod for validation | Runtime + types, composable | io-ts, yup |
| D-003 | Use Map for storage | O(1) operations, built-in | Array, plain object |
| D-004 | Single package for core | Simpler for Phase I | Separate domain/infra packages |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
