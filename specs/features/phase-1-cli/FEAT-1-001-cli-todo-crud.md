# FEAT-1-001: CLI Todo CRUD Operations

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-1-001 |
| **Phase** | I - CLI In-Memory |
| **Status** | Draft |
| **Priority** | P0 - Critical |
| **Constitution Refs** | AP-01, AP-02, BR-01, BR-03 |

---

## Overview

### Description
Implement core CRUD (Create, Read, Update, Delete) operations for todos via command-line interface with in-memory storage.

### User Stories

```gherkin
AS A user
I WANT TO create, view, update, and delete todos from the command line
SO THAT I can manage my tasks efficiently without a GUI
```

### Acceptance Criteria

- [ ] AC-01: User can create a todo with title (required) and optional description, priority, due date
- [ ] AC-02: User can view a single todo by ID
- [ ] AC-03: User can update any field of an existing todo
- [ ] AC-04: User can delete a todo by ID
- [ ] AC-05: User can mark a todo as complete/incomplete
- [ ] AC-06: All operations provide clear success/error feedback
- [ ] AC-07: Invalid input is rejected with helpful error messages

---

## Functional Requirements

### FR-01: Create Todo

**Command:** `todo add <title> [options]`

**Options:**
| Option | Short | Type | Required | Default | Description |
|--------|-------|------|----------|---------|-------------|
| `--title` | `-t` | string | Yes | - | Todo title (1-200 chars) |
| `--description` | `-d` | string | No | "" | Description (0-2000 chars) |
| `--priority` | `-p` | enum | No | "medium" | low, medium, high, urgent |
| `--due` | `-D` | date | No | null | Due date (ISO8601 or natural) |
| `--tags` | `-T` | string[] | No | [] | Comma-separated tags |

**Example:**
```bash
todo add "Complete project report" -p high -D 2024-12-31 -T work,urgent
```

**Output (Success):**
```
✓ Todo created successfully
  ID:       abc123
  Title:    Complete project report
  Priority: high
  Due:      2024-12-31
  Tags:     work, urgent
```

**Output (Error):**
```
✗ Error: Title is required
  Usage: todo add <title> [options]
```

---

### FR-02: Read Todo

**Command:** `todo show <id>`

**Example:**
```bash
todo show abc123
```

**Output (Success):**
```
┌─────────────────────────────────────────┐
│ Todo: abc123                            │
├─────────────────────────────────────────┤
│ Title:       Complete project report    │
│ Description: -                          │
│ Status:      pending                    │
│ Priority:    high                       │
│ Due Date:    2024-12-31                 │
│ Tags:        work, urgent               │
│ Created:     2024-12-01 10:30:00        │
│ Updated:     2024-12-01 10:30:00        │
└─────────────────────────────────────────┘
```

**Output (Not Found):**
```
✗ Error: Todo not found
  ID 'xyz789' does not exist
```

---

### FR-03: Update Todo

**Command:** `todo update <id> [options]`

**Options:** Same as create, all optional

**Example:**
```bash
todo update abc123 --title "Updated title" --priority urgent
```

**Output (Success):**
```
✓ Todo updated successfully
  ID:       abc123
  Changes:  title, priority
```

**Business Rules:**
- Cannot update a completed todo (BR-02)
- Partial updates supported (only specified fields change)

---

### FR-04: Delete Todo

**Command:** `todo delete <id>` or `todo rm <id>`

**Example:**
```bash
todo delete abc123
```

**Output (Success):**
```
✓ Todo deleted successfully
  ID: abc123
```

**Output (With Confirmation):**
```bash
todo delete abc123
? Are you sure you want to delete 'Complete project report'? (y/N)
```

**Flag:** `--force` or `-f` to skip confirmation

---

### FR-05: Complete/Uncomplete Todo

**Commands:**
- `todo complete <id>` - Mark as completed
- `todo uncomplete <id>` - Mark as pending

**Example:**
```bash
todo complete abc123
```

**Output:**
```
✓ Todo marked as completed
  ID:          abc123
  Completed:   2024-12-15 14:30:00
```

---

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Response time for any operation | < 50ms |
| NFR-02 | Memory usage for 1000 todos | < 10MB |
| NFR-03 | Input validation feedback | Immediate |

---

## Technical Design

### Data Model

```typescript
// packages/core/src/types/todo.ts

type TodoStatus = 'pending' | 'in_progress' | 'completed';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Todo {
  id: string;           // UUID v7
  title: string;        // 1-200 characters
  description: string;  // 0-2000 characters
  status: TodoStatus;
  priority: Priority;
  dueDate: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
}

interface UpdateTodoInput {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date | null;
  tags?: string[];
  status?: TodoStatus;
}
```

### Storage Interface

```typescript
// packages/core/src/ports/todo-repository.ts

interface TodoRepository {
  create(input: CreateTodoInput): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
  update(id: string, input: UpdateTodoInput): Promise<Todo>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### In-Memory Implementation

```typescript
// packages/core/src/adapters/in-memory-todo-repository.ts

class InMemoryTodoRepository implements TodoRepository {
  private todos: Map<string, Todo> = new Map();
  // Implementation details in task breakdown
}
```

---

## Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| `commander` | CLI argument parsing | ^12.0.0 |
| `zod` | Input validation | ^3.23.0 |
| `chalk` | Terminal styling | ^5.3.0 |
| `nanoid` | ID generation | ^5.0.0 |
| `date-fns` | Date handling | ^3.6.0 |

---

## Test Cases

### Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-001 | Create todo with valid title | Todo created with generated ID |
| UT-002 | Create todo with empty title | Validation error thrown |
| UT-003 | Create todo with title > 200 chars | Validation error thrown |
| UT-004 | Create todo with past due date | Validation error thrown |
| UT-005 | Read existing todo | Todo returned |
| UT-006 | Read non-existent todo | Null returned |
| UT-007 | Update todo fields | Fields updated, updatedAt changed |
| UT-008 | Update completed todo | Error thrown (BR-02) |
| UT-009 | Delete existing todo | Todo removed from storage |
| UT-010 | Delete non-existent todo | Error thrown |
| UT-011 | Complete pending todo | Status changed, completedAt set |
| UT-012 | Uncomplete completed todo | Status changed, completedAt cleared |

### Integration Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| IT-001 | Full CRUD lifecycle | All operations succeed in sequence |
| IT-002 | Concurrent operations | No data corruption |

---

## File Mapping

| File Path | Task ID | Description |
|-----------|---------|-------------|
| `packages/core/src/types/todo.ts` | TASK-1-001-01 | Type definitions |
| `packages/core/src/types/index.ts` | TASK-1-001-01 | Type exports |
| `packages/core/src/validation/todo.schema.ts` | TASK-1-001-02 | Zod schemas |
| `packages/core/src/ports/todo-repository.ts` | TASK-1-001-03 | Repository interface |
| `packages/core/src/adapters/in-memory-todo-repository.ts` | TASK-1-001-04 | In-memory implementation |
| `packages/core/src/services/todo-service.ts` | TASK-1-001-05 | Business logic |
| `apps/cli/src/commands/add.ts` | TASK-1-001-06 | Add command |
| `apps/cli/src/commands/show.ts` | TASK-1-001-07 | Show command |
| `apps/cli/src/commands/update.ts` | TASK-1-001-08 | Update command |
| `apps/cli/src/commands/delete.ts` | TASK-1-001-09 | Delete command |
| `apps/cli/src/commands/complete.ts` | TASK-1-001-10 | Complete command |
| `packages/core/src/__tests__/todo-service.test.ts` | TASK-1-001-11 | Unit tests |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
