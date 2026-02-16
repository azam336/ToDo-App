const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    public detail: string,
    public errors?: { field: string; message: string }[]
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        response.status,
        error.type ?? 'unknown',
        error.detail ?? 'An error occurred',
        error.errors
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth methods
  async register(data: { email: string; password: string; name: string }) {
    return this.fetch<{
      data: {
        user: { id: string; email: string; name: string; createdAt: string };
        tokens: { accessToken: string; expiresIn: number };
      };
    }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.fetch<{
      data: {
        user: { id: string; email: string; name: string };
        tokens: { accessToken: string; expiresIn: number };
      };
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refresh() {
    return this.fetch<{
      data: {
        tokens: { accessToken: string; expiresIn: number };
      };
    }>('/api/v1/auth/refresh', {
      method: 'POST',
    });
  }

  async logout() {
    return this.fetch<void>('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.fetch<{
      data: { id: string; email: string; name: string; createdAt: string };
    }>('/api/v1/auth/me');
  }

  // Todo methods
  async getTodos(params?: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.fetch<{
      data: Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        dueDate: string | null;
        tags: string[];
        createdAt: string;
        updatedAt: string;
        completedAt: string | null;
      }>;
      meta: { total: number; limit: number; hasMore: boolean };
    }>(`/api/v1/todos${query ? `?${query}` : ''}`);
  }

  async getTodo(id: string) {
    return this.fetch<{
      data: {
        id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        dueDate: string | null;
        tags: string[];
        createdAt: string;
        updatedAt: string;
        completedAt: string | null;
      };
    }>(`/api/v1/todos/${id}`);
  }

  async createTodo(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    tags?: string[];
  }) {
    return this.fetch<{
      data: {
        id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        dueDate: string | null;
        tags: string[];
        createdAt: string;
        updatedAt: string;
        completedAt: string | null;
      };
    }>('/api/v1/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTodo(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      tags?: string[];
    }
  ) {
    return this.fetch<{
      data: {
        id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        dueDate: string | null;
        tags: string[];
        createdAt: string;
        updatedAt: string;
        completedAt: string | null;
      };
    }>(`/api/v1/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTodo(id: string) {
    return this.fetch<void>(`/api/v1/todos/${id}`, {
      method: 'DELETE',
    });
  }

  async completeTodo(id: string) {
    return this.fetch<{
      data: {
        id: string;
        title: string;
        status: string;
        completedAt: string | null;
      };
    }>(`/api/v1/todos/${id}/complete`, {
      method: 'POST',
    });
  }

  async uncompleteTodo(id: string) {
    return this.fetch<{
      data: {
        id: string;
        title: string;
        status: string;
        completedAt: string | null;
      };
    }>(`/api/v1/todos/${id}/uncomplete`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
