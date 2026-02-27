import { apiFetch, ApiError } from '../api-client.js';

interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string | null;
  tags?: string[];
  status?: string;
}

interface Todo {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  tags: string[];
  updatedAt: string;
}

export async function updateTodoHandler(
  input: UpdateTodoInput,
  token: string
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    const { id, ...updateData } = input;
    const result = await apiFetch<{ data: Todo }>(`/api/v1/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
      token,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            todo: result.data,
            message: `Todo '${result.data.title}' updated successfully`,
          }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof ApiError ? err.detail : 'Failed to update todo';
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
