// Todo Repository Port - Task ID: TASK-1-001-03
// Constitution Reference: AP-02 (Dependency Inversion)

import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo.js';
import type { TodoQuery, TodoQueryOptions, TodoQueryResult } from '../types/query.js';

/**
 * Repository interface for Todo persistence
 * Implementations can use in-memory storage, databases, etc.
 */
export interface TodoRepository {
  /**
   * Create a new todo
   * @param todo The complete todo object to store
   * @returns The stored todo
   */
  create(todo: Todo): Promise<Todo>;

  /**
   * Find a todo by its ID
   * @param id The todo ID
   * @returns The todo if found, null otherwise
   */
  findById(id: string): Promise<Todo | null>;

  /**
   * Find all todos matching the query
   * @param query Filter criteria
   * @param options Pagination and sorting options
   * @returns Query result with todos and metadata
   */
  findAll(query?: TodoQuery, options?: TodoQueryOptions): Promise<TodoQueryResult>;

  /**
   * Update an existing todo
   * @param id The todo ID
   * @param updates The fields to update
   * @returns The updated todo
   */
  update(id: string, updates: Partial<Todo>): Promise<Todo>;

  /**
   * Delete a todo by its ID
   * @param id The todo ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a todo exists
   * @param id The todo ID
   * @returns True if the todo exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count todos matching the query
   * @param query Filter criteria
   * @returns Number of matching todos
   */
  count(query?: TodoQuery): Promise<number>;
}
