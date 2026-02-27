'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTodos } from '@/hooks/use-todos';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface TextBlock {
  type: 'text';
  text: string;
}

interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

type ContentBlock = TextBlock | ToolUseBlock;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
  toolResults?: Array<{ toolName: string; result: unknown }>;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    const text = typeof message.content === 'string'
      ? message.content
      : message.content.filter((b): b is TextBlock => b.type === 'text').map((b) => b.text).join('');

    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 text-sm">
          {text}
        </div>
      </div>
    );
  }

  // Assistant message
  const blocks: ContentBlock[] = typeof message.content === 'string'
    ? [{ type: 'text', text: message.content }]
    : message.content;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2">
        {blocks.map((block, i) => {
          if (block.type === 'text' && block.text) {
            return (
              <div
                key={i}
                className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 text-sm whitespace-pre-wrap"
              >
                {block.text}
              </div>
            );
          }
          if (block.type === 'tool_use') {
            const toolResult = message.toolResults?.find((_, idx) => idx === 0);
            return (
              <ToolResultCard
                key={i}
                toolName={block.name}
                toolInput={block.input}
                result={toolResult?.result}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function ToolResultCard({
  toolName,
  toolInput,
  result,
}: {
  toolName: string;
  toolInput: Record<string, unknown>;
  result?: unknown;
}) {
  const parsed = result
    ? (() => {
        try {
          return typeof result === 'string' ? (JSON.parse(result) as Record<string, unknown>) : (result as Record<string, unknown>);
        } catch {
          return null;
        }
      })()
    : null;

  const success = parsed?.['success'] as boolean | undefined;
  const message = parsed?.['message'] as string | undefined;

  const toolLabels: Record<string, string> = {
    create_todo: 'Created todo',
    list_todos: 'Listed todos',
    update_todo: 'Updated todo',
    delete_todo: 'Deleted todo',
    complete_todo: 'Completed todo',
  };

  return (
    <div
      className={`rounded-xl px-4 py-2 text-xs border ${
        success === false
          ? 'bg-destructive/10 border-destructive/30 text-destructive'
          : 'bg-green-50 border-green-200 text-green-800'
      }`}
    >
      <div className="font-semibold mb-0.5">
        {toolLabels[toolName] ?? toolName}
        {toolInput['title'] ? `: ${String(toolInput['title'])}` : ''}
      </div>
      {message && <div className="opacity-80">{message}</div>}
    </div>
  );
}

function TodoSidePanel() {
  const { data, isLoading } = useTodos();

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-base font-semibold mb-3 text-foreground">Your Todos</h2>
      {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
      {data && (
        <>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {data.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No todos yet.</p>
            ) : (
              data.data.map((todo) => (
                <Card key={todo.id} className="shadow-none">
                  <CardContent className="py-2 px-3 flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        todo.status === 'completed'
                          ? 'bg-green-500'
                          : todo.priority === 'urgent'
                            ? 'bg-red-500'
                            : todo.priority === 'high'
                              ? 'bg-orange-500'
                              : 'bg-blue-400'
                      }`}
                    />
                    <span
                      className={`text-sm flex-1 min-w-0 truncate ${
                        todo.status === 'completed' ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {todo.priority}
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.data.length} of {data.meta.total} todos
          </p>
        </>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get the access token from the api client (set by auth context on login/refresh)
  const getAccessToken = () => api.getAccessToken() ?? '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build the messages array for the API (only text content for user messages)
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages.map((m) => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : m.content,
          })),
          accessToken: getAccessToken(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json() as { error?: string };
        throw new Error(errData.error ?? 'Failed to get response');
      }

      const data = await response.json() as { content: ContentBlock[] };
      const content = data.content;

      // Extract tool results for display
      const toolUseBlocks = content.filter((b): b is ToolUseBlock => b.type === 'tool_use');
      const toolResults = toolUseBlocks.map((b) => ({
        toolName: b.name,
        result: null as unknown,
      }));

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content,
        toolResults,
      };

      setMessages([...updatedMessages, assistantMessage]);

      // Invalidate todos cache if any tool was used
      if (toolUseBlocks.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ['todos'] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium mb-1">AI Todo Assistant</p>
                <p className="text-sm">Try: &quot;Add a todo to buy groceries&quot;</p>
                <p className="text-sm">Or: &quot;Show my urgent tasks&quot;</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-muted-foreground">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-2 text-sm">
              Error: {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => void sendMessage()} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>

      {/* Todo List Panel */}
      <div className="w-72 flex-shrink-0 border-l border-border pl-4">
        <TodoSidePanel />
      </div>
    </div>
  );
}
