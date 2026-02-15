# FEAT-1-003: CLI Interface and UX

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-1-003 |
| **Phase** | I - CLI In-Memory |
| **Status** | Draft |
| **Priority** | P1 - High |
| **Constitution Refs** | AP-01, AP-03, CN-03 |
| **Dependencies** | FEAT-1-001, FEAT-1-002 |

---

## Overview

### Description
Implement the CLI application shell, including command routing, help system, configuration, and user experience enhancements.

### User Stories

```gherkin
AS A user
I WANT a well-designed CLI interface
SO THAT I can efficiently interact with the todo system

AS A user
I WANT helpful error messages and documentation
SO THAT I can learn and use the CLI effectively
```

### Acceptance Criteria

- [ ] AC-01: CLI provides help for all commands (`--help`, `-h`)
- [ ] AC-02: CLI shows version information (`--version`, `-v`)
- [ ] AC-03: Unknown commands show helpful suggestions
- [ ] AC-04: Errors display with clear formatting and suggestions
- [ ] AC-05: CLI supports both interactive and piped input
- [ ] AC-06: Exit codes follow conventions (0 success, 1 error)
- [ ] AC-07: CLI supports environment variable configuration
- [ ] AC-08: Shell completions available (bash, zsh, fish)

---

## Functional Requirements

### FR-01: Main Entry Point

**Binary Name:** `todo`

**Usage:**
```bash
todo <command> [options]
```

**Root Help:**
```
todo - A powerful command-line todo manager

Usage:
  todo <command> [options]

Commands:
  add      Create a new todo
  show     Display a single todo
  list     List and filter todos
  update   Update an existing todo
  delete   Delete a todo
  complete Mark todo as completed
  uncomplete Mark todo as pending

Options:
  -h, --help     Show help
  -v, --version  Show version
  --no-color     Disable colored output
  --json         Output in JSON format

Examples:
  todo add "Buy groceries" -p high
  todo list --status pending
  todo complete abc123

Documentation: https://github.com/org/todo-system
```

---

### FR-02: Help System

**Command Help:**
```bash
todo add --help
```

**Output:**
```
todo add - Create a new todo

Usage:
  todo add <title> [options]

Arguments:
  title    The todo title (required)

Options:
  -d, --description <text>  Todo description
  -p, --priority <level>    Priority: low, medium, high, urgent (default: medium)
  -D, --due <date>          Due date (ISO format or natural language)
  -T, --tags <tags>         Comma-separated tags

Examples:
  todo add "Complete report"
  todo add "Call client" -p urgent -D tomorrow
  todo add "Review PR" -T work,code -d "Review the authentication PR"
```

---

### FR-03: Version Information

**Command:** `todo --version` or `todo -v`

**Output:**
```
todo v1.0.0
Node.js v20.11.0
Platform: darwin-arm64
```

---

### FR-04: Error Handling

**Unknown Command:**
```bash
todo addd "typo"
```

**Output:**
```
✗ Unknown command: addd

Did you mean?
  add     Create a new todo
  update  Update an existing todo

Run 'todo --help' for usage.
```

**Missing Argument:**
```bash
todo add
```

**Output:**
```
✗ Error: Missing required argument: title

Usage: todo add <title> [options]

Examples:
  todo add "Buy groceries"
  todo add "Call mom" -p high
```

**Validation Error:**
```bash
todo add "" -p invalid
```

**Output:**
```
✗ Validation Error

  • Title is required and must be 1-200 characters
  • Priority must be one of: low, medium, high, urgent

Run 'todo add --help' for usage.
```

---

### FR-05: Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Todo not found |
| 4 | Validation error |

---

### FR-06: Environment Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `TODO_NO_COLOR` | Disable colors | false |
| `TODO_FORMAT` | Default output format | table |
| `TODO_EDITOR` | Editor for descriptions | $EDITOR |

---

### FR-07: Interactive Features

**Confirmation Prompts:**
```bash
todo delete abc123
? Are you sure you want to delete "Complete report"? (y/N)
```

**Interactive Mode (Future):**
```bash
todo interactive
# Opens TUI for todo management
```

---

### FR-08: Shell Completions

