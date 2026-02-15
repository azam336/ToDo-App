// Business Rule Error - Task ID: TASK-1-001-05
// Constitution Reference: Article VII, Section 7.2

import { TodoAppError } from './base.js';

/**
 * Business rule identifiers
 * @see Constitution Section 7.2
 */
export type BusinessRule =
  | 'BR-01' // Title required, 1-200 chars
  | 'BR-02' // Cannot update completed todo
  | 'BR-03' // Due date cannot be in past
  | 'BR-04' // Users can only access their own todos
  | 'BR-05'; // Maximum 1000 active todos per user

/**
 * Error thrown when a business rule is violated
 */
export class BusinessRuleError extends TodoAppError {
  constructor(
    message: string,
    public readonly rule: BusinessRule
  ) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422);
    this.name = 'BusinessRuleError';
  }

  /**
   * Factory: Cannot update completed todo (BR-02)
   */
  static cannotUpdateCompletedTodo(todoId: string): BusinessRuleError {
    return new BusinessRuleError(
      `Cannot update completed todo: ${todoId}. Uncomplete it first.`,
      'BR-02'
    );
  }

  /**
   * Factory: Due date in past (BR-03)
   */
  static dueDateInPast(): BusinessRuleError {
    return new BusinessRuleError(
      'Due date cannot be in the past',
      'BR-03'
    );
  }

  /**
   * Factory: Max todos exceeded (BR-05)
   */
  static maxTodosExceeded(limit: number): BusinessRuleError {
    return new BusinessRuleError(
      `Maximum number of active todos (${limit}) exceeded`,
      'BR-05'
    );
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      rule: this.rule,
    };
  }
}
