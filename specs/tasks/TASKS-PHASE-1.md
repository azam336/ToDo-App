# Phase I Task Breakdown

## Metadata
| Field | Value |
|-------|-------|
| **Phase** | I - CLI In-Memory |
| **Total Tasks** | 35 |
| **Estimated Effort** | 3-4 days |
| **Status** | Pending Approval |

---

## Task Dependency Graph

```
TASK-1-000 (Setup)
    │
    ├──▶ TASK-1-001-01 to 05 (Core Types & Services)
    │         │
    │         └──▶ TASK-1-001-06 to 10 (CRUD Commands)
    │                   │
    │                   └──▶ TASK-1-001-11 (CRUD Tests)
    │
    ├──▶ TASK-1-002-01 to 03 (Query System)
    │         │
    │         └──▶ TASK-1-002-04 to 07 (List Command & Formatters)
    │                   │
    │                   └──▶ TASK-1-002-08 to 09 (Query Tests)
    │
    └──▶ TASK-1-003-01 to 09 (CLI Shell & UX)

All ──▶ TASK-1-004 (Integration & E2E)
```

---

## TASK-1-000: Project Setup

### TASK-1-000-01: Initialize Monorepo
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 30 min |

**Deliverables:**
- [ ] Run `pnpm install` to initialize workspace
- [ ] Verify Turborepo configuration works
- [ ] Add TypeScript base config

**Files:**
- `tsconfig.base.json`
- `package.json` (verify)
- `pnpm-workspace.yaml` (verify)

---

### TASK-1-000-02: Setup Core Package
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-000-01 |

**Deliverables:**
- [ ] Create `packages/core/package.json`
- [ ] Create `packages/core/tsconfig.json`
- [ ] Create `packages/core/vitest.config.ts`
- [ ] Create directory structure
- [ ] Add dependencies (zod, nanoid, date-fns)

**Files:**
- `packages/core/package.json`
- `packages/core/tsconfig.json`
- `packages/core/vitest.config.ts`
- `packages/core/src/index.ts`

---

### TASK-1-000-03: Setup CLI Package
| Field | Value |
|-------|-------|
| **Feature** | Infrastructure |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-000-02 |

**Deliverables:**
- [ ] Create `apps/cli/package.json`
- [ ] Create `apps/cli/tsconfig.json`
- [ ] Add dependencies (commander, chalk, cli-table3, inquirer)
- [ ] Configure build scripts
- [ ] Add bin entry for `todo` command

**Files:**
- `apps/cli/package.json`
- `apps/cli/tsconfig.json`

---

## TASK-1-001: CRUD Operations (FEAT-1-001)

### TASK-1-001-01: Create Type Definitions
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-000-02 |

**Deliverables:**
- [ ] Define `Todo` interface
- [ ] Define `TodoStatus` type
- [ ] Define `Priority` type
- [ ] Define `CreateTodoInput` interface
- [ ] Define `UpdateTodoInput` interface
- [ ] Export all types from index

**Files:**
- `packages/core/src/types/todo.ts`
- `packages/core/src/types/common.ts`
- `packages/core/src/types/index.ts`

**Acceptance Criteria:**
- All types match Constitution Article VII
- Strict TypeScript with no `any`

---

### TASK-1-001-02: Create Validation Schemas
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-001-01 |

**Deliverables:**
- [ ] Create `createTodoSchema` (Zod)
- [ ] Create `updateTodoSchema` (Zod)
- [ ] Implement title validation (1-200 chars)
- [ ] Implement description validation (0-2000 chars)
- [ ] Implement due date validation (not in past)
- [ ] Implement tags validation (max 10)

**Files:**
- `packages/core/src/validation/todo.schema.ts`
- `packages/core/src/validation/index.ts`

**Acceptance Criteria:**
- All business rules from BR-01 to BR-05 enforced
- Error messages are user-friendly

---

### TASK-1-001-03: Create Repository Interface
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-001-01 |

**Deliverables:**
- [ ] Define `TodoRepository` interface
- [ ] Define `IdGenerator` interface
- [ ] Define `Clock` interface
- [ ] Document interface contracts with JSDoc

**Files:**
- `packages/core/src/ports/todo-repository.ts`
- `packages/core/src/ports/id-generator.ts`
- `packages/core/src/ports/clock.ts`
- `packages/core/src/ports/index.ts`

---

### TASK-1-001-04: Implement In-Memory Repository
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-1-001-03 |

