# ARCH-003: Phase III - AI Chatbot Architecture

## Metadata
| Field | Value |
|-------|-------|
| **Architecture ID** | ARCH-003 |
| **Phase** | III - AI Chatbot |
| **Status** | Draft |
| **Constitution Refs** | AP-01, AP-02, AP-03, CN-01 |
| **Feature Refs** | FEAT-3-001, FEAT-3-002 |

---

## Overview

Phase III adds an AI-powered natural language interface to the Todo system. Users can manage todos through conversation with Claude, which uses MCP tools to execute operations against the existing Phase II REST API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Web App (Next.js)                 │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Chat Page   │  │  Dashboard   │  (existing)    │
│  │  /chat       │  │  /dashboard  │                │
│  └──────┬───────┘  └──────┬───────┘                │
│         │                  │                        │
│  ┌──────▼───────┐         │                        │
│  │ /api/chat    │         │                        │
│  │ (API Route)  │         │                        │
│  └──────┬───────┘         │                        │
└─────────┼─────────────────┼────────────────────────┘
          │                  │
          ▼                  │
┌─────────────────┐         │
│  Claude API     │         │
│  (Messages)     │         │
│  + MCP Tools    │         │
└────────┬────────┘         │
         │ tool_use          │
         ▼                   ▼
┌─────────────────────────────────────────┐
│          REST API (Fastify)             │
│          localhost:3001                 │
│  /api/v1/todos/*  │  /api/v1/auth/*    │
└─────────┬───────────────────────────────┘
          │
          ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

## Components

### 1. MCP Server (`apps/mcp-server/`)

**Purpose:** Standalone MCP server that exposes todo operations as tools.

**Technology:**
- `@modelcontextprotocol/sdk` for MCP protocol handling
- TypeScript with Node.js runtime
- stdio transport for local development
- SSE transport for remote/web deployment

**Structure:**
```
apps/mcp-server/
├── src/
│   ├── index.ts              # Entry point, MCP server setup
│   ├── tools/
│   │   ├── create-todo.ts    # create_todo tool handler
│   │   ├── list-todos.ts     # list_todos tool handler
│   │   ├── update-todo.ts    # update_todo tool handler
│   │   ├── delete-todo.ts    # delete_todo tool handler
│   │   └── complete-todo.ts  # complete_todo tool handler
│   ├── api-client.ts         # REST API client wrapper
│   └── config.ts             # Configuration (API URL, credentials)
├── package.json
└── tsconfig.json
```

**Key Design Decisions:**
- Each tool maps 1:1 to a REST API endpoint
- Tool responses are formatted for human readability
- API client handles authentication and token refresh
- Errors are caught and returned as tool error responses

### 2. Chat API Route (`apps/web/app/api/chat/route.ts`)

**Purpose:** Server-side proxy between the chat UI and Claude API.

**Responsibilities:**
- Receives user messages from the chat UI
- Constructs Claude API request with MCP tool definitions
- Handles the tool_use → tool_result loop
- Returns streamed or complete responses to the client

**Flow:**
```
1. Receive POST { messages: [...] }
2. Add system prompt with user context
3. Call Claude Messages API with tools
4. If response contains tool_use:
   a. Execute tool against REST API (using user's auth token)
   b. Add tool_result to messages
   c. Call Claude again for final response
5. Return AI response to client
```

### 3. Chat UI (`apps/web/app/(dashboard)/chat/page.tsx`)

**Purpose:** Chat interface within the existing dashboard layout.

**State Management:**
- Chat messages: React `useState` (session-scoped)
- Todo list: React Query with automatic invalidation after tool calls
- Streaming: ReadableStream for progressive AI responses

---

## Authentication Flow

```
User (authenticated via Phase II)
  → Chat UI sends message + auth token
  → API Route uses user's token for REST API calls
  → Claude API called with ANTHROPIC_API_KEY (server-side)
  → Tool calls use user's auth token against REST API
  → User only sees their own todos
```

**Security Constraints:**
- `ANTHROPIC_API_KEY` stored as server-side env var only
- User's JWT passed through to REST API for todo operations
- No API keys or tokens exposed in client-side code

---

## Data Flow

### Create Todo via Chat
```
User: "Add a todo to buy groceries by Friday"
  → POST /api/chat { messages: [...] }
  → Claude API → tool_use: create_todo({ title: "Buy groceries", dueDate: "2026-02-27" })
  → API Route → POST /api/v1/todos (with user's JWT)
  → tool_result: { success: true, todo: { id: "...", title: "Buy groceries" } }
  → Claude API → "I've created a todo 'Buy groceries' due Friday."
  → Chat UI displays response
  → React Query invalidates ['todos'] → list refreshes
```

---

## Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| AI Model | Claude (Anthropic API) | Best-in-class reasoning, native MCP support |
| MCP SDK | @modelcontextprotocol/sdk | Official SDK, well-maintained |
| Chat streaming | ReadableStream / SSE | Progressive response display |
| State | React Query + useState | Consistent with existing Phase II patterns |

---

## Deployment Considerations

- MCP server can run as a standalone process or embedded in the API route
- Claude API key required as environment variable
- Rate limiting on chat endpoint to control API costs
- Consider response caching for repeated queries

---

## Phase Compatibility

| Phase | Impact |
|-------|--------|
| Phase I (CLI) | No impact - CLI continues to work independently |
| Phase II (Web) | Extended with chat page, no breaking changes |
| Phase IV (K8s) | MCP server deployed as separate service |
| Phase V (Cloud) | Chat events published to Kafka for analytics |
