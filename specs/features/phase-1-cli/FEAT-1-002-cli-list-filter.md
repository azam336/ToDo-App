# FEAT-1-002: CLI List and Filter Operations

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-1-002 |
| **Phase** | I - CLI In-Memory |
| **Status** | Draft |
| **Priority** | P0 - Critical |
| **Constitution Refs** | AP-01, AP-03 |
| **Dependencies** | FEAT-1-001 |

---

## Overview

### Description
Implement listing and filtering capabilities for todos via command-line interface, enabling users to view and search their todos efficiently.

### User Stories

```gherkin
AS A user
I WANT TO list and filter my todos
SO THAT I can quickly find and review tasks based on various criteria
```

### Acceptance Criteria

- [ ] AC-01: User can list all todos
- [ ] AC-02: User can filter todos by status (all, pending, completed)
- [ ] AC-03: User can filter todos by priority
- [ ] AC-04: User can filter todos by tags
- [ ] AC-05: User can filter todos by due date range
- [ ] AC-06: User can search todos by title/description text
- [ ] AC-07: User can sort results by various fields
- [ ] AC-08: User can combine multiple filters
- [ ] AC-09: Empty results display helpful message

---

## Functional Requirements

### FR-01: List All Todos

**Command:** `todo list` or `todo ls`

**Output (With Todos):**
```
┌────────┬──────────────────────────┬───────────┬──────────┬────────────┐
│ ID     │ Title                    │ Status    │ Priority │ Due        │
├────────┼──────────────────────────┼───────────┼──────────┼────────────┤
│ abc123 │ Complete project report  │ pending   │ high     │ 2024-12-31 │
│ def456 │ Review pull requests     │ completed │ medium   │ -          │
│ ghi789 │ Update documentation     │ pending   │ low      │ 2024-12-15 │
└────────┴──────────────────────────┴───────────┴──────────┴────────────┘
Total: 3 todos (2 pending, 1 completed)
```

**Output (Empty):**
```
No todos found.
Use 'todo add <title>' to create your first todo.
```

---

### FR-02: Filter by Status

**Command:** `todo list --status <status>`

**Options:**
| Value | Description |
|-------|-------------|
| `all` | All todos (default) |
| `pending` | Only pending todos |
| `in_progress` | Only in-progress todos |
| `completed` | Only completed todos |
| `active` | Pending + in_progress |

**Example:**
```bash
todo list --status pending
todo list -s completed
```

---

### FR-03: Filter by Priority

**Command:** `todo list --priority <priority>`

**Options:** `low`, `medium`, `high`, `urgent`

**Multiple Priorities:**
```bash
todo list --priority high,urgent
todo list -p high -p urgent
```

---

### FR-04: Filter by Tags

**Command:** `todo list --tag <tag>`

**Examples:**
```bash
todo list --tag work
todo list -T work,personal    # OR logic
todo list --tag work --tag-all  # AND logic for multiple --tag flags
```

---

### FR-05: Filter by Due Date

**Command:** `todo list --due <range>`

**Options:**
| Option | Description |
|--------|-------------|
| `--due today` | Due today |
| `--due tomorrow` | Due tomorrow |
| `--due week` | Due within 7 days |
| `--due overdue` | Past due date |
| `--due-before <date>` | Due before date |
| `--due-after <date>` | Due after date |
| `--no-due` | No due date set |

**Examples:**
```bash
todo list --due overdue
todo list --due-before 2024-12-31
todo list --due week --priority high
```

---

### FR-06: Search by Text

**Command:** `todo list --search <query>` or `todo list -q <query>`

**Behavior:**
- Case-insensitive search
- Searches in title and description
- Supports partial matches

**Example:**
```bash
todo list --search "project"
todo list -q report
```

---

### FR-07: Sorting

**Command:** `todo list --sort <field>` or `todo list -S <field>`

**Sortable Fields:**
| Field | Description |
|-------|-------------|
| `created` | Creation date (default, newest first) |
| `updated` | Last update date |
| `due` | Due date (nulls last) |
| `priority` | Priority (urgent first) |
| `title` | Alphabetical by title |
| `status` | Status order |

**Direction:**
- Default: descending (newest/highest first)
- `--asc` or `-a`: ascending order

**Examples:**
```bash
todo list --sort due
todo list -S priority --asc
todo list --sort title -a
```

---

### FR-08: Output Formats

**Command:** `todo list --format <format>` or `todo list -f <format>`

**Formats:**
| Format | Description |
|--------|-------------|
| `table` | ASCII table (default) |
| `compact` | One-line per todo |
| `json` | JSON array |
| `csv` | CSV format |

