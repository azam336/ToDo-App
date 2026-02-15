// Command Registration - Task ID: TASK-1-003-02

import { Command } from 'commander';
import { addCommand } from './add.js';
import { showCommand } from './show.js';
import { listCommand } from './list.js';
import { updateCommand } from './update.js';
import { deleteCommand } from './delete.js';
import { completeCommand, uncompleteCommand } from './complete.js';

/**
 * Register all commands on the program
 */
export function registerCommands(program: Command): void {
  program.addCommand(addCommand());
  program.addCommand(showCommand());
  program.addCommand(listCommand());
  program.addCommand(updateCommand());
  program.addCommand(deleteCommand());
  program.addCommand(completeCommand());
  program.addCommand(uncompleteCommand());
}
