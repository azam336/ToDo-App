// List & Filter Integration Tests - Task ID: TASK-1-002-08
// Tests for InMemoryTodoRepository filtering, sorting, and pagination

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTodoRepository } from '../adapters/in-memory-todo-repository.js';
import type { Todo } from '../types/todo.js';
import { createTestTodo } from './helpers.js';

function createTodoWithId(id: string, overrides?: Partial<Todo>): Todo {
  return createTestTodo({ id, ...overrides });
}

describe('InMemoryTodoRepository - Filtering & Querying', () => {
  let repo: InMemoryTodoRepository;

  const baseDate = new Date('2024-01-15T10:00:00.000Z');

  // Test data
  const todos: Todo[] = [
    createTodoWithId('1', {
      title: 'Buy groceries',
      status: 'pending',
      priority: 'high',
      tags: ['shopping', 'errands'],
      dueDate: new Date('2025-01-20'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    }),
    createTodoWithId('2', {
      title: 'Write report',
      description: 'Quarterly business report',
      status: 'in_progress',
      priority: 'urgent',
      tags: ['work'],
      dueDate: new Date('2025-01-18'),
      createdAt: new Date('2024-01-11'),
      updatedAt: new Date('2024-01-12'),
    }),
    createTodoWithId('3', {
      title: 'Go jogging',
      status: 'completed',
      priority: 'low',
      tags: ['health', 'errands'],
      dueDate: null,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-13'),
      completedAt: new Date('2024-01-13'),
    }),
    createTodoWithId('4', {
      title: 'Read a book',
      description: 'Finish reading the novel',
      status: 'pending',
      priority: 'medium',
      tags: ['personal'],
      dueDate: null,
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13'),
    }),
    createTodoWithId('5', {
      title: 'Deploy application',
      status: 'pending',
      priority: 'urgent',
      tags: ['work', 'devops'],
      dueDate: new Date('2024-01-10'), // past due
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
    }),
  ];

  beforeEach(async () => {
    repo = new InMemoryTodoRepository();
    for (const todo of todos) {
      await repo.create(todo);
    }
  });

  describe('status filter', () => {
    it('should filter by single status', async () => {
      const result = await repo.findAll({ status: 'pending' });
      expect(result.todos).toHaveLength(3);
      expect(result.todos.every((t) => t.status === 'pending')).toBe(true);
    });

    it('should filter by multiple statuses', async () => {
      const result = await repo.findAll({ status: ['pending', 'in_progress'] });
      expect(result.todos).toHaveLength(4);
    });

    it('should filter active (non-completed)', async () => {
      const result = await repo.findAll({ status: 'active' });
      expect(result.todos).toHaveLength(4);
      expect(result.todos.every((t) => t.status !== 'completed')).toBe(true);
    });

    it('should return all with status "all"', async () => {
      const result = await repo.findAll({ status: 'all' });
      expect(result.todos).toHaveLength(5);
    });
  });

  describe('priority filter', () => {
    it('should filter by single priority', async () => {
      const result = await repo.findAll({ priority: 'urgent' });
      expect(result.todos).toHaveLength(2);
      expect(result.todos.every((t) => t.priority === 'urgent')).toBe(true);
    });

    it('should filter by multiple priorities', async () => {
      const result = await repo.findAll({ priority: ['high', 'urgent'] });
      expect(result.todos).toHaveLength(3);
    });
  });

  describe('tags filter', () => {
    it('should filter by tag (OR logic by default)', async () => {
      const result = await repo.findAll({ tags: ['work'] });
      expect(result.todos).toHaveLength(2);
    });

    it('should filter by multiple tags with OR logic', async () => {
      const result = await repo.findAll({ tags: ['shopping', 'work'] });
      expect(result.todos).toHaveLength(3);
    });

    it('should filter by multiple tags with AND logic', async () => {
      const result = await repo.findAll({
        tags: ['shopping', 'errands'],
        tagsMatchAll: true,
      });
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].id).toBe('1');
    });
  });

  describe('search filter', () => {
    it('should search in title (case-insensitive)', async () => {
      const result = await repo.findAll({ search: 'buy' });
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].id).toBe('1');
    });

    it('should search in description', async () => {
      const result = await repo.findAll({ search: 'quarterly' });
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].id).toBe('2');
    });

    it('should return empty when no match', async () => {
      const result = await repo.findAll({ search: 'zzzznotfound' });
      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('due date filters', () => {
    it('should filter by hasDueDate=true', async () => {
      const result = await repo.findAll({ hasDueDate: true });
      expect(result.todos).toHaveLength(3);
      expect(result.todos.every((t) => t.dueDate !== null)).toBe(true);
    });

    it('should filter by hasDueDate=false', async () => {
      const result = await repo.findAll({ hasDueDate: false });
      expect(result.todos).toHaveLength(2);
      expect(result.todos.every((t) => t.dueDate === null)).toBe(true);
    });

    it('should filter by dueBefore', async () => {
      const result = await repo.findAll({ dueBefore: new Date('2025-01-19') });
      expect(result.todos.some((t) => t.id === '2')).toBe(true); // due 2025-01-18
      expect(result.todos.some((t) => t.id === '5')).toBe(true); // due 2024-01-10
    });

    it('should filter by dueAfter', async () => {
      const result = await repo.findAll({ dueAfter: new Date('2025-01-19') });
      expect(result.todos.some((t) => t.id === '1')).toBe(true); // due 2025-01-20
    });

    it('should filter by dueRelative "overdue"', async () => {
      const result = await repo.findAll({ dueRelative: 'overdue' });
      // Todo 5 has dueDate 2024-01-10 which is in the past
      expect(result.todos.some((t) => t.id === '5')).toBe(true);
    });
  });

  describe('filter combinations', () => {
    it('should combine status and priority filters', async () => {
      const result = await repo.findAll({
        status: 'pending',
        priority: 'urgent',
      });
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].id).toBe('5');
    });

    it('should combine search and tags', async () => {
      const result = await repo.findAll({
        search: 'deploy',
        tags: ['work'],
      });
      expect(result.todos).toHaveLength(1);
      expect(result.todos[0].id).toBe('5');
    });
  });

  describe('edge cases', () => {
    it('should return empty result when no todos match', async () => {
      const result = await repo.findAll({ status: 'completed', priority: 'urgent' });
      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should handle empty repository', async () => {
      const emptyRepo = new InMemoryTodoRepository();
      const result = await emptyRepo.findAll();
      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('sorting', () => {
    it('should sort by created date ascending', async () => {
      const result = await repo.findAll(undefined, {
        sort: { field: 'created', direction: 'asc' },
      });
      const dates = result.todos.map((t) => t.createdAt.getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
      }
    });

    it('should sort by created date descending (default)', async () => {
      const result = await repo.findAll();
      const dates = result.todos.map((t) => t.createdAt.getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
      }
    });

    it('should sort by priority', async () => {
      const result = await repo.findAll(undefined, {
        sort: { field: 'priority', direction: 'desc' },
      });
      expect(result.todos[0].priority).toBe('urgent');
    });

    it('should sort by title alphabetically', async () => {
      const result = await repo.findAll(undefined, {
        sort: { field: 'title', direction: 'asc' },
      });
      const titles = result.todos.map((t) => t.title);
      const sorted = [...titles].sort((a, b) => a.localeCompare(b));
      expect(titles).toEqual(sorted);
    });

    it('should sort by status', async () => {
      const result = await repo.findAll(undefined, {
        sort: { field: 'status', direction: 'asc' },
      });
      // pending (1) < in_progress (2) < completed (3)
      expect(result.todos[0].status).toBe('pending');
    });

    it('should sort by due date with nulls last (ascending)', async () => {
      const result = await repo.findAll(undefined, {
        sort: { field: 'due', direction: 'asc' },
      });
      const withDue = result.todos.filter((t) => t.dueDate !== null);
      const withoutDue = result.todos.filter((t) => t.dueDate === null);
      // Nulls should be at the end for ascending
      const lastWithDueIdx = result.todos.findIndex((t) => t === withDue[withDue.length - 1]);
      const firstWithoutDueIdx = result.todos.findIndex((t) => t === withoutDue[0]);
      if (withDue.length > 0 && withoutDue.length > 0) {
        expect(lastWithDueIdx).toBeLessThan(firstWithoutDueIdx);
      }
    });
  });

  describe('pagination', () => {
    it('should limit results', async () => {
      const result = await repo.findAll(undefined, { limit: 2 });
      expect(result.todos).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('should skip with offset', async () => {
      const allResult = await repo.findAll(undefined, {
        sort: { field: 'created', direction: 'asc' },
      });
      const offsetResult = await repo.findAll(undefined, {
        sort: { field: 'created', direction: 'asc' },
        offset: 2,
        limit: 2,
      });

      expect(offsetResult.todos).toHaveLength(2);
      expect(offsetResult.todos[0].id).toBe(allResult.todos[2].id);
    });

    it('should report hasMore correctly', async () => {
      const result1 = await repo.findAll(undefined, { limit: 5 });
      expect(result1.hasMore).toBe(false);

      const result2 = await repo.findAll(undefined, { limit: 3 });
      expect(result2.hasMore).toBe(true);
    });

    it('should handle offset beyond total', async () => {
      const result = await repo.findAll(undefined, { offset: 100, limit: 10 });
      expect(result.todos).toHaveLength(0);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('performance', () => {
    it('should handle 1000 items efficiently', async () => {
      const largeRepo = new InMemoryTodoRepository();
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        await largeRepo.create(
          createTodoWithId(`perf-${i}`, {
            title: `Todo ${i}`,
            status: i % 3 === 0 ? 'completed' : 'pending',
            priority: (['low', 'medium', 'high', 'urgent'] as const)[i % 4],
            tags: [`tag-${i % 5}`],
            createdAt: new Date(baseDate.getTime() + i * 1000),
            updatedAt: new Date(baseDate.getTime() + i * 1000),
          })
        );
      }

      const result = await largeRepo.findAll(
        { status: 'pending', tags: ['tag-0'] },
        { sort: { field: 'priority', direction: 'desc' }, limit: 20 }
      );

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(5000); // Should complete well under 5 seconds
      expect(result.todos.length).toBeLessThanOrEqual(20);
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('count', () => {
    it('should count all todos without query', async () => {
      const count = await repo.count();
      expect(count).toBe(5);
    });

    it('should count with filters', async () => {
      const count = await repo.count({ status: 'pending' });
      expect(count).toBe(3);
    });
  });
});
