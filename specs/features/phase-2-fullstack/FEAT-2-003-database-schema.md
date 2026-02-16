# FEAT-2-003: Database Schema

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-2-003 |
| **Phase** | II - Full Stack Web |
| **Status** | Draft |
| **Priority** | P0 - Critical |
| **Constitution Refs** | DP-01, DP-02, DP-03, DP-04, Section 3.4 (PostgreSQL) |
| **Architecture Ref** | ARCH-002 |

---

## Overview

### Description
Implement PostgreSQL database schema using Drizzle ORM with type-safe queries, migrations, and repository implementations that conform to the `@todo/core` port interfaces.

### User Stories

```gherkin
AS A system
I WANT TO persist todos in a relational database
SO THAT data survives restarts and can be queried efficiently

AS A developer
I WANT type-safe database queries
SO THAT I can catch errors at compile time

AS an operator
I WANT versioned migrations
SO THAT I can safely deploy schema changes
```

### Acceptance Criteria

- [ ] AC-01: Users table with authentication fields
- [ ] AC-02: Todos table with all required fields from Constitution
- [ ] AC-03: Sessions table for refresh token management
- [ ] AC-04: Foreign key relationships properly defined
- [ ] AC-05: Indexes for common query patterns
- [ ] AC-06: PostgresTodoRepository implements TodoRepository port
- [ ] AC-07: Migrations are versioned and reversible
- [ ] AC-08: Seed data for development environment

---

## Schema Design

### Entity Relationship Diagram

```
┌──────────────────────────────────────┐
│              users                    │
├──────────────────────────────────────┤
│ PK id            UUID                │
│    email         VARCHAR(255) UNIQUE │
│    password_hash VARCHAR(255)        │
│    name          VARCHAR(100)        │
│    created_at    TIMESTAMP           │
│    updated_at    TIMESTAMP           │
└──────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌──────────────────────────────────────┐
│              todos                    │
├──────────────────────────────────────┤
│ PK id            UUID                │
│ FK user_id       UUID                │
│    title         VARCHAR(200)        │
│    description   TEXT                │
│    status        todo_status ENUM    │
│    priority      todo_priority ENUM  │
│    due_date      TIMESTAMP           │
│    tags          VARCHAR(50)[]       │
│    created_at    TIMESTAMP           │
│    updated_at    TIMESTAMP           │
│    completed_at  TIMESTAMP           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│            sessions                   │
├──────────────────────────────────────┤
│ PK id            UUID                │
│ FK user_id       UUID                │
│    token_hash    VARCHAR(255)        │
│    expires_at    TIMESTAMP           │
│    created_at    TIMESTAMP           │
│    revoked       BOOLEAN             │
└──────────────────────────────────────┘
```

---

## Table Definitions

### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v7() | Primary key |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Argon2id hashed password |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `users_pkey` - PRIMARY KEY (id)
- `users_email_idx` - UNIQUE (email)

---

### todos

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v7() | Primary key |
| `user_id` | UUID | FK → users(id), NOT NULL | Owner reference |
| `title` | VARCHAR(200) | NOT NULL | Todo title |
| `description` | TEXT | DEFAULT '' | Detailed description |
| `status` | todo_status | NOT NULL, DEFAULT 'pending' | Current status |
| `priority` | todo_priority | NOT NULL, DEFAULT 'medium' | Priority level |
| `due_date` | TIMESTAMPTZ | NULL | Optional deadline |
| `tags` | VARCHAR(50)[] | DEFAULT '{}' | Array of tags |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `completed_at` | TIMESTAMPTZ | NULL | Completion timestamp |

**Enums:**
```sql
CREATE TYPE todo_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

**Indexes:**
- `todos_pkey` - PRIMARY KEY (id)
- `todos_user_id_idx` - (user_id)
- `todos_user_status_idx` - (user_id, status)
- `todos_user_priority_idx` - (user_id, priority)
- `todos_user_due_date_idx` - (user_id, due_date) WHERE due_date IS NOT NULL
- `todos_user_created_idx` - (user_id, created_at DESC)

**Constraints:**
- `todos_user_id_fkey` - FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- `todos_title_length` - CHECK (char_length(title) >= 1 AND char_length(title) <= 200)

---

### sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v7() | Primary key |
| `user_id` | UUID | FK → users(id), NOT NULL | User reference |
| `token_hash` | VARCHAR(255) | NOT NULL | SHA-256 of refresh token |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Token expiration |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `revoked` | BOOLEAN | NOT NULL, DEFAULT FALSE | Revocation flag |

**Indexes:**
- `sessions_pkey` - PRIMARY KEY (id)
- `sessions_token_hash_idx` - (token_hash)
- `sessions_user_id_idx` - (user_id)

**Constraints:**
- `sessions_user_id_fkey` - FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

---

## Drizzle Schema

```typescript
// packages/db/src/schema/users.ts

