// Test Helpers - Task ID: TASK-1-001-11

import type { Todo, CreateTodoInput } from '../types/todo.js';
import type { TodoRepository } from '../ports/todo-repository.js';
import type { IdGenerator } from '../ports/id-generator.js';
import type { Clock } from '../ports/clock.js';
import { vi } from 'vitest';

/**
 * Create a test todo with default values
 */
export function createTestTodo(overrides?: Partial<Todo>): Todo {
  const now = new Date('2024-01-15T10:00:00.000Z');
  return {
    id: 'test-id-123',
    title: 'Test Todo',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: null,
    tags: [],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    ...overrides,
  };
}

/**
 * Create a test input for creating a todo
 */
export function createTestInput(overrides?: Partial<CreateTodoInput>): CreateTodoInput {
  return {
    title: 'Test Todo',
    ...overrides,
  };
}

/**
 * Create a mock repository
 */
export function createMockRepository(): TodoRepository & {
  create: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  findAll: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
} {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    count: vi.fn(),
  };
}

/**
 * Create a mock ID generator
 */
export function createMockIdGenerator(ids: string[] = ['generated-id-1']): IdGenerator {
  let index = 0;
  return {
    generate: vi.fn(() => ids[index++ % ids.length] ?? 'default-id'),
  };
}

/**
 * Create a fixed clock for testing
 */
export function createFixedClock(time: Date = new Date('2024-01-15T10:00:00.000Z')): Clock {
  return {
    now: vi.fn(() => time),
  };
}
