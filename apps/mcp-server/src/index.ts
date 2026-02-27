import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from './config.js';
import { createTodoHandler } from './tools/create-todo.js';
import { listTodosHandler } from './tools/list-todos.js';
import { updateTodoHandler } from './tools/update-todo.js';
import { deleteTodoHandler } from './tools/delete-todo.js';
import { completeTodoHandler } from './tools/complete-todo.js';

const server = new Server(
  { name: 'todo-mcp-server', version: '0.0.1' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_todo',
      description: 'Create a new todo item',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The todo title (required, 1-200 characters)' },
          description: { type: 'string', description: 'Detailed description of the todo' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Priority level (default: medium)',
          },
          dueDate: {
            type: 'string',
            format: 'date',
            description: 'Due date in ISO format (YYYY-MM-DD)',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for categorization (max 10)',
          },
        },
        required: ['title'],
      },
    },
    {
      name: 'list_todos',
      description: 'List and filter todos',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'in_progress', 'completed', 'active', 'all'],
            description: 'Filter by status (default: all)',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Filter by priority',
          },
          search: { type: 'string', description: 'Search in title and description' },
          limit: { type: 'number', description: 'Maximum number of results (default: 20)' },
        },
      },
    },
    {
      name: 'update_todo',
      description: 'Update an existing todo',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Todo ID to update' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          dueDate: { type: ['string', 'null'], format: 'date' },
          tags: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
        },
        required: ['id'],
      },
    },
    {
      name: 'delete_todo',
      description: 'Delete a todo by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Todo ID to delete' },
        },
        required: ['id'],
      },
    },
    {
      name: 'complete_todo',
      description: 'Mark a todo as completed',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Todo ID to mark as completed' },
        },
        required: ['id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const token = config.serviceToken;

  switch (name) {
    case 'create_todo':
      return createTodoHandler(args as unknown as Parameters<typeof createTodoHandler>[0], token);
    case 'list_todos':
      return listTodosHandler(args as unknown as Parameters<typeof listTodosHandler>[0], token);
    case 'update_todo':
      return updateTodoHandler(args as unknown as Parameters<typeof updateTodoHandler>[0], token);
    case 'delete_todo':
      return deleteTodoHandler(args as unknown as Parameters<typeof deleteTodoHandler>[0], token);
    case 'complete_todo':
      return completeTodoHandler(args as unknown as Parameters<typeof completeTodoHandler>[0], token);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Todo MCP Server running on stdio');
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
