// Common Types - Task ID: TASK-1-001-01
// Constitution Reference: Article VII - Domain Model

/**
 * Todo status values
 * @see Constitution Section 7.1
 */
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Priority levels for todos
 * @see Constitution Section 7.1
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Priority sort order (higher number = higher priority)
 */
export const PRIORITY_ORDER: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

/**
 * Status sort order
 */
export const STATUS_ORDER: Record<TodoStatus, number> = {
  pending: 1,
  in_progress: 2,
  completed: 3,
};
