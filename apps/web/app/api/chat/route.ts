import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

const tools: Anthropic.Tool[] = [
  {
    name: 'create_todo',
    description: 'Create a new todo item',
    input_schema: {
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
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'all'],
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
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Todo ID to update' },
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        dueDate: { type: 'string', description: 'Due date in ISO format (YYYY-MM-DD) or null to clear' },
        tags: { type: 'array', items: { type: 'string' } },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed'] },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_todo',
    description: 'Delete a todo by ID',
    input_schema: {
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
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Todo ID to mark as completed' },
      },
      required: ['id'],
    },
  },
];

async function callTodoApi(
  toolName: string,
  toolInput: Record<string, unknown>,
  accessToken: string
): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  switch (toolName) {
    case 'create_todo': {
      const res = await fetch(`${API_URL}/api/v1/todos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(toolInput),
      });
      const body = await res.json() as unknown;
      if (!res.ok) {
        const err = body as { detail?: string };
        return { success: false, message: err.detail ?? `HTTP ${res.status}` };
      }
      const data = (body as { data: { title: string } }).data;
      return { success: true, todo: data, message: `Todo '${data.title}' created successfully` };
    }

    case 'list_todos': {
      const params = new URLSearchParams();
      if (toolInput['status'] && toolInput['status'] !== 'all') params.set('status', String(toolInput['status']));
      if (toolInput['priority']) params.set('priority', String(toolInput['priority']));
      if (toolInput['search']) params.set('search', String(toolInput['search']));
      if (toolInput['limit']) params.set('limit', String(toolInput['limit']));
      const query = params.toString();
      const res = await fetch(`${API_URL}/api/v1/todos${query ? `?${query}` : ''}`, { headers });
      const body = await res.json() as unknown;
      if (!res.ok) {
        const err = body as { detail?: string };
        return { success: false, message: err.detail ?? `HTTP ${res.status}` };
      }
      const d = body as { data: unknown[]; meta: { total: number } };
      return { success: true, todos: d.data, total: d.meta.total, message: `Found ${d.data.length} of ${d.meta.total} todos` };
    }

    case 'update_todo': {
      const { id, ...updateData } = toolInput as { id: string } & Record<string, unknown>;
      const res = await fetch(`${API_URL}/api/v1/todos/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData),
      });
      const body = await res.json() as unknown;
      if (!res.ok) {
        const err = body as { detail?: string };
        return { success: false, message: err.detail ?? `HTTP ${res.status}` };
      }
      const data = (body as { data: { title: string } }).data;
      return { success: true, todo: data, message: `Todo '${data.title}' updated successfully` };
    }

    case 'delete_todo': {
      const res = await fetch(`${API_URL}/api/v1/todos/${String(toolInput['id'])}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        const body = await res.json() as { detail?: string };
        return { success: false, message: body.detail ?? `HTTP ${res.status}` };
      }
      return { success: true, message: `Todo ${String(toolInput['id'])} deleted successfully` };
    }

    case 'complete_todo': {
      const res = await fetch(`${API_URL}/api/v1/todos/${String(toolInput['id'])}/complete`, {
        method: 'POST',
        headers,
      });
      const body = await res.json() as unknown;
      if (!res.ok) {
        const err = body as { detail?: string };
        return { success: false, message: err.detail ?? `HTTP ${res.status}` };
      }
      const data = (body as { data: { title: string } }).data;
      return { success: true, todo: data, message: `Todo '${data.title}' marked as completed` };
    }

    default:
      return { success: false, message: `Unknown tool: ${toolName}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, accessToken } = await request.json() as {
      messages: Anthropic.MessageParam[];
      accessToken: string;
    };

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const systemPrompt = `You are a helpful todo assistant. Today's date is ${new Date().toISOString().split('T')[0]}.
You help users manage their todo list through natural conversation.
When performing operations, always confirm what you did and summarize the result clearly.
Be concise but friendly.`;

    const currentMessages: Anthropic.MessageParam[] = [...messages];

    let response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages: currentMessages,
    });

    // Tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      // Execute all tool calls
      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          const result = await callTodoApi(
            toolUse.name,
            toolUse.input as Record<string, unknown>,
            accessToken
          );
          return {
            type: 'tool_result' as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          };
        })
      );

      // Append assistant turn and tool results
      currentMessages.push({ role: 'assistant', content: response.content });
      currentMessages.push({ role: 'user', content: toolResults });

      // Call Claude again
      response = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages: currentMessages,
      });
    }

    return NextResponse.json({ content: response.content });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
