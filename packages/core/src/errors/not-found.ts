// Not Found Error - Task ID: TASK-1-001-05

import { TodoAppError } from './base.js';

/**
 * Error thrown when a todo is not found
 */
export class TodoNotFoundError extends TodoAppError {
  constructor(public readonly todoId: string) {
    super(`Todo not found: ${todoId}`, 'NOT_FOUND', 404);
    this.name = 'TodoNotFoundError';
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      instance: `/api/v1/todos/${this.todoId}`,
    };
  }
}
