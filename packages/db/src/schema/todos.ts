import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

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
