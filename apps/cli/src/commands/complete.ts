// Complete/Uncomplete Commands - Task ID: TASK-1-001-10
// Constitution Reference: FEAT-1-001 FR-05

import { Command } from 'commander';
import { container } from '../container.js';
import { output, formatField } from '../utils/output.js';
import { formatDateTimeForDisplay } from '../utils/date.js';
import { globalConfig } from '../options.js';

/**
 * Create the complete command
 */
export function completeCommand(): Command {
  return new Command('complete')
    .description('Mark a todo as completed')
    .argument('<id>', 'The todo ID')
    .action(async (id: string) => {
      const todo = await container.todoService.complete(id);

      if (globalConfig.json) {
        console.log(JSON.stringify({
          id: todo.id,
          status: todo.status,
          completedAt: todo.completedAt?.toISOString() ?? null,
        }, null, 2));
      } else {
        output.success('Todo marked as completed');
        console.log(formatField('ID:', todo.id));
        console.log(formatField('Completed:', formatDateTimeForDisplay(todo.completedAt)));
      }
    });
}

/**
 * Create the uncomplete command
 */
export function uncompleteCommand(): Command {
  return new Command('uncomplete')
    .description('Mark a todo as pending (uncomplete)')
    .argument('<id>', 'The todo ID')
    .action(async (id: string) => {
      const todo = await container.todoService.uncomplete(id);

      if (globalConfig.json) {
        console.log(JSON.stringify({
          id: todo.id,
          status: todo.status,
        }, null, 2));
      } else {
        output.success('Todo marked as pending');
        console.log(formatField('ID:', todo.id));
        console.log(formatField('Status:', todo.status));
      }
    });
}
