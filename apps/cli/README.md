# @todo/cli - Command Line Todo Manager

Phase I implementation of the Evolving Todo System CLI.

## Features

- Create, read, update, delete todos
- Mark todos as complete/incomplete
- List and filter todos by status, priority, tags, and due date
- Search todos by title and description
- Multiple output formats (table, compact, JSON, CSV)

## Installation

```bash
# From the monorepo root
pnpm install
pnpm build

# Run the CLI
node apps/cli/dist/index.js --help
# Or via pnpm
pnpm --filter @todo/cli start -- --help
```

## Usage

### Create a Todo

```bash
todo add "My task" -p high -D tomorrow -T work,urgent
```

**Options:**
- `-d, --description <text>` - Todo description
- `-p, --priority <level>` - Priority: low, medium, high, urgent (default: medium)
- `-D, --due <date>` - Due date (ISO format or natural language)
- `-T, --tags <tags>` - Comma-separated tags

### List Todos

```bash
todo list
todo list --status pending
todo list --priority high,urgent
todo list --tag work
todo list --search "project"
todo list --due today
todo list --format compact
```

**Filter Options:**
- `-s, --status <status>` - Filter by status (pending, in_progress, completed, active, all)
- `-p, --priority <priority>` - Filter by priority (comma-separated)
- `-T, --tag <tags>` - Filter by tags (comma-separated)
- `-q, --search <query>` - Search in title and description
- `--due <range>` - Filter by relative due date (today, tomorrow, week, overdue)
- `--due-before <date>` - Filter todos due before date
- `--due-after <date>` - Filter todos due after date
- `--no-due` - Filter todos without a due date

**Sort & Pagination:**
- `-S, --sort <field>` - Sort by field (created, updated, due, priority, title, status)
- `-a, --asc` - Sort in ascending order
- `-l, --limit <n>` - Limit results (default: 20)
- `-o, --offset <n>` - Skip N results
- `--all` - Show all results

**Output Formats:**
- `-f, --format <format>` - Output format: table, compact, json, csv

### Show Todo

```bash
todo show <id>
```

### Update Todo

```bash
todo update <id> --title "New title" --priority urgent
todo update <id> --clear-due
```

### Delete Todo

```bash
todo delete <id>
todo delete <id> --force  # Skip confirmation
```

### Complete/Uncomplete

```bash
todo complete <id>
todo uncomplete <id>
```

## Global Options

- `--no-color` - Disable colored output
- `--json` - Output in JSON format
- `-v, --version` - Show version
- `-h, --help` - Show help

## Phase I Limitations

**In-Memory Storage:** This Phase I implementation uses in-memory storage. Todos are not persisted between CLI invocations. Persistent storage will be added in Phase II.

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Architecture

See `/specs/architecture/ARCH-001-phase1-cli-architecture.md` for detailed architecture documentation.

## License

MIT