**Compact Format:**
```
abc123 [HIGH] Complete project report (due: 2024-12-31) #work #urgent
def456 [MED]  ✓ Review pull requests
ghi789 [LOW]  Update documentation (due: 2024-12-15)
```

**JSON Format:**
```json
[
  {
    "id": "abc123",
    "title": "Complete project report",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "tags": ["work", "urgent"]
  }
]
```

---

### FR-09: Pagination

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--limit` | Number of results | 20 |
| `--offset` | Skip N results | 0 |
| `--all` | Show all results | false |

**Example:**
```bash
todo list --limit 10 --offset 20
todo list --all
```

---

### FR-10: Combined Filters

All filters can be combined:

```bash
todo list \
  --status pending \
  --priority high,urgent \
  --tag work \
  --due week \
  --sort due \
  --format compact
```

---

## Technical Design

### Query Interface

```typescript
// packages/core/src/types/query.ts

interface TodoQuery {
  status?: TodoStatus | TodoStatus[] | 'active' | 'all';
  priority?: Priority | Priority[];
  tags?: string[];
  tagsMatchAll?: boolean;
  search?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  dueRelative?: 'today' | 'tomorrow' | 'week' | 'overdue';
  hasDueDate?: boolean;
}

interface TodoQueryOptions {
  sort?: {
    field: 'created' | 'updated' | 'due' | 'priority' | 'title' | 'status';
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

interface TodoQueryResult {
  todos: Todo[];
  total: number;
  hasMore: boolean;
}
```

### Repository Extension

```typescript
// packages/core/src/ports/todo-repository.ts

interface TodoRepository {
  // ... existing methods from FEAT-1-001

  findAll(query?: TodoQuery, options?: TodoQueryOptions): Promise<TodoQueryResult>;
  count(query?: TodoQuery): Promise<number>;
}
```

### Filter Implementation

```typescript
// packages/core/src/services/todo-query-builder.ts

class TodoQueryBuilder {
  private query: TodoQuery = {};
  private options: TodoQueryOptions = {};

  status(status: TodoStatus | TodoStatus[]): this;
  priority(priority: Priority | Priority[]): this;
  tags(tags: string[], matchAll?: boolean): this;
  search(text: string): this;
  dueBefore(date: Date): this;
  dueAfter(date: Date): this;
  dueRelative(range: 'today' | 'tomorrow' | 'week' | 'overdue'): this;
  sortBy(field: string, direction?: 'asc' | 'desc'): this;
  limit(n: number): this;
  offset(n: number): this;
  build(): { query: TodoQuery; options: TodoQueryOptions };
}
```

---

## Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| `cli-table3` | Table formatting | ^0.6.0 |

---

## Test Cases

### Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-020 | List all todos (empty) | Empty array returned |
| UT-021 | List all todos (with data) | All todos returned |
| UT-022 | Filter by single status | Only matching status |
| UT-023 | Filter by multiple statuses | Matching any status |
| UT-024 | Filter by priority | Only matching priority |
| UT-025 | Filter by single tag | Todos containing tag |
| UT-026 | Filter by multiple tags (OR) | Todos with any tag |
| UT-027 | Filter by multiple tags (AND) | Todos with all tags |
| UT-028 | Search by title | Partial match works |
| UT-029 | Search by description | Partial match works |
| UT-030 | Search case insensitive | Matches regardless of case |
| UT-031 | Filter due today | Only today's todos |
| UT-032 | Filter overdue | Only past due todos |
| UT-033 | Sort by created desc | Newest first |
| UT-034 | Sort by priority | Urgent → Low |
| UT-035 | Pagination limit | Correct subset returned |
| UT-036 | Pagination offset | Correct offset applied |
| UT-037 | Combined filters | All filters applied |

---

## File Mapping

| File Path | Task ID | Description |
|-----------|---------|-------------|
| `packages/core/src/types/query.ts` | TASK-1-002-01 | Query type definitions |
| `packages/core/src/services/todo-query-builder.ts` | TASK-1-002-02 | Query builder |
| `packages/core/src/adapters/in-memory-todo-repository.ts` | TASK-1-002-03 | Add findAll method |
| `apps/cli/src/commands/list.ts` | TASK-1-002-04 | List command |
| `apps/cli/src/formatters/table.ts` | TASK-1-002-05 | Table formatter |
| `apps/cli/src/formatters/compact.ts` | TASK-1-002-06 | Compact formatter |
| `apps/cli/src/formatters/json.ts` | TASK-1-002-07 | JSON formatter |
| `packages/core/src/__tests__/query-builder.test.ts` | TASK-1-002-08 | Query builder tests |
| `packages/core/src/__tests__/list-filter.test.ts` | TASK-1-002-09 | Filter logic tests |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