import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

```typescript
// packages/db/src/schema/todos.ts

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const todoStatusEnum = pgEnum('todo_status', [
  'pending',
  'in_progress',
  'completed',
]);

export const todoPriorityEnum = pgEnum('todo_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').default(''),
  status: todoStatusEnum('status').notNull().default('pending'),
  priority: todoPriorityEnum('priority').notNull().default('medium'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  tags: varchar('tags', { length: 50 }).array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export type DbTodo = typeof todos.$inferSelect;
export type NewDbTodo = typeof todos.$inferInsert;
```

```typescript
// packages/db/src/schema/sessions.ts

import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  revoked: boolean('revoked').notNull().default(false),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
```

---

## Repository Implementation

```typescript
// packages/db/src/repositories/todo-repository.ts

import { eq, and, desc, asc, ilike, or, inArray, lte, gte } from 'drizzle-orm';
import { TodoRepository, Todo, CreateTodoInput, UpdateTodoInput, TodoQuery } from '@todo/core';
import { db } from '../client';
import { todos, DbTodo } from '../schema/todos';

export class PostgresTodoRepository implements TodoRepository {
  constructor(private userId: string) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    const [row] = await db
      .insert(todos)
      .values({
        userId: this.userId,
        title: input.title,
        description: input.description || '',
        priority: input.priority || 'medium',
        dueDate: input.dueDate,
        tags: input.tags || [],
      })
      .returning();

    return this.mapToTodo(row);
  }

  async findById(id: string): Promise<Todo | null> {
    const [row] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)));

    return row ? this.mapToTodo(row) : null;
  }

  async findAll(query?: TodoQuery): Promise<Todo[]> {
    let queryBuilder = db
      .select()
      .from(todos)
      .where(eq(todos.userId, this.userId));

    if (query?.status) {
      queryBuilder = queryBuilder.where(eq(todos.status, query.status));
    }

    if (query?.priority) {
      queryBuilder = queryBuilder.where(eq(todos.priority, query.priority));
    }

    if (query?.search) {
      queryBuilder = queryBuilder.where(
        or(
          ilike(todos.title, `%${query.search}%`),
          ilike(todos.description, `%${query.search}%`)
        )
      );
    }

    if (query?.tags?.length) {
      queryBuilder = queryBuilder.where(
        // PostgreSQL array overlap operator
        sql`${todos.tags} && ${query.tags}`
      );
    }

    if (query?.dueBefore) {
      queryBuilder = queryBuilder.where(lte(todos.dueDate, query.dueBefore));
    }

    if (query?.dueAfter) {
      queryBuilder = queryBuilder.where(gte(todos.dueDate, query.dueAfter));
    }

    // Sorting
    const sortField = query?.sort?.field || 'createdAt';
    const sortOrder = query?.sort?.order || 'desc';
    const orderFn = sortOrder === 'desc' ? desc : asc;

    switch (sortField) {
      case 'createdAt':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.createdAt));
        break;
      case 'dueDate':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.dueDate));
        break;
      case 'priority':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.priority));
        break;
      case 'title':
        queryBuilder = queryBuilder.orderBy(orderFn(todos.title));
        break;
    }

    // Pagination
    if (query?.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query?.offset) {
      queryBuilder = queryBuilder.offset(query.offset);
    }

    const rows = await queryBuilder;
    return rows.map(this.mapToTodo);
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    const [row] = await db
      .update(todos)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)))
      .returning();

    if (!row) {
      throw new Error(`Todo not found: ${id}`);
    }

    return this.mapToTodo(row);
  }

  async delete(id: string): Promise<void> {
    const result = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)));

    if (result.rowCount === 0) {
      throw new Error(`Todo not found: ${id}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const [row] = await db
      .select({ id: todos.id })
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, this.userId)));

    return !!row;
  }

  async count(query?: TodoQuery): Promise<number> {
    // Implementation for counting with filters
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(todos)
      .where(eq(todos.userId, this.userId));

    return result[0].count;
  }

  private mapToTodo(row: DbTodo): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      status: row.status,
      priority: row.priority,
      dueDate: row.dueDate,
      tags: row.tags || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      completedAt: row.completedAt,
    };
  }
}
```

---

## Migrations

### Initial Migration

```sql
-- packages/db/src/migrations/0000_initial.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE todo_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create todos table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  status todo_status NOT NULL DEFAULT 'pending',
  priority todo_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  tags VARCHAR(50)[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT todos_title_length CHECK (
    char_length(title) >= 1 AND char_length(title) <= 200
  )
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX todos_user_id_idx ON todos(user_id);
CREATE INDEX todos_user_status_idx ON todos(user_id, status);
CREATE INDEX todos_user_priority_idx ON todos(user_id, priority);
CREATE INDEX todos_user_due_date_idx ON todos(user_id, due_date)
  WHERE due_date IS NOT NULL;
CREATE INDEX todos_user_created_idx ON todos(user_id, created_at DESC);
CREATE INDEX sessions_token_hash_idx ON sessions(token_hash);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Rollback Migration

```sql
-- packages/db/src/migrations/0000_initial_down.sql

DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS todo_priority;
DROP TYPE IF EXISTS todo_status;
```

---

## Seed Data

```typescript
// packages/db/seeds/dev-seed.ts

import { db } from '../src/client';
import { users } from '../src/schema/users';
import { todos } from '../src/schema/todos';
import { hashPassword } from '../src/utils/password';

async function seed() {
  console.log('Seeding database...');

  // Create test user
  const passwordHash = await hashPassword('password123');

  const [user] = await db
    .insert(users)
    .values({
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
    })
    .returning();

  console.log(`Created user: ${user.email}`);

  // Create sample todos
  const sampleTodos = [
    {
      userId: user.id,
      title: 'Complete project documentation',
      description: 'Write comprehensive docs for the API',
      priority: 'high' as const,
      status: 'in_progress' as const,
      tags: ['work', 'documentation'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    {
      userId: user.id,
      title: 'Review pull requests',
      description: 'Review pending PRs from team members',
      priority: 'medium' as const,
      status: 'pending' as const,
      tags: ['work', 'code-review'],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    },
    {
      userId: user.id,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, vegetables',
      priority: 'low' as const,
      status: 'pending' as const,
      tags: ['personal', 'errands'],
    },
    {
      userId: user.id,
      title: 'Schedule dentist appointment',
      description: 'Annual checkup',
      priority: 'medium' as const,
      status: 'completed' as const,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['personal', 'health'],
    },
    {
      userId: user.id,
      title: 'Prepare presentation',
      description: 'Q4 review slides for leadership',
      priority: 'urgent' as const,
      status: 'pending' as const,
      tags: ['work', 'urgent'],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    },
  ];

  await db.insert(todos).values(sampleTodos);
  console.log(`Created ${sampleTodos.length} todos`);

  console.log('Seeding complete!');
}

seed().catch(console.error);
```

---

## Database Client

```typescript
// packages/db/src/client.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}
```

---

## Test Cases

| Test ID | Description |
|---------|-------------|
| UT-DB-001 | Create todo inserts row correctly |
| UT-DB-002 | Find todo by ID returns correct row |
| UT-DB-003 | Find todo respects user isolation |
| UT-DB-004 | Update todo modifies correct fields |
| UT-DB-005 | Delete todo removes row |
| UT-DB-006 | Find all with status filter |
| UT-DB-007 | Find all with priority filter |
| UT-DB-008 | Find all with search |
| UT-DB-009 | Find all with pagination |
| UT-DB-010 | Find all with sorting |
| IT-DB-001 | Migration applies successfully |
| IT-DB-002 | Migration rollback works |
| IT-DB-003 | Concurrent writes don't conflict |
| IT-DB-004 | Cascade delete removes todos |

---

## Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `drizzle-orm` | ORM | ^0.29.0 |
| `drizzle-kit` | Migrations CLI | ^0.20.0 |
| `pg` | PostgreSQL driver | ^8.11.0 |
| `@types/pg` | Type definitions | ^8.10.0 |

---

## File Mapping

| File Path | Task ID |
|-----------|---------|
| `packages/db/src/schema/users.ts` | TASK-2-003-01 |
| `packages/db/src/schema/todos.ts` | TASK-2-003-02 |
| `packages/db/src/schema/sessions.ts` | TASK-2-003-03 |
| `packages/db/src/client.ts` | TASK-2-003-04 |
| `packages/db/src/repositories/todo-repository.ts` | TASK-2-003-05 |
| `packages/db/src/repositories/user-repository.ts` | TASK-2-003-06 |
| `packages/db/src/migrations/0000_initial.sql` | TASK-2-003-07 |
| `packages/db/seeds/dev-seed.ts` | TASK-2-003-08 |
| `packages/db/src/__tests__/` | TASK-2-003-09 |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
| DBA | | | |
