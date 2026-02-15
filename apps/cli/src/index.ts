#!/usr/bin/env node
// CLI Entry Point - Task ID: TASK-1-003-01
// Constitution Reference: FEAT-1-003

import { program } from 'commander';
import { registerCommands } from './commands/index.js';
import { setupGlobalOptions } from './options.js';
import { errorHandler } from './error-handler.js';

const VERSION = '0.0.1';

async function main(): Promise<void> {
  program
    .name('todo')
    .description('A powerful command-line todo manager')
    .version(VERSION, '-v, --version', 'Show version information');

  setupGlobalOptions(program);
  registerCommands(program);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const exitCode = errorHandler(error);
    process.exit(exitCode);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