**Deliverables:**
- [ ] Implement `InMemoryTodoRepository`
- [ ] Use `Map<string, Todo>` for storage
- [ ] Implement all CRUD methods
- [ ] Implement `NanoIdGenerator`
- [ ] Implement `SystemClock`

**Files:**
- `packages/core/src/adapters/in-memory-todo-repository.ts`
- `packages/core/src/adapters/nanoid-generator.ts`
- `packages/core/src/adapters/system-clock.ts`
- `packages/core/src/adapters/index.ts`

**Acceptance Criteria:**
- O(1) for single-item operations
- Thread-safe (single-threaded assumption OK for Phase I)

---

### TASK-1-001-05: Implement Todo Service
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-1-001-02, TASK-1-001-04 |

**Deliverables:**
- [ ] Implement `TodoService` class
- [ ] Implement `create()` with validation
- [ ] Implement `getById()` with not-found handling
- [ ] Implement `update()` with partial update support
- [ ] Implement `delete()` with existence check
- [ ] Implement `complete()` and `uncomplete()`
- [ ] Create custom error classes

**Files:**
- `packages/core/src/services/todo-service.ts`
- `packages/core/src/services/index.ts`
- `packages/core/src/errors/base.ts`
- `packages/core/src/errors/not-found.ts`
- `packages/core/src/errors/validation.ts`
- `packages/core/src/errors/business-rule.ts`
- `packages/core/src/errors/index.ts`

**Acceptance Criteria:**
- BR-02: Cannot update completed todo
- BR-03: Due date cannot be in past on create
- All operations return proper types

---

### TASK-1-001-06: Implement Add Command
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-1-001-05, TASK-1-000-03 |

**Deliverables:**
- [ ] Create `add` command with Commander.js
- [ ] Parse all options (title, description, priority, due, tags)
- [ ] Call `todoService.create()`
- [ ] Format and display success output
- [ ] Handle and display validation errors

**Files:**
- `apps/cli/src/commands/add.ts`

**Acceptance Criteria:**
- Matches FR-01 output format from FEAT-1-001
- Exit code 0 on success, 4 on validation error

---

### TASK-1-001-07: Implement Show Command
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-001-05, TASK-1-000-03 |

**Deliverables:**
- [ ] Create `show` command
- [ ] Parse todo ID argument
- [ ] Call `todoService.getById()`
- [ ] Format detailed todo display
- [ ] Handle not-found error

**Files:**
- `apps/cli/src/commands/show.ts`

**Acceptance Criteria:**
- Matches FR-02 output format from FEAT-1-001
- Exit code 3 on not found

---

### TASK-1-001-08: Implement Update Command
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-001-05, TASK-1-000-03 |

**Deliverables:**
- [ ] Create `update` command
- [ ] Parse ID and all update options
- [ ] Call `todoService.update()`
- [ ] Display changed fields
- [ ] Handle errors (not found, business rule)

**Files:**
- `apps/cli/src/commands/update.ts`

**Acceptance Criteria:**
- Matches FR-03 from FEAT-1-001
- Partial updates work correctly

---

### TASK-1-001-09: Implement Delete Command
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-001-05, TASK-1-000-03 |

**Deliverables:**
- [ ] Create `delete` command (alias `rm`)
- [ ] Parse ID argument
- [ ] Implement confirmation prompt
- [ ] Support `--force` flag
- [ ] Call `todoService.delete()`

**Files:**
- `apps/cli/src/commands/delete.ts`

**Acceptance Criteria:**
- Matches FR-04 from FEAT-1-001
- Confirmation shown unless --force

---

### TASK-1-001-10: Implement Complete/Uncomplete Commands
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-001-05, TASK-1-000-03 |

**Deliverables:**
- [ ] Create `complete` command
- [ ] Create `uncomplete` command
- [ ] Display completion timestamp

**Files:**
- `apps/cli/src/commands/complete.ts`

**Acceptance Criteria:**
- Matches FR-05 from FEAT-1-001

---

### TASK-1-001-11: Write CRUD Unit Tests
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-001 |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Blocked By** | TASK-1-001-05 |

**Deliverables:**
- [ ] Test todo creation (valid/invalid)
- [ ] Test todo retrieval
- [ ] Test todo update (full/partial)
- [ ] Test todo deletion
- [ ] Test complete/uncomplete
- [ ] Test business rules (BR-01 to BR-05)
- [ ] Achieve 90%+ coverage for service

