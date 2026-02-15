// Date Parsing Utilities - Task ID: TASK-1-003-07

import { addDays, addWeeks, nextMonday, parse, isValid } from 'date-fns';

/**
 * Parse a date string from user input
 * Supports ISO format and natural language
 */
export function parseDate(input: string): Date | null {
  const trimmed = input.trim().toLowerCase();

  // Try natural language first
  const naturalDate = parseNaturalDate(trimmed);
  if (naturalDate) {
    return naturalDate;
  }

  // Try ISO format (YYYY-MM-DD)
  const isoDate = parse(input, 'yyyy-MM-dd', new Date());
  if (isValid(isoDate)) {
    return isoDate;
  }

  // Try other common formats
  const formats = [
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy/MM/dd',
    'MM-dd-yyyy',
  ];

  for (const format of formats) {
    const parsed = parse(input, format, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Parse natural language date expressions
 */
function parseNaturalDate(input: string): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (input) {
    case 'today':
      return today;

    case 'tomorrow':
      return addDays(today, 1);

    case 'yesterday':
      return addDays(today, -1);

    case 'next week':
    case 'nextweek':
      return addWeeks(today, 1);

    case 'next monday':
    case 'monday':
      return nextMonday(today);

    default:
      // Handle "in X days" pattern
      const inDaysMatch = input.match(/^in (\d+) days?$/);
      if (inDaysMatch?.[1]) {
        return addDays(today, parseInt(inDaysMatch[1], 10));
      }

      // Handle "in X weeks" pattern
      const inWeeksMatch = input.match(/^in (\d+) weeks?$/);
      if (inWeeksMatch?.[1]) {
        return addWeeks(today, parseInt(inWeeksMatch[1], 10));
      }

      return null;
  }
}

/**
 * Format a date for CLI output
 */
export function formatDateForDisplay(date: Date | null): string {
  if (!date) {
    return '-';
  }
  return date.toISOString().split('T')[0] ?? '-';
}

/**
 * Format a date with time for CLI output
 */
export function formatDateTimeForDisplay(date: Date | null): string {
  if (!date) {
    return '-';
  }
  return date.toISOString().replace('T', ' ').substring(0, 19);
}
