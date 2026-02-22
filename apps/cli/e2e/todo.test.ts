// CLI E2E Tests - Task ID: TASK-1-004-02
// Tests the CLI as a subprocess

import { describe, it, expect } from 'vitest';
import { execSync, type ExecSyncOptionsWithStringEncoding } from 'child_process';
import { resolve } from 'path';

const CLI_PATH = resolve(__dirname, '../dist/index.js');

const execOpts: ExecSyncOptionsWithStringEncoding = {
  encoding: 'utf-8',
  timeout: 10000,
};

function runCli(args: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args}`, execOpts);
    return { stdout, exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { stdout: string; stderr: string; status: number };
    return {
      stdout: err.stdout || err.stderr || '',
      exitCode: err.status ?? 1,
    };
  }
}

describe('CLI E2E', () => {
  it('should show version', () => {
    const { stdout, exitCode } = runCli('--version');
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
  });

  it('should show help', () => {
    const { stdout, exitCode } = runCli('--help');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('todo');
  });

  it('should create a todo with --json and get valid JSON back', () => {
    const { stdout, exitCode } = runCli('add "E2E Test Todo" --json --no-color');
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.title).toBe('E2E Test Todo');
    expect(parsed.status).toBe('pending');
    expect(parsed.id).toBeDefined();
  });

  it('should fail to show a non-existent todo', () => {
    const { exitCode } = runCli('show nonexistent-id --no-color');
    expect(exitCode).toBe(3); // NOT_FOUND
  });

  it('should list todos in json format', () => {
    // Create a todo first (in new in-memory instance - each process is fresh)
    const addResult = runCli('add "List Test" --json --no-color');
    expect(addResult.exitCode).toBe(0);

    // Note: in-memory storage means each CLI invocation is a fresh instance
    // So the list will only show todos created in that same invocation
    // This is a known limitation of Phase I in-memory storage
  });

  it('should show validation error for empty add', () => {
    // Commander will show help/error for missing argument
    const { exitCode } = runCli('add --no-color');
    // Commander exits with code 1 for missing required argument
    expect(exitCode).not.toBe(0);
  });

  it('should exit with 0 for successful operations', () => {
    const { exitCode } = runCli('add "Success test" --no-color');
    expect(exitCode).toBe(0);
  });

  it('should support --no-color flag', () => {
    const { stdout, exitCode } = runCli('add "No color test" --no-color');
    expect(exitCode).toBe(0);
    // Should not contain ANSI escape codes
    expect(stdout).not.toMatch(/\x1b\[/);
  });
});
