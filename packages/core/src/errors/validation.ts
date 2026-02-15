// Validation Error - Task ID: TASK-1-001-05

import { ZodError, type ZodIssue } from 'zod';
import { TodoAppError } from './base.js';

/**
 * Formatted validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends TodoAppError {
  public readonly errors: ValidationErrorDetail[];

  constructor(zodError: ZodError) {
    const errors = ValidationError.formatZodErrors(zodError);
    const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');

    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  /**
   * Create from a ZodError
   */
  static fromZodError(zodError: ZodError): ValidationError {
    return new ValidationError(zodError);
  }

  /**
   * Format Zod issues into user-friendly error details
   */
  private static formatZodErrors(zodError: ZodError): ValidationErrorDetail[] {
    return zodError.issues.map((issue: ZodIssue) => ({
      field: issue.path.join('.') || 'input',
      message: issue.message,
      code: issue.code,
    }));
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}
