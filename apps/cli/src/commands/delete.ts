// Delete Command - Task ID: TASK-1-001-09
// Constitution Reference: FEAT-1-001 FR-04

import { Command } from 'commander';
import { container } from '../container.js';
import { output } from '../utils/output.js';
import { confirm } from '../utils/interactive.js';
import { globalConfig } from '../options.js';

interface DeleteOptions {
  force?: boolean;
}

/**
 * Create the delete command
 */
export function deleteCommand(): Command {
  return new Command('delete')
    .alias('rm')
    .description('Delete a todo')
    .argument('<id>', 'The todo ID')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (id: string, options: DeleteOptions) => {
      // Get the todo first to show its title in confirmation
      const todo = await container.todoService.getById(id);

      // Confirm deletion unless --force is used
      if (!options.force) {
        const confirmed = await confirm(
          `Are you sure you want to delete '${todo.title}'?`,
          false
        );

        if (!confirmed) {
          output.info('Deletion cancelled');
          return;
        }
      }

      // Delete the todo
      await container.todoService.delete(id);

      // Output result
      if (globalConfig.json) {
        console.log(JSON.stringify({
          deleted: true,
          id: todo.id,
          title: todo.title,
        }, null, 2));
      } else {
        output.success('Todo deleted successfully');
        console.log(`  ID: ${todo.id}`);
      }
    });
}
