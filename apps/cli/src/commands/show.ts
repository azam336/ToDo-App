// Show Command - Task ID: TASK-1-001-07
// Constitution Reference: FEAT-1-001 FR-02

import { Command } from 'commander';
import chalk from 'chalk';
import { container } from '../container.js';
import {
  formatField,
  formatStatus,
  formatPriority,
  formatDate,
  formatTags,
} from '../utils/output.js';
import { formatDateTimeForDisplay } from '../utils/date.js';
import { globalConfig } from '../options.js';

/**
 * Create the show command
 */
export function showCommand(): Command {
  return new Command('show')
    .description('Display a single todo')
    .argument('<id>', 'The todo ID')
    .action(async (id: string) => {
      const todo = await container.todoService.getById(id);

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
          updatedAt: todo.updatedAt.toISOString(),
          completedAt: todo.completedAt?.toISOString() ?? null,
        }, null, 2));
        return;
      }

      // Box drawing
      const width = 45;
      const topBorder = globalConfig.noColor
        ? `+${'-'.repeat(width)}+`
        : chalk.dim(`┌${'─'.repeat(width)}┐`);
      const bottomBorder = globalConfig.noColor
        ? `+${'-'.repeat(width)}+`
        : chalk.dim(`└${'─'.repeat(width)}┘`);
      const separator = globalConfig.noColor
        ? `+${'-'.repeat(width)}+`
        : chalk.dim(`├${'─'.repeat(width)}┤`);

      console.log(topBorder);
      console.log(formatBoxLine(`Todo: ${todo.id}`, width));
      console.log(separator);
      console.log(formatBoxLine(`Title:       ${todo.title}`, width));
      console.log(formatBoxLine(`Description: ${todo.description || '-'}`, width));
      console.log(formatBoxLine(`Status:      ${formatStatus(todo.status)}`, width));
      console.log(formatBoxLine(`Priority:    ${formatPriority(todo.priority)}`, width));
      console.log(formatBoxLine(`Due Date:    ${formatDate(todo.dueDate)}`, width));
      console.log(formatBoxLine(`Tags:        ${formatTags(todo.tags)}`, width));
      console.log(formatBoxLine(`Created:     ${formatDateTimeForDisplay(todo.createdAt)}`, width));
      console.log(formatBoxLine(`Updated:     ${formatDateTimeForDisplay(todo.updatedAt)}`, width));
      if (todo.completedAt) {
        console.log(formatBoxLine(`Completed:   ${formatDateTimeForDisplay(todo.completedAt)}`, width));
      }
      console.log(bottomBorder);
    });
}

/**
 * Format a line for the box
 */
function formatBoxLine(content: string, width: number): string {
  // Strip ANSI codes for length calculation
  const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '');
  const visibleLength = stripAnsi(content).length;
  const padding = Math.max(0, width - visibleLength - 2);

  if (globalConfig.noColor) {
    return `| ${content}${' '.repeat(padding)} |`;
  }
  return `${chalk.dim('│')} ${content}${' '.repeat(padding)} ${chalk.dim('│')}`;
}