**Installation:**
```bash
# Bash
todo completion bash > /etc/bash_completion.d/todo

# Zsh
todo completion zsh > ~/.zsh/completions/_todo

# Fish
todo completion fish > ~/.config/fish/completions/todo.fish
```

**Completion Features:**
- Command names
- Option names
- Todo IDs (from current list)
- Priority values
- Status values

---

### FR-09: Piping Support

**Pipe Output:**
```bash
todo list --format json | jq '.[] | .title'
```

**Pipe Input:**
```bash
echo "New todo from pipe" | todo add -
cat todos.txt | xargs -I {} todo add "{}"
```

**Detection:**
- Detect when stdout is not a TTY
- Disable colors and interactive prompts
- Use machine-readable output format

---

## Technical Design

### Application Structure

```typescript
// apps/cli/src/index.ts

import { program } from 'commander';
import { registerCommands } from './commands';
import { setupGlobalOptions } from './options';
import { errorHandler } from './error-handler';

async function main() {
  setupGlobalOptions(program);
  registerCommands(program);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    errorHandler(error);
    process.exit(1);
  }
}

main();
```

### Command Registration

```typescript
// apps/cli/src/commands/index.ts

import { Command } from 'commander';
import { addCommand } from './add';
import { listCommand } from './list';
import { showCommand } from './show';
import { updateCommand } from './update';
import { deleteCommand } from './delete';
import { completeCommand } from './complete';

export function registerCommands(program: Command) {
  program.addCommand(addCommand);
  program.addCommand(listCommand);
  program.addCommand(showCommand);
  program.addCommand(updateCommand);
  program.addCommand(deleteCommand);
  program.addCommand(completeCommand);
}
```

### Error Handler

```typescript
// apps/cli/src/error-handler.ts

import chalk from 'chalk';
import { ZodError } from 'zod';

interface AppError extends Error {
  code?: string;
  suggestions?: string[];
}

export function errorHandler(error: unknown): number {
  if (error instanceof ZodError) {
    printValidationError(error);
    return 4;
  }

  if (error instanceof TodoNotFoundError) {
    printNotFoundError(error);
    return 3;
  }

  // ... handle other error types

  printGenericError(error);
  return 1;
}
```

### Output Utilities

```typescript
// apps/cli/src/utils/output.ts

export const output = {
  success: (message: string) => console.log(chalk.green('✓'), message),
  error: (message: string) => console.error(chalk.red('✗'), message),
  warn: (message: string) => console.warn(chalk.yellow('⚠'), message),
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
};

export function isInteractive(): boolean {
  return process.stdout.isTTY && !process.env.CI;
}
```

---

## Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| `commander` | CLI framework | ^12.0.0 |
| `chalk` | Terminal colors | ^5.3.0 |
| `inquirer` | Interactive prompts | ^9.2.0 |
| `ora` | Spinners | ^8.0.0 |

---

## Test Cases

### Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-040 | Parse add command | Correct options extracted |
| UT-041 | Parse list with filters | All filters parsed |
| UT-042 | Unknown command | Error with suggestions |
| UT-043 | Missing required arg | Clear error message |
| UT-044 | Invalid option value | Validation error |
| UT-045 | Help flag | Help text displayed |
| UT-046 | Version flag | Version info displayed |

### Integration Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| IT-010 | Full command execution | Exit code 0 |
| IT-011 | Error command execution | Appropriate exit code |
| IT-012 | Piped output | No colors, valid format |

---

## File Mapping

| File Path | Task ID | Description |
|-----------|---------|-------------|
| `apps/cli/src/index.ts` | TASK-1-003-01 | CLI entry point |
| `apps/cli/src/commands/index.ts` | TASK-1-003-02 | Command registration |
| `apps/cli/src/options.ts` | TASK-1-003-03 | Global options |
| `apps/cli/src/error-handler.ts` | TASK-1-003-04 | Error handling |
| `apps/cli/src/utils/output.ts` | TASK-1-003-05 | Output utilities |
| `apps/cli/src/utils/interactive.ts` | TASK-1-003-06 | Interactive helpers |
| `apps/cli/src/completion.ts` | TASK-1-003-07 | Shell completions |
| `apps/cli/package.json` | TASK-1-003-08 | Package configuration |
| `apps/cli/tsconfig.json` | TASK-1-003-09 | TypeScript config |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
