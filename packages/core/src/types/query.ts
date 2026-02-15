// Query Types - Task ID: TASK-1-002-01
// Constitution Reference: Article VII

import type { Todo, TodoStatus, Priority } from './index.js';

/**
 * Query filters for finding todos
 */
export interface TodoQuery {
  /** Filter by status (single, multiple, or special values) */
  status?: TodoStatus | TodoStatus[] | 'active' | 'all';

  /** Filter by priority (single or multiple) */
  priority?: Priority | Priority[];

  /** Filter by tags */
  tags?: string[];

  /** If true, require all tags (AND); if false, any tag (OR) */
  tagsMatchAll?: boolean;

  /** Search text in title and description */
  search?: string;

  /** Filter todos due before this date */
  dueBefore?: Date;

  /** Filter todos due after this date */
  dueAfter?: Date;

  /** Filter by relative due date */
  dueRelative?: 'today' | 'tomorrow' | 'week' | 'overdue';

  /** Filter by whether todo has a due date */
  hasDueDate?: boolean;
}

/**
 * Sort field options
 */
export type TodoSortField =
  | 'created'
  | 'updated'
  | 'due'
  | 'priority'
  | 'title'
  | 'status';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Query options for pagination and sorting
 */
export interface TodoQueryOptions {
  /** Sort configuration */
  sort?: {
    field: TodoSortField;
    direction: SortDirection;
  };

  /** Maximum number of results to return */
  limit?: number;

  /** Number of results to skip */
  offset?: number;
}

/**
 * Result of a todo query
 */
export interface TodoQueryResult {
  /** The matching todos */
  todos: Todo[];

  /** Total number of matching todos (before pagination) */
  total: number;

  /** Whether there are more results available */
  hasMore: boolean;
}
