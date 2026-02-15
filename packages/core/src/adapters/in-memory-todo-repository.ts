// In-Memory Todo Repository - Task ID: TASK-1-001-04, TASK-1-002-03
// Constitution Reference: AP-02 (Dependency Inversion)

import type { Todo } from '../types/todo.js';
import type {
  TodoQuery,
  TodoQueryOptions,
  TodoQueryResult,
  TodoSortField,
  SortDirection,
} from '../types/query.js';
import type { TodoRepository } from '../ports/todo-repository.js';
import { PRIORITY_ORDER, STATUS_ORDER } from '../types/common.js';
import { TodoNotFoundError } from '../errors/not-found.js';
import {
  startOfDay,
  endOfDay,
  addDays,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns';

/**
 * In-memory implementation of TodoRepository
 * Uses a Map for O(1) single-item operations
 */
export class InMemoryTodoRepository implements TodoRepository {
  private readonly todos: Map<string, Todo> = new Map();

  async create(todo: Todo): Promise<Todo> {
    this.todos.set(todo.id, { ...todo });
    return { ...todo };
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = this.todos.get(id);
    return todo ? { ...todo } : null;
  }

  async findAll(
    query?: TodoQuery,
    options?: TodoQueryOptions
  ): Promise<TodoQueryResult> {
    let todos = Array.from(this.todos.values());

    // Apply filters
    if (query) {
      todos = this.applyFilters(todos, query);
    }

    const total = todos.length;

    // Apply sorting
    if (options?.sort) {
      todos = this.applySorting(todos, options.sort.field, options.sort.direction);
    } else {
      // Default: newest first
      todos = this.applySorting(todos, 'created', 'desc');
    }

    // Apply pagination
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? todos.length;
    const paginatedTodos = todos.slice(offset, offset + limit);

    return {
      todos: paginatedTodos.map((t) => ({ ...t })),
      total,
      hasMore: offset + paginatedTodos.length < total,
    };
  }

  async update(id: string, updates: Partial<Todo>): Promise<Todo> {
    const existing = this.todos.get(id);
    if (!existing) {
      throw new TodoNotFoundError(id);
    }

    const updated: Todo = {
      ...existing,
      ...updates,
      id: existing.id, // Ensure ID cannot be changed
      createdAt: existing.createdAt, // Ensure createdAt cannot be changed
    };

    this.todos.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    if (!this.todos.has(id)) {
      throw new TodoNotFoundError(id);
    }
    this.todos.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.todos.has(id);
  }

  async count(query?: TodoQuery): Promise<number> {
    if (!query) {
      return this.todos.size;
    }
    const todos = Array.from(this.todos.values());
    return this.applyFilters(todos, query).length;
  }

  /**
   * Clear all todos (for testing)
   */
  clear(): void {
    this.todos.clear();
  }

  // ========== Private Methods ==========

  private applyFilters(todos: Todo[], query: TodoQuery): Todo[] {
    return todos.filter((todo) => this.matchesQuery(todo, query));
  }

  private matchesQuery(todo: Todo, query: TodoQuery): boolean {
    // Status filter
    if (query.status !== undefined && query.status !== 'all') {
      if (query.status === 'active') {
        if (todo.status === 'completed') return false;
      } else if (Array.isArray(query.status)) {
        if (!query.status.includes(todo.status)) return false;
      } else {
        if (todo.status !== query.status) return false;
      }
    }

    // Priority filter
    if (query.priority !== undefined) {
      if (Array.isArray(query.priority)) {
        if (!query.priority.includes(todo.priority)) return false;
      } else {
        if (todo.priority !== query.priority) return false;
      }
    }

    // Tags filter
    if (query.tags && query.tags.length > 0) {
      if (query.tagsMatchAll) {
        // AND logic - todo must have ALL specified tags
        if (!query.tags.every((tag) => todo.tags.includes(tag))) return false;
      } else {
        // OR logic - todo must have ANY specified tag
        if (!query.tags.some((tag) => todo.tags.includes(tag))) return false;
      }
    }

    // Search filter (case-insensitive)
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      const titleMatch = todo.title.toLowerCase().includes(searchLower);
      const descMatch = todo.description.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    // Due date filters
    if (query.hasDueDate !== undefined) {
      const hasDue = todo.dueDate !== null;
      if (query.hasDueDate !== hasDue) return false;
    }

    if (query.dueBefore && todo.dueDate) {
      if (!isBefore(todo.dueDate, query.dueBefore) && !isEqual(todo.dueDate, query.dueBefore)) {
        return false;
      }
    }

    if (query.dueAfter && todo.dueDate) {
      if (!isAfter(todo.dueDate, query.dueAfter) && !isEqual(todo.dueDate, query.dueAfter)) {
        return false;
      }
    }

    if (query.dueRelative && todo.dueDate) {
      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const tomorrowEnd = endOfDay(addDays(now, 1));
      const weekEnd = endOfDay(addDays(now, 7));

      switch (query.dueRelative) {
        case 'today':
          if (isBefore(todo.dueDate, todayStart) || isAfter(todo.dueDate, todayEnd)) {
            return false;
          }
          break;
        case 'tomorrow':
          if (isBefore(todo.dueDate, todayEnd) || isAfter(todo.dueDate, tomorrowEnd)) {
            return false;
          }
          break;
        case 'week':
          if (isBefore(todo.dueDate, todayStart) || isAfter(todo.dueDate, weekEnd)) {
            return false;
          }
          break;
        case 'overdue':
          if (!isBefore(todo.dueDate, todayStart)) {
            return false;
          }
          break;
      }
    } else if (query.dueRelative && !todo.dueDate) {
      // If filtering by relative due date but todo has no due date, exclude it
      return false;
    }

    return true;
  }

  private applySorting(
    todos: Todo[],
    field: TodoSortField,
    direction: SortDirection
  ): Todo[] {
    const sorted = [...todos];
    const multiplier = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'due':
          // Nulls last for ascending, first for descending
          if (a.dueDate === null && b.dueDate === null) {
            comparison = 0;
          } else if (a.dueDate === null) {
            comparison = direction === 'asc' ? 1 : -1;
            return comparison; // Don't apply multiplier
          } else if (b.dueDate === null) {
            comparison = direction === 'asc' ? -1 : 1;
            return comparison; // Don't apply multiplier
          } else {
            comparison = a.dueDate.getTime() - b.dueDate.getTime();
          }
          break;
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'status':
          comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return comparison * multiplier;
    });

    return sorted;
  }
}
