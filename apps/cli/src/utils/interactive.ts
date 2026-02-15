// Interactive Utilities - Task ID: TASK-1-003-06

import inquirer from 'inquirer';
import { isInteractive } from './output.js';

/**
 * Ask for confirmation
 * Returns true if user confirms, false otherwise
 * In non-interactive mode, returns defaultValue
 */
export async function confirm(
  message: string,
  defaultValue: boolean = false
): Promise<boolean> {
  if (!isInteractive()) {
    return defaultValue;
  }

  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue,
    },
  ]);

  return confirmed;
}

/**
 * Ask for text input
 * In non-interactive mode, returns defaultValue
 */
export async function prompt(
  message: string,
  defaultValue: string = ''
): Promise<string> {
  if (!isInteractive()) {
    return defaultValue;
  }

  const { value } = await inquirer.prompt<{ value: string }>([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue,
    },
  ]);

  return value;
}

/**
 * Ask for selection from choices
 */
export async function select<T extends string>(
  message: string,
  choices: Array<{ name: string; value: T }>,
  defaultValue?: T
): Promise<T> {
  if (!isInteractive()) {
    return defaultValue ?? choices[0]?.value ?? ('' as T);
  }

  const { value } = await inquirer.prompt<{ value: T }>([
    {
      type: 'list',
      name: 'value',
      message,
      choices,
      default: defaultValue,
    },
  ]);

  return value;
}
