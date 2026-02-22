// CLI Integration Tests - Task ID: TASK-1-004-01
// Tests for CLI commands via the service layer and error handler

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TodoService,
  InMemoryTodoRepository,
  ValidationError,
  TodoNotFoundError,
  BusinessRuleError,
} from '@todo/core';
import { errorHandler, EXIT_CODES } from '../error-handler.js';

// Mock the options module to avoid chalk issues
vi.mock('../options.js', () => ({
  globalConfig: { noColor: true, json: false },
  setupGlobalOptions: vi.fn(),
}));

function createTestService() {
  const repository = new InMemoryTodoRepository();
  const idGenerator = { generate: vi.fn(() => `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`) };
  const clock = { now: vi.fn(() => new Date('2024-06-15T10:00:00.000Z')) };
  const service = new TodoService(repository, idGenerator, clock);
  return { service, repository, idGenerator, clock };
}

describe('CLI Commands', () => {
  describe('add command (via TodoService.create)', () => {
    it('should create a todo with valid title', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Buy groceries' });

      expect(todo.title).toBe('Buy groceries');
      expect(todo.status).toBe('pending');
      expect(todo.priority).toBe('medium');
    });

    it('should create a todo with all options', async () => {
      const { service } = createTestService();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      const todo = await service.create({
        title: 'Buy groceries',
        description: 'Get milk and eggs',
        priority: 'high',
        dueDate: tomorrow,
        tags: ['shopping'],
      });

      expect(todo.title).toBe('Buy groceries');
      expect(todo.description).toBe('Get milk and eggs');
      expect(todo.priority).toBe('high');
      expect(todo.tags).toEqual(['shopping']);
    });

    it('should throw ValidationError for empty title', async () => {
      const { service } = createTestService();
      await expect(service.create({ title: '' })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for title exceeding max length', async () => {
      const { service } = createTestService();
      await expect(service.create({ title: 'a'.repeat(201) })).rejects.toThrow(ValidationError);
    });
  });

  describe('show command (via TodoService.getById)', () => {
    it('should display a todo by ID', async () => {
      const { service, idGenerator } = createTestService();
      idGenerator.generate.mockReturnValueOnce('show-test-id');
      const created = await service.create({ title: 'Test' });

      const found = await service.getById(created.id);
      expect(found.id).toBe('show-test-id');
      expect(found.title).toBe('Test');
    });

    it('should throw TodoNotFoundError for non-existent ID', async () => {
      const { service } = createTestService();
      await expect(service.getById('nonexistent')).rejects.toThrow(TodoNotFoundError);
    });
  });

  describe('list command (via TodoService.findAll)', () => {
    it('should list all todos', async () => {
      const { service } = createTestService();
      await service.create({ title: 'Todo 1' });
      await service.create({ title: 'Todo 2' });

      const result = await service.findAll();
      expect(result.todos).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Todo 1' });
      await service.create({ title: 'Todo 2' });
      await service.complete(todo.id);

      const pending = await service.findAll({ status: 'pending' });
      expect(pending.todos).toHaveLength(1);

      const completed = await service.findAll({ status: 'completed' });
      expect(completed.todos).toHaveLength(1);
    });

    it('should filter by priority', async () => {
      const { service } = createTestService();
      await service.create({ title: 'Low', priority: 'low' });
      await service.create({ title: 'High', priority: 'high' });

      const result = await service.findAll({ priority: 'high' });
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].title).toBe('High');
    });
  });

  describe('update command (via TodoService.update)', () => {
    it('should update todo title', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Original' });

      const updated = await service.update(todo.id, { title: 'Updated' });
      expect(updated.title).toBe('Updated');
    });

    it('should do partial update', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Original', priority: 'low' });

      const updated = await service.update(todo.id, { priority: 'high' });
      expect(updated.title).toBe('Original'); // unchanged
      expect(updated.priority).toBe('high');
    });

    it('should throw TodoNotFoundError for non-existent ID', async () => {
      const { service } = createTestService();
      await expect(service.update('nonexistent', { title: 'Test' })).rejects.toThrow(
        TodoNotFoundError
      );
    });

    it('should throw BusinessRuleError when updating completed todo', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Test' });
      await service.complete(todo.id);

      await expect(service.update(todo.id, { title: 'Updated' })).rejects.toThrow(
        BusinessRuleError
      );
    });
  });

  describe('delete command (via TodoService.delete)', () => {
    it('should delete an existing todo', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'To delete' });

      await service.delete(todo.id);
      await expect(service.getById(todo.id)).rejects.toThrow(TodoNotFoundError);
    });

    it('should throw TodoNotFoundError for non-existent ID', async () => {
      const { service } = createTestService();
      await expect(service.delete('nonexistent')).rejects.toThrow(TodoNotFoundError);
    });
  });

  describe('complete/uncomplete commands', () => {
    it('should mark todo as completed', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Test' });

      const completed = await service.complete(todo.id);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });

    it('should be idempotent for complete', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Test' });

      await service.complete(todo.id);
      const completedAgain = await service.complete(todo.id);
      expect(completedAgain.status).toBe('completed');
    });

    it('should uncomplete a todo', async () => {
      const { service } = createTestService();
      const todo = await service.create({ title: 'Test' });
      await service.complete(todo.id);

      const uncompleted = await service.uncomplete(todo.id);
      expect(uncompleted.status).toBe('pending');
      expect(uncompleted.completedAt).toBeNull();
    });
  });
});

describe('Error Handler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return VALIDATION_ERROR code for ValidationError', () => {
    const { z } = require('zod');
    const schema = z.object({ title: z.string().min(1) });
    const result = schema.safeParse({ title: '' });
    if (!result.success) {
      const error = new ValidationError(result.error);
      const exitCode = errorHandler(error);
      expect(exitCode).toBe(EXIT_CODES.VALIDATION_ERROR);
    }
  });

  it('should return NOT_FOUND code for TodoNotFoundError', () => {
    const error = new TodoNotFoundError('abc-123');
    const exitCode = errorHandler(error);
    expect(exitCode).toBe(EXIT_CODES.NOT_FOUND);
  });

  it('should return GENERAL_ERROR code for BusinessRuleError', () => {
    const error = BusinessRuleError.cannotUpdateCompletedTodo('abc-123');
    const exitCode = errorHandler(error);
    expect(exitCode).toBe(EXIT_CODES.GENERAL_ERROR);
  });

  it('should return GENERAL_ERROR code for unknown errors', () => {
    const exitCode = errorHandler(new Error('unknown'));
    expect(exitCode).toBe(EXIT_CODES.GENERAL_ERROR);
  });
});
