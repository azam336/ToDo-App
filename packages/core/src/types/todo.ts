// Todo Entity Types - Task ID: TASK-1-001-01
// Constitution Reference: Article VII, Section 7.1

import type { TodoStatus, Priority } from './common.js';

/**
 * Core Todo entity
 * @see Constitution Section 7.1
 */
export interface Todo {
  /** Unique identifier (UUID v7 format) */
  readonly id: string;

  /** Todo title (1-200 characters) */
  title: string;

  /** Optional description (0-2000 characters) */
  description: string;

  /** Current status */
  status: TodoStatus;

  /** Priority level */
  priority: Priority;

  /** Optional due date */
  dueDate: Date | null;

  /** Tags (0-10 tags) */
  tags: string[];

  /** Creation timestamp */
  readonly createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Completion timestamp (set when status becomes 'completed') */
  completedAt: Date | null;
}

/**
 * Input for creating a new todo
 */
export interface CreateTodoInput {
  /** Todo title (required, 1-200 characters) */
  title: string;

  /** Optional description (0-2000 characters) */
  description?: string;

  /** Priority level (defaults to 'medium') */
  priority?: Priority;

  /** Optional due date (must not be in the past) */
  dueDate?: Date;

  /** Tags (0-10 tags) */
  tags?: string[];
}

/**
 * Input for updating an existing todo
 * All fields are optional for partial updates
 */
export interface UpdateTodoInput {
  /** New title (1-200 characters) */
  title?: string;

  /** New description (0-2000 characters) */
  description?: string;

  /** New priority level */
  priority?: Priority;

  /** New due date (null to clear) */
  dueDate?: Date | null;

  /** New tags (0-10 tags) */
  tags?: string[];

  /** New status */
  status?: TodoStatus;
}
