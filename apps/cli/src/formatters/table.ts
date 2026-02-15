// Table Formatter - Task ID: TASK-1-002-05

import Table from 'cli-table3';
import chalk from 'chalk';
import type { Todo } from '@todo/core';
import { globalConfig } from '../options.js';
import { formatDate, formatStatus, formatPriority } from '../utils/output.js';

/**
 * Truncate string to max length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Format todos as an ASCII table
 */
export function formatTable(todos: Todo[], total?: number): string {
  if (todos.length === 0) {
    return globalConfig.noColor
      ? 'No todos found.\nUse \'todo add <title>\' to create your first todo.'
      : `${chalk.dim('No todos found.')}\n${chalk.dim("Use 'todo add <title>' to create your first todo.")}`;
  }

  const table = new Table({
    head: globalConfig.noColor
      ? ['ID', 'Title', 'Status', 'Priority', 'Due']
      : [
          chalk.bold('ID'),
          chalk.bold('Title'),
          chalk.bold('Status'),
          chalk.bold('Priority'),
          chalk.bold('Due'),
        ],
    style: {
      head: globalConfig.noColor ? [] : ['cyan'],
      border: globalConfig.noColor ? [] : ['dim'],
    },
  });

  for (const todo of todos) {
    table.push([
      truncate(todo.id, 8),
      truncate(todo.title, 30),
      formatStatus(todo.status),
      formatPriority(todo.priority),
      formatDate(todo.dueDate),
    ]);
  }

  const tableStr = table.toString();
  const totalCount = total ?? todos.length;
  const pendingCount = todos.filter((t) => t.status === 'pending').length;
  const completedCount = todos.filter((t) => t.status === 'completed').length;

  const summary = globalConfig.noColor
    ? `Total: ${totalCount} todos (${pendingCount} pending, ${completedCount} completed)`
    : chalk.dim(`Total: ${totalCount} todos (${pendingCount} pending, ${completedCount} completed)`);

  return `${tableStr}\n${summary}`;
}
