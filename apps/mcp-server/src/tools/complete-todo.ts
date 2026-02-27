import { apiFetch, ApiError } from '../api-client.js';

interface CompleteTodoInput {
  id: string;
}

interface Todo {
  id: string;
  title: string;
  status: string;
  completedAt: string | null;
}

export async function completeTodoHandler(
  input: CompleteTodoInput,
  token: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    const result = await apiFetch<{ data: Todo }>(`/api/v1/todos/${input.id}/complete`, {
      method: 'POST',
      token,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            todo: result.data,
            message: `Todo '${result.data.title}' marked as completed`,
          }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof ApiError ? err.detail : 'Failed to complete todo';
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
