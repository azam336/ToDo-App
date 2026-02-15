// Dependency Container - Task ID: TASK-1-003-08

import {
  TodoService,
  InMemoryTodoRepository,
  NanoIdGenerator,
  SystemClock,
  type TodoRepository,
} from '@todo/core';

/**
 * Application container holding all dependencies
 */
export interface Container {
  todoService: TodoService;
  repository: TodoRepository;
}

/**
 * Create a new container with all dependencies wired up
 */
export function createContainer(): Container {
  // Infrastructure
  const idGenerator = new NanoIdGenerator();
  const clock = new SystemClock();
  const repository = new InMemoryTodoRepository();

  // Services
  const todoService = new TodoService(repository, idGenerator, clock);

  return {
    todoService,
    repository,
  };
}

/**
 * Singleton container for CLI lifetime
 */
export const container = createContainer();
