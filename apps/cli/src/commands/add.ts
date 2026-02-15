// Add Command - Task ID: TASK-1-001-06
// Constitution Reference: FEAT-1-001 FR-01

import { Command } from 'commander';
import type { Priority } from '@todo/core';
import { container } from '../container.js';
import { output, formatField, formatPriority, formatDate, formatTags } from '../utils/output.js';
import { parseDate } from '../utils/date.js';
import { globalConfig } from '../options.js';

interface AddOptions {
  description?: string;
  priority?: Priority;
  due?: string;
  tags?: string;
}

/**
 * Create the add command
 */
export function addCommand(): Command {
  return new Command('add')
    .description('Create a new todo')
    .argument('<title>', 'The todo title')
    .option('-d, --description <text>', 'Todo description')
    .option('-p, --priority <level>', 'Priority: low, medium, high, urgent', 'medium')
    .option('-D, --due <date>', 'Due date (ISO format or natural language)')
    .option('-T, --tags <tags>', 'Comma-separated tags')
    .action(async (title: string, options: AddOptions) => {
      // Parse due date if provided
      let dueDate: Date | undefined;
      if (options.due) {
        const parsed = parseDate(options.due);
        if (!parsed) {
          output.error(`Invalid date format: ${options.due}`);
          output.info('Use ISO format (YYYY-MM-DD) or natural language (tomorrow, next week)');
          process.exit(4);
        }
        dueDate = parsed;
      }

      // Parse tags
      const tags = options.tags
        ? options.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      // Build input object, only including defined optional fields
      const input: Parameters<typeof container.todoService.create>[0] = {
        title,
        tags,
      };

      if (options.description !== undefined) {
        input.description = options.description;
      }
      if (options.priority !== undefined) {
        input.priority = options.priority as Priority;
      }
      if (dueDate !== undefined) {
        input.dueDate = dueDate;
      }

      // Create the todo
      const todo = await container.todoService.create(input);

      // Output result
      if (globalConfig.json) {
        console.log(JSON.stringify({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
          priority: todo.priority,
          dueDate: todo.dueDate?.toISOString() ?? null,
          tags: todo.tags,
          createdAt: todo.createdAt.toISOString(),
        }, null, 2));
      } else {
        output.success('Todo created successfully');
        console.log('');
        console.log(formatField('ID:', todo.id));
        console.log(formatField('Title:', todo.title));
        console.log(formatField('Priority:', formatPriority(todo.priority)));
        console.log(formatField('Due:', formatDate(todo.dueDate)));
        console.log(formatField('Tags:', formatTags(todo.tags)));
      }
    });
}
