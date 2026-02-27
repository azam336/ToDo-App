import { apiFetch, ApiError } from '../api-client.js';

interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags?: string[];
}

interface Todo {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
}

export async function createTodoHandler(
  input: CreateTodoInput,
  token: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    const result = await apiFetch<{ data: Todo }>('/api/v1/todos', {
      method: 'POST',
      body: JSON.stringify(input),
      token,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            todo: result.data,
            message: `Todo '${result.data.title}' created successfully`,
          }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof ApiError ? err.detail : 'Failed to create todo';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, message }),
        },
      ],
    };
  }
}
