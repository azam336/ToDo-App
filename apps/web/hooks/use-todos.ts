'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface TodoFilters {
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
  limit?: number;
}

export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => api.getTodos(filters as Record<string, string | number | undefined>),
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => api.getTodo(id),
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.createTodo>[0]) => api.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateTodo>[1] }) =>
      api.updateTodo(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', variables.id] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useCompleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.completeTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', id] });
    },
  });
}

export function useUncompleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.uncompleteTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', id] });
    },
  });
}
