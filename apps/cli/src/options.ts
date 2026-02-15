// Global CLI Options - Task ID: TASK-1-003-03

import { Command } from 'commander';

/**
 * Global configuration derived from environment and options
 */
export interface GlobalConfig {
  noColor: boolean;
  json: boolean;
}

/**
 * Global config singleton
 */
export const globalConfig: GlobalConfig = {
  noColor: process.env['TODO_NO_COLOR'] === 'true' || process.env['NO_COLOR'] === '1',
  json: false,
};

/**
 * Setup global options on the commander program
 */
export function setupGlobalOptions(program: Command): void {
  program
    .option('--no-color', 'Disable colored output')
    .option('--json', 'Output in JSON format')
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts['color'] === false) {
        globalConfig.noColor = true;
      }
      if (opts['json']) {
        globalConfig.json = true;
      }
    });
}
