// CSV Formatter - Task ID: TASK-1-002-07

import type { Todo } from '@todo/core';

/**
 * Escape a value for CSV
 */
function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format todos as CSV
 */
export function formatCsv(todos: Todo[]): string {
  const headers = [
    'id',
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
    'tags',
    'createdAt',
    'updatedAt',
    'completedAt',
  ];

  const rows: string[] = [headers.join(',')];

  for (const todo of todos) {
    const row = [
      escapeCsv(todo.id),
      escapeCsv(todo.title),
      escapeCsv(todo.description),
      todo.status,
      todo.priority,
      todo.dueDate?.toISOString() ?? '',
      escapeCsv(todo.tags.join(';')),
      todo.createdAt.toISOString(),
      todo.updatedAt.toISOString(),
      todo.completedAt?.toISOString() ?? '',
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}
