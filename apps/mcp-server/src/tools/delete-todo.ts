import { apiFetch, ApiError } from '../api-client.js';

interface DeleteTodoInput {
  id: string;
}

export async function deleteTodoHandler(
  input: DeleteTodoInput,
  token: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    await apiFetch<void>(`/api/v1/todos/${input.id}`, {
      method: 'DELETE',
      token,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Todo ${input.id} deleted successfully`,
          }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof ApiError ? err.detail : 'Failed to delete todo';
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