**Files:**
- `packages/core/src/__tests__/todo-service.test.ts`
- `packages/core/src/__tests__/validation.test.ts`
- `packages/core/src/__tests__/helpers.ts`

---

## TASK-1-002: List & Filter (FEAT-1-002)

### TASK-1-002-01: Create Query Types
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-001-01 |

**Deliverables:**
- [ ] Define `TodoQuery` interface
- [ ] Define `TodoQueryOptions` interface
- [ ] Define `TodoQueryResult` interface
- [ ] Define sort field types

**Files:**
- `packages/core/src/types/query.ts`

---

### TASK-1-002-02: Implement Query Builder
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-1-002-01 |

**Deliverables:**
- [ ] Implement `TodoQueryBuilder` class
- [ ] Implement fluent API methods
- [ ] Implement `build()` method
- [ ] Handle relative date calculations

**Files:**
- `packages/core/src/services/todo-query-builder.ts`

**Acceptance Criteria:**
- Fluent interface: `builder.status('pending').priority('high').build()`
- Supports all filter types from FEAT-1-002

---

### TASK-1-002-03: Extend Repository with findAll
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-1-001-04, TASK-1-002-02 |

**Deliverables:**
- [ ] Add `findAll()` to repository interface
- [ ] Implement filtering logic in InMemoryTodoRepository
- [ ] Implement sorting logic
- [ ] Implement pagination
- [ ] Implement search (title/description)

**Files:**
- `packages/core/src/ports/todo-repository.ts` (update)
- `packages/core/src/adapters/in-memory-todo-repository.ts` (update)

**Acceptance Criteria:**
- All filter combinations work
- Pagination returns correct subsets

---

### TASK-1-002-04: Implement List Command
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P0 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-1-002-03, TASK-1-000-03 |

**Deliverables:**
- [ ] Create `list` command (alias `ls`)
- [ ] Parse all filter options
- [ ] Parse sort and pagination options
- [ ] Parse format option
- [ ] Build query and execute
- [ ] Display results via formatter

**Files:**
- `apps/cli/src/commands/list.ts`

---

### TASK-1-002-05: Implement Table Formatter
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-001-01 |

**Deliverables:**
- [ ] Create table formatter using cli-table3
- [ ] Format all columns (ID, title, status, priority, due)
- [ ] Truncate long titles
- [ ] Add summary row

**Files:**
- `apps/cli/src/formatters/table.ts`
- `apps/cli/src/formatters/index.ts`

---

### TASK-1-002-06: Implement Compact Formatter
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P1 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-001-01 |

**Deliverables:**
- [ ] Create compact one-line formatter
- [ ] Show ID, priority badge, title, due date, tags
- [ ] Use checkmark for completed

**Files:**
- `apps/cli/src/formatters/compact.ts`

---

### TASK-1-002-07: Implement JSON/CSV Formatters
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P1 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-001-01 |

**Deliverables:**
- [ ] Create JSON formatter
- [ ] Create CSV formatter

**Files:**
- `apps/cli/src/formatters/json.ts`
- `apps/cli/src/formatters/csv.ts`

---

### TASK-1-002-08: Write Query Builder Tests
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-1-002-02 |

**Deliverables:**
- [ ] Test each filter type
- [ ] Test filter combinations
- [ ] Test sorting
- [ ] Test pagination

**Files:**
- `packages/core/src/__tests__/query-builder.test.ts`

---

### TASK-1-002-09: Write Filter Integration Tests
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-002 |
| **Priority** | P0 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-1-002-03 |

**Deliverables:**
- [ ] Test repository filtering with real data
- [ ] Test edge cases (empty results, no matches)
- [ ] Test performance with 1000 items

**Files:**
- `packages/core/src/__tests__/list-filter.test.ts`

---

## TASK-1-003: CLI Interface (FEAT-1-003)

### TASK-1-003-01: Create CLI Entry Point
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-000-03 |

**Deliverables:**
- [ ] Create main entry point
- [ ] Setup Commander.js program
- [ ] Configure global options
- [ ] Setup error handling

**Files:**
- `apps/cli/src/index.ts`

---

### TASK-1-003-02: Create Command Registration
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P0 |
| **Estimate** | 20 min |
| **Blocked By** | TASK-1-003-01 |

**Deliverables:**
- [ ] Create command registration function
- [ ] Register all commands

**Files:**
- `apps/cli/src/commands/index.ts`

---

### TASK-1-003-03: Configure Global Options
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P1 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-003-01 |

