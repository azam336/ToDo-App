// List Command - Task ID: TASK-1-002-04
// Constitution Reference: FEAT-1-002

import { Command, Option } from 'commander';
import { TodoQueryBuilder, type Priority, type TodoStatus, type TodoSortField } from '@todo/core';
import { container } from '../container.js';
import { formatTodos, type OutputFormat } from '../formatters/index.js';
import { parseDate } from '../utils/date.js';
import { output } from '../utils/output.js';

interface ListOptions {
  status?: string;
  priority?: string;
  tag?: string;
  tagAll?: boolean;
  search?: string;
  due?: string;
  dueBefore?: string;
  dueAfter?: string;
  noDue?: boolean;
  sort?: string;
  asc?: boolean;
  limit?: string;
  offset?: string;
  all?: boolean;
  format?: OutputFormat;
}

/**
 * Create the list command
 */
export function listCommand(): Command {
  return new Command('list')
    .alias('ls')
    .description('List and filter todos')
    .option('-s, --status <status>', 'Filter by status (pending, in_progress, completed, active, all)')
    .option('-p, --priority <priority>', 'Filter by priority (comma-separated: low,medium,high,urgent)')
    .option('-T, --tag <tags>', 'Filter by tags (comma-separated)')
    .option('--tag-all', 'Require all tags (AND logic) instead of any (OR logic)')
    .option('-q, --search <query>', 'Search in title and description')
    .option('--due <range>', 'Filter by relative due date (today, tomorrow, week, overdue)')
    .option('--due-before <date>', 'Filter todos due before date')
    .option('--due-after <date>', 'Filter todos due after date')
    .option('--no-due', 'Filter todos without a due date')
    .option('-S, --sort <field>', 'Sort by field (created, updated, due, priority, title, status)')
    .option('-a, --asc', 'Sort in ascending order (default: descending)')
    .option('-l, --limit <n>', 'Limit number of results', '20')
    .option('-o, --offset <n>', 'Skip N results', '0')
    .option('--all', 'Show all results (ignore limit)')
    .addOption(
      new Option('-f, --format <format>', 'Output format')
        .choices(['table', 'compact', 'json', 'csv'])
        .default('table')
    )
    .action(async (options: ListOptions) => {
      const builder = TodoQueryBuilder.create();

      // Status filter
      if (options.status) {
        if (options.status === 'active' || options.status === 'all') {
          builder.status(options.status);
        } else {
          const statuses = options.status.split(',') as TodoStatus[];
          builder.status(statuses.length === 1 ? statuses[0]! : statuses);
        }
      }

      // Priority filter
      if (options.priority) {
        const priorities = options.priority.split(',') as Priority[];
        builder.priority(priorities.length === 1 ? priorities[0]! : priorities);
      }

      // Tags filter
      if (options.tag) {
        const tags = options.tag.split(',').map((t) => t.trim()).filter(Boolean);
        builder.tags(tags, options.tagAll ?? false);
      }

      // Search
      if (options.search) {
        builder.search(options.search);
      }

      // Due date filters
      if (options.due) {
        const validRelative = ['today', 'tomorrow', 'week', 'overdue'] as const;
        if (validRelative.includes(options.due as typeof validRelative[number])) {
          builder.dueRelative(options.due as 'today' | 'tomorrow' | 'week' | 'overdue');
        }
      }

      if (options.dueBefore) {
        const date = parseDate(options.dueBefore);
        if (date) {
          builder.dueBefore(date);
        } else {
          output.error(`Invalid date: ${options.dueBefore}`);
          process.exit(4);
        }
      }

      if (options.dueAfter) {
        const date = parseDate(options.dueAfter);
        if (date) {
          builder.dueAfter(date);
        } else {
          output.error(`Invalid date: ${options.dueAfter}`);
          process.exit(4);
        }
      }

      if (options.noDue) {
        builder.hasDueDate(false);
      }

      // Sorting
      if (options.sort) {
        const validFields = ['created', 'updated', 'due', 'priority', 'title', 'status'];
        if (validFields.includes(options.sort)) {
          builder.sortBy(
            options.sort as TodoSortField,
            options.asc ? 'asc' : 'desc'
          );
        }
      }

      // Pagination
      if (!options.all) {
        const limit = parseInt(options.limit ?? '20', 10);
        const offset = parseInt(options.offset ?? '0', 10);
        if (!isNaN(limit)) builder.limit(limit);
        if (!isNaN(offset)) builder.offset(offset);
      }

      const { query, options: queryOptions } = builder.build();
      const result = await container.todoService.findAll(query, queryOptions);

      // Output
      const formatted = formatTodos(result.todos, options.format ?? 'table', result.total);
      console.log(formatted);

      // Show pagination info if there are more results
      if (result.hasMore && options.format === 'table') {
        output.info(`Showing ${result.todos.length} of ${result.total} todos. Use --all to show all.`);
      }
    });
}
