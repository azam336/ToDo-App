// Update Command - Task ID: TASK-1-001-08
// Constitution Reference: FEAT-1-001 FR-03

import { Command } from 'commander';
import type { Priority, TodoStatus } from '@todo/core';
import { container } from '../container.js';
import { output, formatField } from '../utils/output.js';
import { parseDate } from '../utils/date.js';
import { globalConfig } from '../options.js';

interface UpdateOptions {
  title?: string;
  description?: string;
  priority?: Priority;
  due?: string;
  clearDue?: boolean;
  tags?: string;
  status?: TodoStatus;
}

/**
 * Create the update command
 */
export function updateCommand(): Command {
  return new Command('update')
    .description('Update an existing todo')
    .argument('<id>', 'The todo ID')
    .option('-t, --title <title>', 'New title')
    .option('-d, --description <text>', 'New description')
    .option('-p, --priority <level>', 'New priority: low, medium, high, urgent')
    .option('-D, --due <date>', 'New due date')
    .option('--clear-due', 'Remove the due date')
    .option('-T, --tags <tags>', 'New tags (comma-separated)')
    .option('-s, --status <status>', 'New status: pending, in_progress, completed')
    .action(async (id: string, options: UpdateOptions) => {
      const changes: string[] = [];

      // Build update input
      const updateInput: Record<string, unknown> = {};

      if (options.title !== undefined) {
        updateInput['title'] = options.title;
        changes.push('title');
      }

      if (options.description !== undefined) {
        updateInput['description'] = options.description;
        changes.push('description');
      }

      if (options.priority !== undefined) {
        updateInput['priority'] = options.priority;
        changes.push('priority');
      }

      if (options.clearDue) {
        updateInput['dueDate'] = null;
        changes.push('dueDate');
      } else if (options.due !== undefined) {
        const parsed = parseDate(options.due);
        if (!parsed) {
          output.error(`Invalid date format: ${options.due}`);
          process.exit(4);
        }
        updateInput['dueDate'] = parsed;
        changes.push('dueDate');
      }

      if (options.tags !== undefined) {
        updateInput['tags'] = options.tags.split(',').map((t) => t.trim()).filter(Boolean);
        changes.push('tags');
      }

      if (options.status !== undefined) {
        updateInput['status'] = options.status;
        changes.push('status');
      }

      if (changes.length === 0) {
        output.warn('No changes specified');
        output.info("Use 'todo update --help' to see available options");
        return;
      }

      // Perform update
      const todo = await container.todoService.update(id, updateInput);

      // Output result
      if (globalConfig.json) {
        console.log(JSON.stringify({
          id: todo.id,
          changes,
          todo: {
            id: todo.id,
            title: todo.title,
            description: todo.description,
            status: todo.status,
            priority: todo.priority,
            dueDate: todo.dueDate?.toISOString() ?? null,
            tags: todo.tags,
            updatedAt: todo.updatedAt.toISOString(),
          },
        }, null, 2));
      } else {
        output.success('Todo updated successfully');
        console.log(formatField('ID:', todo.id));
        console.log(formatField('Changes:', changes.join(', ')));
      }
    });
}
