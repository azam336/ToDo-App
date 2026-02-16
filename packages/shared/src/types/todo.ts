// Todo API types

export type TodoStatus = 'pending' | 'in_progress' | 'completed';
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TodoResponse {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string | null;
  tags?: string[];
}

export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string;
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  sort?: string;
  limit?: number;
  cursor?: string;
}
