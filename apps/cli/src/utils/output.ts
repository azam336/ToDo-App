// Output Utilities - Task ID: TASK-1-003-05

import chalk from 'chalk';
import { globalConfig } from '../options.js';

/**
 * Check if running in interactive mode
 */
export function isInteractive(): boolean {
  return Boolean(process.stdout.isTTY) && !process.env['CI'];
}

/**
 * Output functions with consistent formatting
 */
export const output = {
  success(message: string): void {
    if (globalConfig.noColor) {
      console.log(`OK: ${message}`);
    } else {
      console.log(`${chalk.green('✓')} ${message}`);
    }
  },

  error(message: string): void {
    if (globalConfig.noColor) {
      console.error(`Error: ${message}`);
    } else {
      console.error(`${chalk.red('✗')} ${message}`);
    }
  },

  warn(message: string): void {
    if (globalConfig.noColor) {
      console.warn(`Warning: ${message}`);
    } else {
      console.warn(`${chalk.yellow('⚠')} ${message}`);
    }
  },

  info(message: string): void {
    if (globalConfig.noColor) {
      console.log(`Info: ${message}`);
    } else {
      console.log(`${chalk.blue('ℹ')} ${message}`);
    }
  },

  /**
   * Print raw text without prefix
   */
  print(message: string): void {
    console.log(message);
  },

  /**
   * Print a blank line
   */
  newline(): void {
    console.log('');
  },
};

/**
 * Format a label-value pair
 */
export function formatField(label: string, value: string, labelWidth: number = 12): string {
  const paddedLabel = label.padEnd(labelWidth);
  if (globalConfig.noColor) {
    return `${paddedLabel} ${value}`;
  }
  return `${chalk.dim(paddedLabel)} ${value}`;
}

/**
 * Format priority with color
 */
export function formatPriority(priority: string): string {
  if (globalConfig.noColor) {
    return `[${priority.toUpperCase()}]`;
  }

  switch (priority) {
    case 'urgent':
      return chalk.red.bold(`[URGENT]`);
    case 'high':
      return chalk.yellow(`[HIGH]`);
    case 'medium':
      return chalk.blue(`[MED]`);
    case 'low':
      return chalk.dim(`[LOW]`);
    default:
      return `[${priority.toUpperCase()}]`;
  }
}

/**
 * Format status with color
 */
export function formatStatus(status: string): string {
  if (globalConfig.noColor) {
    return status;
  }

  switch (status) {
    case 'completed':
      return chalk.green(status);
    case 'in_progress':
      return chalk.yellow(status);
    case 'pending':
      return chalk.dim(status);
    default:
      return status;
  }
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | null): string {
  if (!date) {
    return '-';
  }
  return date.toISOString().split('T')[0] ?? '-';
}

/**
 * Format tags for display
 */
export function formatTags(tags: string[]): string {
  if (tags.length === 0) {
    return '-';
  }
  if (globalConfig.noColor) {
    return tags.map(t => `#${t}`).join(' ');
  }
  return tags.map(t => chalk.cyan(`#${t}`)).join(' ');
}
