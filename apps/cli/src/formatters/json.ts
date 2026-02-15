// JSON Formatter - Task ID: TASK-1-002-07

import type { Todo } from '@todo/core';

/**
 * Format todos as JSON
 */
export function formatJson(todos: Todo[]): string {
  const serializable = todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    status: todo.status,
    priority: todo.priority,
    dueDate: todo.dueDate?.toISOString() ?? null,
    tags: todo.tags,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
    completedAt: todo.completedAt?.toISOString() ?? null,
  }));

  return JSON.stringify(serializable, null, 2);
}

/**
 * Format a single todo as JSON
 */
export function formatTodoJson(todo: Todo): string {
  return formatJson([todo]);
}
