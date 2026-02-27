import { apiFetch, ApiError } from '../api-client.js';

interface ListTodosInput {
  status?: string;
  priority?: string;
  search?: string;
  limit?: number;
}

interface Todo {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  tags: string[];
}

export async function listTodosHandler(
  input: ListTodosInput,
  token: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    const params = new URLSearchParams();
    if (input.status && input.status !== 'all') params.set('status', input.status);
    if (input.priority) params.set('priority', input.priority);
    if (input.search) params.set('search', input.search);
    if (input.limit) params.set('limit', String(input.limit));

    const query = params.toString();
    const result = await apiFetch<{ data: Todo[]; meta: { total: number } }>(
      `/api/v1/todos${query ? `?${query}` : ''}`,
      { token }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            todos: result.data,
            total: result.meta.total,
            message: `Found ${result.data.length} of ${result.meta.total} todos`,
          }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof ApiError ? err.detail : 'Failed to list todos';
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
