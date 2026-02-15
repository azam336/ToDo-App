// Error Handler - Task ID: TASK-1-003-04

import chalk from 'chalk';
import {
  TodoAppError,
  ValidationError,
  TodoNotFoundError,
  BusinessRuleError,
} from '@todo/core';
import { globalConfig } from './options.js';

/**
 * Exit codes following convention
 * @see FEAT-1-003 FR-05
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGUMENTS: 2,
  NOT_FOUND: 3,
  VALIDATION_ERROR: 4,
} as const;

/**
 * Format error message with color
 */
function formatError(message: string): string {
  if (globalConfig.noColor) {
    return `Error: ${message}`;
  }
  return `${chalk.red('✗')} ${chalk.red('Error:')} ${message}`;
}

/**
 * Handle validation errors with field details
 */
function handleValidationError(error: ValidationError): number {
  if (globalConfig.json) {
    console.error(JSON.stringify(error.toJSON(), null, 2));
  } else {
    console.error(formatError('Validation failed'));
    console.error('');
    for (const err of error.errors) {
      const bullet = globalConfig.noColor ? '  -' : `  ${chalk.red('•')}`;
      console.error(`${bullet} ${err.field}: ${err.message}`);
    }
  }
  return EXIT_CODES.VALIDATION_ERROR;
}

/**
 * Handle not found errors
 */
function handleNotFoundError(error: TodoNotFoundError): number {
  if (globalConfig.json) {
    console.error(JSON.stringify(error.toJSON(), null, 2));
  } else {
    console.error(formatError(`Todo not found: ${error.todoId}`));
  }
  return EXIT_CODES.NOT_FOUND;
}

/**
 * Handle business rule errors
 */
function handleBusinessRuleError(error: BusinessRuleError): number {
  if (globalConfig.json) {
    console.error(JSON.stringify(error.toJSON(), null, 2));
  } else {
    console.error(formatError(error.message));
    console.error(`  Rule: ${error.rule}`);
  }
  return EXIT_CODES.GENERAL_ERROR;
}

/**
 * Handle generic app errors
 */
function handleAppError(error: TodoAppError): number {
  if (globalConfig.json) {
    console.error(JSON.stringify(error.toJSON(), null, 2));
  } else {
    console.error(formatError(error.message));
  }
  return EXIT_CODES.GENERAL_ERROR;
}

/**
 * Central error handler
 * @returns Exit code to use
 */
export function errorHandler(error: unknown): number {
  if (error instanceof ValidationError) {
    return handleValidationError(error);
  }

  if (error instanceof TodoNotFoundError) {
    return handleNotFoundError(error);
  }

  if (error instanceof BusinessRuleError) {
    return handleBusinessRuleError(error);
  }

  if (error instanceof TodoAppError) {
    return handleAppError(error);
  }

  // Unknown error
  if (globalConfig.json) {
    console.error(JSON.stringify({
      type: 'https://api.todo.app/errors/internal',
      title: 'Internal Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'An unexpected error occurred',
    }, null, 2));
  } else {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error(formatError(message));
    if (error instanceof Error && error.stack && process.env['DEBUG']) {
      console.error(error.stack);
    }
  }

  return EXIT_CODES.GENERAL_ERROR;
}