**Deliverables:**
- [ ] Add `--help` handling
- [ ] Add `--version` handling
- [ ] Add `--no-color` handling
- [ ] Add `--json` global option

**Files:**
- `apps/cli/src/options.ts`

---

### TASK-1-003-04: Implement Error Handler
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P0 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-001-05 |

**Deliverables:**
- [ ] Create centralized error handler
- [ ] Map error types to exit codes
- [ ] Format errors for display
- [ ] Add suggestions for common errors

**Files:**
- `apps/cli/src/error-handler.ts`

---

### TASK-1-003-05: Create Output Utilities
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-000-03 |

**Deliverables:**
- [ ] Create success/error/warn/info output functions
- [ ] Handle color disable
- [ ] Detect TTY for formatting

**Files:**
- `apps/cli/src/utils/output.ts`

---

### TASK-1-003-06: Create Interactive Utilities
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P1 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-003-05 |

**Deliverables:**
- [ ] Create confirmation prompt
- [ ] Create input prompt
- [ ] Handle non-interactive mode

**Files:**
- `apps/cli/src/utils/interactive.ts`

---

### TASK-1-003-07: Create Date Parsing Utility
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P1 |
| **Estimate** | 45 min |
| **Blocked By** | TASK-1-000-03 |

**Deliverables:**
- [ ] Parse ISO date strings
- [ ] Parse natural language (tomorrow, next week)
- [ ] Handle invalid dates

**Files:**
- `apps/cli/src/utils/date.ts`

---

### TASK-1-003-08: Create Dependency Container
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-001-05 |

**Deliverables:**
- [ ] Create container with all dependencies
- [ ] Export singleton instance
- [ ] Configure for CLI lifetime

**Files:**
- `apps/cli/src/container.ts`

---

### TASK-1-003-09: Configure Package Build
| Field | Value |
|-------|-------|
| **Feature** | FEAT-1-003 |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | TASK-1-003-01 |

**Deliverables:**
- [ ] Configure TypeScript build
- [ ] Add build scripts
- [ ] Test `pnpm build` works
- [ ] Test `todo` command runs

**Files:**
- `apps/cli/package.json` (update)
- `apps/cli/tsconfig.json` (update)

---

## TASK-1-004: Integration & Polish

### TASK-1-004-01: CLI Integration Tests
| Field | Value |
|-------|-------|
| **Feature** | All Phase I |
| **Priority** | P0 |
| **Estimate** | 2 hours |
| **Blocked By** | All TASK-1-001, TASK-1-002, TASK-1-003 |

**Deliverables:**
- [ ] Test full CRUD workflow via CLI
- [ ] Test all command options
- [ ] Test error scenarios
- [ ] Test exit codes

**Files:**
- `apps/cli/src/__tests__/cli.test.ts`

---

### TASK-1-004-02: E2E Tests
| Field | Value |
|-------|-------|
| **Feature** | All Phase I |
| **Priority** | P1 |
| **Estimate** | 1.5 hours |
| **Blocked By** | TASK-1-004-01 |

**Deliverables:**
- [ ] Test CLI as subprocess
- [ ] Verify stdout/stderr output
- [ ] Test piping support

**Files:**
- `apps/cli/e2e/todo.test.ts`

---

### TASK-1-004-03: Documentation
| Field | Value |
|-------|-------|
| **Feature** | All Phase I |
| **Priority** | P1 |
| **Estimate** | 1 hour |
| **Blocked By** | TASK-1-004-01 |

**Deliverables:**
- [ ] Write CLI README
- [ ] Document all commands
- [ ] Add usage examples

**Files:**
- `apps/cli/README.md`

---

### TASK-1-004-04: Final Verification
| Field | Value |
|-------|-------|
| **Feature** | All Phase I |
| **Priority** | P0 |
| **Estimate** | 30 min |
| **Blocked By** | All Phase I tasks |

**Deliverables:**
- [ ] Run full test suite
- [ ] Verify all acceptance criteria
- [ ] Manual smoke test
- [ ] Update spec status to "Complete"

---

## Summary

| Category | Tasks | Estimated Hours |
|----------|-------|-----------------|
| Setup | 3 | 1.5 |
| CRUD (FEAT-1-001) | 11 | 10 |
| List/Filter (FEAT-1-002) | 9 | 8 |
| CLI Interface (FEAT-1-003) | 9 | 4 |
| Integration | 4 | 5 |
| **Total** | **36** | **28.5** |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
