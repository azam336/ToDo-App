// Query Builder Tests - Task ID: TASK-1-002-08

import { describe, it, expect } from 'vitest';
import { TodoQueryBuilder } from '../services/todo-query-builder.js';

describe('TodoQueryBuilder', () => {
  describe('status', () => {
    it('should set single status', () => {
      const { query } = TodoQueryBuilder.create().status('pending').build();
      expect(query.status).toBe('pending');
    });

    it('should set multiple statuses', () => {
      const { query } = TodoQueryBuilder.create()
        .status(['pending', 'in_progress'])
        .build();
      expect(query.status).toEqual(['pending', 'in_progress']);
    });

    it('should set active status', () => {
      const { query } = TodoQueryBuilder.create().status('active').build();
      expect(query.status).toBe('active');
    });
  });

  describe('priority', () => {
    it('should set single priority', () => {
      const { query } = TodoQueryBuilder.create().priority('high').build();
      expect(query.priority).toBe('high');
    });

    it('should set multiple priorities', () => {
      const { query } = TodoQueryBuilder.create()
        .priority(['high', 'urgent'])
        .build();
      expect(query.priority).toEqual(['high', 'urgent']);
    });
  });

  describe('tags', () => {
    it('should set tags with OR logic by default', () => {
      const { query } = TodoQueryBuilder.create()
        .tags(['work', 'personal'])
        .build();
      expect(query.tags).toEqual(['work', 'personal']);
      expect(query.tagsMatchAll).toBe(false);
    });

    it('should set tags with AND logic', () => {
      const { query } = TodoQueryBuilder.create()
        .tags(['work', 'urgent'], true)
        .build();
      expect(query.tags).toEqual(['work', 'urgent']);
      expect(query.tagsMatchAll).toBe(true);
    });
  });

  describe('search', () => {
    it('should set search text', () => {
      const { query } = TodoQueryBuilder.create().search('project').build();
      expect(query.search).toBe('project');
    });
  });

  describe('due date filters', () => {
    it('should set dueBefore', () => {
      const date = new Date('2024-12-31');
      const { query } = TodoQueryBuilder.create().dueBefore(date).build();
      expect(query.dueBefore).toEqual(date);
    });

    it('should set dueAfter', () => {
      const date = new Date('2024-01-01');
      const { query } = TodoQueryBuilder.create().dueAfter(date).build();
      expect(query.dueAfter).toEqual(date);
    });

    it('should set dueRelative', () => {
      const { query } = TodoQueryBuilder.create().dueRelative('today').build();
      expect(query.dueRelative).toBe('today');
    });

    it('should set hasDueDate', () => {
      const { query } = TodoQueryBuilder.create().hasDueDate(false).build();
      expect(query.hasDueDate).toBe(false);
    });
  });

  describe('sorting', () => {
    it('should set sort field and direction', () => {
      const { options } = TodoQueryBuilder.create()
        .sortBy('priority', 'desc')
        .build();
      expect(options.sort).toEqual({ field: 'priority', direction: 'desc' });
    });

    it('should default to descending order', () => {
      const { options } = TodoQueryBuilder.create().sortBy('created').build();
      expect(options.sort?.direction).toBe('desc');
    });
  });

  describe('pagination', () => {
    it('should set limit', () => {
      const { options } = TodoQueryBuilder.create().limit(10).build();
      expect(options.limit).toBe(10);
    });

    it('should set offset', () => {
      const { options } = TodoQueryBuilder.create().offset(20).build();
      expect(options.offset).toBe(20);
    });
  });

  describe('chaining', () => {
    it('should support fluent chaining', () => {
      const { query, options } = TodoQueryBuilder.create()
        .status('pending')
        .priority('high')
        .tags(['work'])
        .search('project')
        .sortBy('due', 'asc')
        .limit(10)
        .offset(0)
        .build();

      expect(query.status).toBe('pending');
      expect(query.priority).toBe('high');
      expect(query.tags).toEqual(['work']);
      expect(query.search).toBe('project');
      expect(options.sort).toEqual({ field: 'due', direction: 'asc' });
      expect(options.limit).toBe(10);
      expect(options.offset).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset the builder', () => {
      const builder = TodoQueryBuilder.create()
        .status('pending')
        .priority('high');

      builder.reset();
      const { query, options } = builder.build();

      expect(query).toEqual({});
      expect(options).toEqual({});
    });
  });
});
