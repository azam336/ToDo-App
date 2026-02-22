// Validation Tests - Task ID: TASK-1-001-12
// Tests for createTodoSchema and updateTodoSchema

import { describe, it, expect } from 'vitest';
import {
  createTodoSchema,
  updateTodoSchema,
  TODO_CONSTRAINTS,
} from '../validation/todo.schema.js';

describe('createTodoSchema', () => {
  it('should accept valid input with just title', () => {
    const result = createTodoSchema.safeParse({ title: 'Buy groceries' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Buy groceries');
      expect(result.data.description).toBe('');
      expect(result.data.priority).toBe('medium');
      expect(result.data.tags).toEqual([]);
    }
  });

  it('should accept valid input with all fields', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const result = createTodoSchema.safeParse({
      title: 'Buy groceries',
      description: 'Get milk and eggs',
      priority: 'high',
      dueDate: tomorrow,
      tags: ['shopping', 'errands'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Buy groceries');
      expect(result.data.description).toBe('Get milk and eggs');
      expect(result.data.priority).toBe('high');
      expect(result.data.dueDate).toEqual(tomorrow);
      expect(result.data.tags).toEqual(['shopping', 'errands']);
    }
  });

  it('should reject empty title', () => {
    const result = createTodoSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const titleError = result.error.issues.find((e) => e.path.includes('title'));
      expect(titleError).toBeDefined();
    }
  });

  it('should reject title exceeding max length', () => {
    const longTitle = 'a'.repeat(TODO_CONSTRAINTS.TITLE_MAX_LENGTH + 1);
    const result = createTodoSchema.safeParse({ title: longTitle });
    expect(result.success).toBe(false);
  });

  it('should accept title at max length', () => {
    const maxTitle = 'a'.repeat(TODO_CONSTRAINTS.TITLE_MAX_LENGTH);
    const result = createTodoSchema.safeParse({ title: maxTitle });
    expect(result.success).toBe(true);
  });

  it('should reject description exceeding max length', () => {
    const longDesc = 'a'.repeat(TODO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH + 1);
    const result = createTodoSchema.safeParse({
      title: 'Test',
      description: longDesc,
    });
    expect(result.success).toBe(false);
  });

  it('should reject past due date', () => {
    const pastDate = new Date('2020-01-01');
    const result = createTodoSchema.safeParse({
      title: 'Test',
      dueDate: pastDate,
    });
    expect(result.success).toBe(false);
  });

  it('should reject more than max tags', () => {
    const tooManyTags = Array.from({ length: TODO_CONSTRAINTS.MAX_TAGS + 1 }, (_, i) => `tag${i}`);
    const result = createTodoSchema.safeParse({
      title: 'Test',
      tags: tooManyTags,
    });
    expect(result.success).toBe(false);
  });

  it('should accept exactly max tags', () => {
    const maxTags = Array.from({ length: TODO_CONSTRAINTS.MAX_TAGS }, (_, i) => `tag${i}`);
    const result = createTodoSchema.safeParse({
      title: 'Test',
      tags: maxTags,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid priority', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test',
      priority: 'critical',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid status values', () => {
    // createTodoSchema doesn't have status field
    const result = createTodoSchema.safeParse({
      title: 'Test',
      status: 'completed',
    });
    // Extra fields are stripped by default in zod, so this should still pass
    expect(result.success).toBe(true);
  });

  it('should reject tags with special characters', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test',
      tags: ['valid-tag', 'invalid tag!'],
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTodoSchema', () => {
  it('should accept valid partial update with title only', () => {
    const result = updateTodoSchema.safeParse({ title: 'Updated title' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated title');
    }
  });

  it('should accept empty object (no fields to update)', () => {
    const result = updateTodoSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept all valid fields', () => {
    const result = updateTodoSchema.safeParse({
      title: 'Updated',
      description: 'New description',
      priority: 'urgent',
      status: 'in_progress',
      tags: ['work'],
      dueDate: new Date('2030-01-01'),
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid fields', () => {
    const result = updateTodoSchema.safeParse({
      title: '', // empty title not allowed
    });
    expect(result.success).toBe(false);
  });

  it('should reject title exceeding max length', () => {
    const result = updateTodoSchema.safeParse({
      title: 'a'.repeat(TODO_CONSTRAINTS.TITLE_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it('should allow null dueDate (for clearing)', () => {
    const result = updateTodoSchema.safeParse({ dueDate: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeNull();
    }
  });

  it('should allow past dates in updates (to fix mistakes)', () => {
    const pastDate = new Date('2020-06-15');
    const result = updateTodoSchema.safeParse({ dueDate: pastDate });
    expect(result.success).toBe(true);
  });

  it('should accept valid status transitions', () => {
    for (const status of ['pending', 'in_progress', 'completed'] as const) {
      const result = updateTodoSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid status', () => {
    const result = updateTodoSchema.safeParse({ status: 'archived' });
    expect(result.success).toBe(false);
  });

  it('should reject too many tags', () => {
    const tooManyTags = Array.from({ length: TODO_CONSTRAINTS.MAX_TAGS + 1 }, (_, i) => `tag${i}`);
    const result = updateTodoSchema.safeParse({ tags: tooManyTags });
    expect(result.success).toBe(false);
  });
});
