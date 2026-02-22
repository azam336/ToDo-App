'use client';

import { useState } from 'react';
import { useTodos, useCreateTodo, useCompleteTodo, useUncompleteTodo, useDeleteTodo } from '@/hooks/use-todos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useTodos({ status: filter });
  const createTodo = useCreateTodo();
  const completeTodo = useCompleteTodo();
  const uncompleteTodo = useUncompleteTodo();
  const deleteTodo = useDeleteTodo();

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await createTodo.mutateAsync({ title: newTodoTitle });
      setNewTodoTitle('');
    } catch (err) {
      console.error('Failed to create todo:', err);
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'completed') {
        await uncompleteTodo.mutateAsync(id);
      } else {
        await completeTodo.mutateAsync(id);
      }
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
      await deleteTodo.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTodo} className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={createTodo.isPending}>
              {createTodo.isPending ? 'Adding...' : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={filter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter(undefined)}
        >
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {isLoading && <div className="text-muted-foreground">Loading todos...</div>}

      {error && (
        <div className="p-4 text-destructive bg-destructive/10 rounded-md">
          Failed to load todos
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {data.data.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No todos yet. Add one above!
              </CardContent>
            </Card>
          ) : (
            data.data.map((todo) => (
              <Card key={todo.id}>
                <CardContent className="py-4 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={todo.status === 'completed'}
                    onChange={() => handleToggleComplete(todo.id, todo.status)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <p
                      className={
                        todo.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : ''
                      }
                    >
                      {todo.title}
                    </p>
                    {todo.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      todo.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : todo.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : todo.priority === 'medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {todo.priority}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(todo.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {data && (
        <p className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.meta.total} todos
        </p>
      )}
    </div>
  );
}
