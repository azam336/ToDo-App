// Todo Query Builder - Task ID: TASK-1-002-02
// Provides a fluent API for building todo queries

import type {
  TodoQuery,
  TodoQueryOptions,
  TodoSortField,
  SortDirection,
} from '../types/query.js';
import type { TodoStatus, Priority } from '../types/common.js';
import { startOfDay, endOfDay, addDays } from 'date-fns';

/**
 * Fluent builder for constructing todo queries
 */
export class TodoQueryBuilder {
  private query: TodoQuery = {};
  private options: TodoQueryOptions = {};

  /**
   * Filter by status
   */
  status(status: TodoStatus | TodoStatus[] | 'active' | 'all'): this {
    this.query.status = status;
    return this;
  }

  /**
   * Filter by priority
   */
  priority(priority: Priority | Priority[]): this {
    this.query.priority = priority;
    return this;
  }

  /**
   * Filter by tags
   * @param tags Tags to filter by
   * @param matchAll If true, require all tags (AND); if false, any tag (OR)
   */
  tags(tags: string[], matchAll: boolean = false): this {
    this.query.tags = tags;
    this.query.tagsMatchAll = matchAll;
    return this;
  }

  /**
   * Search in title and description
   */
  search(text: string): this {
    this.query.search = text;
    return this;
  }

  /**
   * Filter todos due before a specific date
   */
  dueBefore(date: Date): this {
    this.query.dueBefore = date;
    return this;
  }

  /**
   * Filter todos due after a specific date
   */
  dueAfter(date: Date): this {
    this.query.dueAfter = date;
    return this;
  }

  /**
   * Filter by relative due date
   */
  dueRelative(range: 'today' | 'tomorrow' | 'week' | 'overdue'): this {
    this.query.dueRelative = range;
    return this;
  }

  /**
   * Filter by whether todo has a due date
   */
  hasDueDate(value: boolean): this {
    this.query.hasDueDate = value;
    return this;
  }

  /**
   * Sort results
   */
  sortBy(field: TodoSortField, direction: SortDirection = 'desc'): this {
    this.options.sort = { field, direction };
    return this;
  }

  /**
   * Limit number of results
   */
  limit(n: number): this {
    this.options.limit = n;
    return this;
  }

  /**
   * Skip results (for pagination)
   */
  offset(n: number): this {
    this.options.offset = n;
    return this;
  }

  /**
   * Build the query and options
   */
  build(): { query: TodoQuery; options: TodoQueryOptions } {
    return {
      query: { ...this.query },
      options: { ...this.options },
    };
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.query = {};
    this.options = {};
    return this;
  }

  /**
   * Create a new builder instance
   */
  static create(): TodoQueryBuilder {
    return new TodoQueryBuilder();
  }
}
