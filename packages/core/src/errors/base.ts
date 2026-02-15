// Base Error Class - Task ID: TASK-1-001-05
// Constitution Reference: Article VI, Section 6.2

/**
 * Base error class for all todo application errors
 */
export class TodoAppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'TodoAppError';
    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert to JSON for API responses
   * @see Constitution Section 6.2 (Error Response format)
   */
  toJSON() {
    return {
      type: `https://api.todo.app/errors/${this.code.toLowerCase().replace(/_/g, '-')}`,
      title: this.name,
      status: this.statusCode,
      detail: this.message,
    };
  }
}
