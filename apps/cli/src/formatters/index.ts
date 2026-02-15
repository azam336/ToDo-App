// Formatters Index - Task ID: TASK-1-002-05

import type { Todo } from '@todo/core';
import { formatTable } from './table.js';
import { formatCompact } from './compact.js';
import { formatJson } from './json.js';
import { formatCsv } from './csv.js';

export type OutputFormat = 'table' | 'compact' | 'json' | 'csv';

/**
 * Format todos for output
 */
export function formatTodos(
  todos: Todo[],
  format: OutputFormat,
  total?: number
): string {
  switch (format) {
    case 'table':
      return formatTable(todos, total);
    case 'compact':
      return formatCompact(todos);
    case 'json':
      return formatJson(todos);
    case 'csv':
      return formatCsv(todos);
    default:
      return formatTable(todos, total);
  }
}

export { formatTable } from './table.js';
export { formatCompact } from './compact.js';
export { formatJson } from './json.js';
export { formatCsv } from './csv.js';
