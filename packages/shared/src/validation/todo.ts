import { z } from 'zod';

export const todoStatusSchema = z.enum(['pending', 'in_progress', 'completed']);
export const todoPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .default(''),
  priority: todoPrioritySchema.optional().default('medium'),
  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return new Date(val) > new Date();
      },
      { message: 'Due date must be in the future' }
    ),
  tags: z
    .array(z.string().max(50, 'Tag must be at most 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
});

export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be at most 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  status: todoStatusSchema.optional(),
  priority: todoPrioritySchema.optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .nullable()
    .optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be at most 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export const todoFiltersSchema = z.object({
  status: todoStatusSchema.optional(),
  priority: todoPrioritySchema.optional(),
  tags: z.string().optional(),
  search: z.string().max(200).optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  sort: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type TodoFiltersInput = z.infer<typeof todoFiltersSchema>;
