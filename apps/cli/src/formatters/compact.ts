// Compact Formatter - Task ID: TASK-1-002-06

import chalk from 'chalk';
import type { Todo } from '@todo/core';
import { globalConfig } from '../options.js';
import { formatPriority, formatDate, formatTags } from '../utils/output.js';

/**
 * Format todos in compact one-line format
 */
export function formatCompact(todos: Todo[]): string {
  if (todos.length === 0) {
    return globalConfig.noColor
      ? 'No todos found.'
      : chalk.dim('No todos found.');
  }

  const lines: string[] = [];

  for (const todo of todos) {
    const parts: string[] = [];

    // ID (truncated)
    const shortId = todo.id.substring(0, 8);
    parts.push(globalConfig.noColor ? shortId : chalk.dim(shortId));

    // Priority badge
    parts.push(formatPriority(todo.priority));

    // Completion checkmark or status
    if (todo.status === 'completed') {
      parts.push(globalConfig.noColor ? '[x]' : chalk.green('✓'));
    }

    // Title
    parts.push(todo.title);

    // Due date if present
    if (todo.dueDate) {
      const dueStr = `(due: ${formatDate(todo.dueDate)})`;
      parts.push(globalConfig.noColor ? dueStr : chalk.dim(dueStr));
    }

    // Tags
    if (todo.tags.length > 0) {
      parts.push(formatTags(todo.tags));
    }

    lines.push(parts.join(' '));
  }

  return lines.join('\n');
}
