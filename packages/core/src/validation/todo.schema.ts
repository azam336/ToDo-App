// Todo Validation Schemas - Task ID: TASK-1-001-02
// Constitution Reference: Article VII, Section 7.2 (Business Rules)

import { z } from 'zod';

/**
 * Validation constants
 * @see Constitution BR-01, BR-03
 */
export const TODO_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_TAGS: 10,
  TAG_MAX_LENGTH: 50,
} as const;

/**
 * Todo status schema
 */
export const todoStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

/**
 * Priority schema
 */
export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Tag schema - single tag validation
 */
export const tagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(TODO_CONSTRAINTS.TAG_MAX_LENGTH, `Tag must be at most ${TODO_CONSTRAINTS.TAG_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Tag can only contain letters, numbers, underscores, and hyphens');

/**
 * Tags array schema
 */
export const tagsSchema = z
  .array(tagSchema)
  .max(TODO_CONSTRAINTS.MAX_TAGS, `Maximum ${TODO_CONSTRAINTS.MAX_TAGS} tags allowed`)
  .default([]);

/**
 * Due date validation - must not be in the past (for creation)
 * @see Constitution BR-03
 */
export const futureDateSchema = z
  .date()
  .refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: 'Due date cannot be in the past' }
  );

/**
 * Schema for creating a new todo
 * @see Constitution BR-01
 */
export const createTodoSchema = z.object({
  title: z
    .string()
    .min(TODO_CONSTRAINTS.TITLE_MIN_LENGTH, 'Title is required')
    .max(TODO_CONSTRAINTS.TITLE_MAX_LENGTH, `Title must be at most ${TODO_CONSTRAINTS.TITLE_MAX_LENGTH} characters`),

  description: z
    .string()
    .max(TODO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `Description must be at most ${TODO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`)
    .default(''),

  priority: prioritySchema.default('medium'),

  dueDate: futureDateSchema.optional(),

  tags: tagsSchema,
});

/**
 * Schema for updating an existing todo
 * All fields are optional for partial updates
 */
export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(TODO_CONSTRAINTS.TITLE_MIN_LENGTH, 'Title cannot be empty')
    .max(TODO_CONSTRAINTS.TITLE_MAX_LENGTH, `Title must be at most ${TODO_CONSTRAINTS.TITLE_MAX_LENGTH} characters`)
    .optional(),

  description: z
    .string()
    .max(TODO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH, `Description must be at most ${TODO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`)
    .optional(),

  priority: prioritySchema.optional(),

  // For updates, we allow past dates (to fix mistakes) or null (to clear)
  dueDate: z.date().nullable().optional(),

  tags: z
    .array(tagSchema)
    .max(TODO_CONSTRAINTS.MAX_TAGS, `Maximum ${TODO_CONSTRAINTS.MAX_TAGS} tags allowed`)
    .optional(),

  status: todoStatusSchema.optional(),
});

/**
 * Inferred types from schemas
 */
export type CreateTodoSchemaInput = z.input<typeof createTodoSchema>;
export type CreateTodoSchemaOutput = z.output<typeof createTodoSchema>;
export type UpdateTodoSchemaInput = z.input<typeof updateTodoSchema>;
export type UpdateTodoSchemaOutput = z.output<typeof updateTodoSchema>;
