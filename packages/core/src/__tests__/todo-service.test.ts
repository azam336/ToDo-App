// Todo Service Tests - Task ID: TASK-1-001-11

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoService } from '../services/todo-service.js';
import { InMemoryTodoRepository } from '../adapters/in-memory-todo-repository.js';
import { ValidationError } from '../errors/validation.js';
import { TodoNotFoundError } from '../errors/not-found.js';
import { BusinessRuleError } from '../errors/business-rule.js';
import {
  createMockIdGenerator,
  createFixedClock,
  createTestInput,
} from './helpers.js';

describe('TodoService', () => {
  let service: TodoService;
  let repository: InMemoryTodoRepository;
  const fixedTime = new Date('2024-01-15T10:00:00.000Z');

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
    const idGenerator = createMockIdGenerator(['id-1', 'id-2', 'id-3']);
    const clock = createFixedClock(fixedTime);
    service = new TodoService(repository, idGenerator, clock);
  });

  describe('create', () => {
    it('should create a todo with valid title', async () => {
      const todo = await service.create(createTestInput({ title: 'My Todo' }));

      expect(todo.id).toBe('id-1');
      expect(todo.title).toBe('My Todo');
      expect(todo.status).toBe('pending');
      expect(todo.priority).toBe('medium');
      expect(todo.createdAt).toEqual(fixedTime);
    });

    it('should create a todo with all options', async () => {
      // Use a date far in the future to avoid validation issues
      const dueDate = new Date('2030-02-01');
      const todo = await service.create({
        title: 'Full Todo',
        description: 'A detailed description',
        priority: 'high',
        dueDate,
        tags: ['work', 'urgent'],
      });

      expect(todo.title).toBe('Full Todo');
      expect(todo.description).toBe('A detailed description');
      expect(todo.priority).toBe('high');
      expect(todo.dueDate).toEqual(dueDate);
      expect(todo.tags).toEqual(['work', 'urgent']);
    });

    it('should throw ValidationError for empty title', async () => {
      await expect(service.create({ title: '' })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for title over 200 characters', async () => {
      const longTitle = 'a'.repeat(201);
      await expect(service.create({ title: longTitle })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for past due date', async () => {
      const pastDate = new Date('2020-01-01');
      await expect(
        service.create({ title: 'Test', dueDate: pastDate })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for more than 10 tags', async () => {
      const tooManyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
      await expect(
        service.create({ title: 'Test', tags: tooManyTags })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getById', () => {
    it('should return existing todo', async () => {
      const created = await service.create(createTestInput({ title: 'Find Me' }));
      const found = await service.getById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.title).toBe('Find Me');
    });

    it('should throw TodoNotFoundError for non-existent todo', async () => {
      await expect(service.getById('non-existent')).rejects.toThrow(TodoNotFoundError);
    });
  });

  describe('update', () => {
    it('should update todo title', async () => {
      const created = await service.create(createTestInput({ title: 'Original' }));
      const updated = await service.update(created.id, { title: 'Updated' });

      expect(updated.title).toBe('Updated');
      expect(updated.updatedAt).toEqual(fixedTime);
    });

    it('should support partial updates', async () => {
      const created = await service.create(createTestInput({
        title: 'Original',
        priority: 'low',
      }));

      const updated = await service.update(created.id, { priority: 'high' });

      expect(updated.title).toBe('Original'); // Unchanged
      expect(updated.priority).toBe('high'); // Changed
    });

    it('should throw TodoNotFoundError for non-existent todo', async () => {
      await expect(
        service.update('non-existent', { title: 'New Title' })
      ).rejects.toThrow(TodoNotFoundError);
    });

    it('should throw BusinessRuleError when updating completed todo (BR-02)', async () => {
      const created = await service.create(createTestInput());
      await service.complete(created.id);

      await expect(
        service.update(created.id, { title: 'New Title' })
      ).rejects.toThrow(BusinessRuleError);
    });

    it('should allow uncompleting a completed todo', async () => {
      const created = await service.create(createTestInput());
      await service.complete(created.id);

      const updated = await service.update(created.id, { status: 'pending' });
      expect(updated.status).toBe('pending');
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const created = await service.create(createTestInput());
      await service.delete(created.id);

      await expect(service.getById(created.id)).rejects.toThrow(TodoNotFoundError);
    });

    it('should throw TodoNotFoundError for non-existent todo', async () => {
      await expect(service.delete('non-existent')).rejects.toThrow(TodoNotFoundError);
    });
  });

  describe('complete', () => {
    it('should mark todo as completed', async () => {
      const created = await service.create(createTestInput());
      const completed = await service.complete(created.id);

      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toEqual(fixedTime);
    });

    it('should be idempotent for already completed todo', async () => {
      const created = await service.create(createTestInput());
      await service.complete(created.id);
      const completed = await service.complete(created.id);

      expect(completed.status).toBe('completed');
    });

    it('should throw TodoNotFoundError for non-existent todo', async () => {
      await expect(service.complete('non-existent')).rejects.toThrow(TodoNotFoundError);
    });
  });

  describe('uncomplete', () => {
    it('should mark completed todo as pending', async () => {
      const created = await service.create(createTestInput());
      await service.complete(created.id);
      const uncompleted = await service.uncomplete(created.id);

      expect(uncompleted.status).toBe('pending');
      expect(uncompleted.completedAt).toBeNull();
    });

    it('should be idempotent for pending todo', async () => {
      const created = await service.create(createTestInput());
      const uncompleted = await service.uncomplete(created.id);

      expect(uncompleted.status).toBe('pending');
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await service.create({ title: 'Todo 1', priority: 'high', tags: ['work'] });
      await service.create({ title: 'Todo 2', priority: 'low', tags: ['personal'] });
      await service.create({ title: 'Todo 3', priority: 'high', tags: ['work', 'urgent'] });
    });

    it('should return all todos', async () => {
      const result = await service.findAll();
      expect(result.todos).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by priority', async () => {
      const result = await service.findAll({ priority: 'high' });
      expect(result.todos).toHaveLength(2);
    });

    it('should filter by tags', async () => {
      const result = await service.findAll({ tags: ['work'] });
      expect(result.todos).toHaveLength(2);
    });

    it('should search by title', async () => {
      const result = await service.findAll({ search: 'Todo 1' });
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0]?.title).toBe('Todo 1');
    });

    it('should support pagination', async () => {
      const result = await service.findAll({}, { limit: 2, offset: 0 });
      expect(result.todos).toHaveLength(2);
      expect(result.hasMore).toBe(true);
    });
  });
});
