// Todo Service - Task ID: TASK-1-001-05
// Constitution Reference: Article VII (Domain Model), AP-01 (Domain First)

import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo.js';
import type { TodoQuery, TodoQueryOptions, TodoQueryResult } from '../types/query.js';
import type { TodoRepository } from '../ports/todo-repository.js';
import type { IdGenerator } from '../ports/id-generator.js';
import type { Clock } from '../ports/clock.js';
import { createTodoSchema, updateTodoSchema } from '../validation/todo.schema.js';
import { ValidationError } from '../errors/validation.js';
import { TodoNotFoundError } from '../errors/not-found.js';
import { BusinessRuleError } from '../errors/business-rule.js';
import { ZodError } from 'zod';

/**
 * Todo Service - Core business logic for todo operations
 * Implements use cases and enforces business rules
 */
export class TodoService {
  constructor(
    private readonly repository: TodoRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock
  ) {}

  /**
   * Create a new todo
   * @throws ValidationError if input is invalid
   * @throws BusinessRuleError if business rules are violated
   */
  async create(input: CreateTodoInput): Promise<Todo> {
    // Validate input
    let validated;
    try {
      validated = createTodoSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(error);
      }
      throw error;
    }

    const now = this.clock.now();

    const todo: Todo = {
      id: this.idGenerator.generate(),
      title: validated.title,
      description: validated.description,
      status: 'pending',
      priority: validated.priority,
      dueDate: validated.dueDate ?? null,
      tags: validated.tags,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    return this.repository.create(todo);
  }

  /**
   * Get a todo by ID
   * @throws TodoNotFoundError if todo doesn't exist
   */
  async getById(id: string): Promise<Todo> {
    const todo = await this.repository.findById(id);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }

  /**
   * Find todos matching the query
   */
  async findAll(
    query?: TodoQuery,
    options?: TodoQueryOptions
  ): Promise<TodoQueryResult> {
    return this.repository.findAll(query, options);
  }

  /**
   * Update an existing todo
   * @throws TodoNotFoundError if todo doesn't exist
   * @throws ValidationError if input is invalid
   * @throws BusinessRuleError if trying to update a completed todo (BR-02)
   */
  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    // Check if todo exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TodoNotFoundError(id);
    }

    // BR-02: Cannot update completed todo
    if (existing.status === 'completed' && input.status !== 'pending' && input.status !== 'in_progress') {
      throw BusinessRuleError.cannotUpdateCompletedTodo(id);
    }

    // Validate input
    let validated;
    try {
      validated = updateTodoSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(error);
      }
      throw error;
    }

    const now = this.clock.now();

    // Build updates object
    const updates: Partial<Todo> = {
      updatedAt: now,
    };

    if (validated.title !== undefined) {
      updates.title = validated.title;
    }
    if (validated.description !== undefined) {
      updates.description = validated.description;
    }
    if (validated.priority !== undefined) {
      updates.priority = validated.priority;
    }
    if (validated.dueDate !== undefined) {
      updates.dueDate = validated.dueDate;
    }
    if (validated.tags !== undefined) {
      updates.tags = validated.tags;
    }
    if (validated.status !== undefined) {
      updates.status = validated.status;
      // Set or clear completedAt based on status
      if (validated.status === 'completed' && existing.status !== 'completed') {
        updates.completedAt = now;
      } else if (validated.status !== 'completed') {
        updates.completedAt = null;
      }
    }

    return this.repository.update(id, updates);
  }

  /**
   * Delete a todo
   * @throws TodoNotFoundError if todo doesn't exist
   */
  async delete(id: string): Promise<void> {
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new TodoNotFoundError(id);
    }
    await this.repository.delete(id);
  }

  /**
   * Mark a todo as completed
   * @throws TodoNotFoundError if todo doesn't exist
   */
  async complete(id: string): Promise<Todo> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TodoNotFoundError(id);
    }

    if (existing.status === 'completed') {
      return existing; // Already completed, no-op
    }

    const now = this.clock.now();
    return this.repository.update(id, {
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    });
  }

  /**
   * Mark a todo as pending (uncomplete)
   * @throws TodoNotFoundError if todo doesn't exist
   */
  async uncomplete(id: string): Promise<Todo> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TodoNotFoundError(id);
    }

    if (existing.status === 'pending') {
      return existing; // Already pending, no-op
    }

    const now = this.clock.now();
    return this.repository.update(id, {
      status: 'pending',
      completedAt: null,
      updatedAt: now,
    });
  }

  /**
   * Count todos matching query
   */
  async count(query?: TodoQuery): Promise<number> {
    return this.repository.count(query);
  }
}
