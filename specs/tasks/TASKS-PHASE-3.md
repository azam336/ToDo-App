# Phase III Task Breakdown: AI Chatbot

## Metadata
| Field | Value |
|-------|-------|
| **Phase** | III - AI Chatbot |
| **Feature Refs** | FEAT-3-001, FEAT-3-002 |
| **Architecture Ref** | ARCH-003 |
| **Dependencies** | Phase II complete (API + Web + Auth) |

---

## Task Groups

### TG-3-001: MCP Server Setup

| Task ID | Title | Priority | Estimate | Dependencies |
|---------|-------|----------|----------|--------------|
| TASK-3-001-01 | Scaffold MCP server package in `apps/mcp-server/` | P0 | S | - |
| TASK-3-001-02 | Configure `@modelcontextprotocol/sdk` with stdio transport | P0 | S | TASK-3-001-01 |
| TASK-3-001-03 | Implement REST API client wrapper for todo operations | P0 | M | TASK-3-001-01 |
| TASK-3-001-04 | Implement `create_todo` tool handler | P0 | M | TASK-3-001-02, TASK-3-001-03 |
| TASK-3-001-05 | Implement `list_todos` tool handler | P0 | M | TASK-3-001-02, TASK-3-001-03 |
| TASK-3-001-06 | Implement `update_todo` tool handler | P0 | M | TASK-3-001-02, TASK-3-001-03 |
| TASK-3-001-07 | Implement `delete_todo` tool handler | P0 | S | TASK-3-001-02, TASK-3-001-03 |
| TASK-3-001-08 | Implement `complete_todo` tool handler | P0 | S | TASK-3-001-02, TASK-3-001-03 |
| TASK-3-001-09 | Add authentication handling (service token or user token forwarding) | P0 | M | TASK-3-001-03 |
| TASK-3-001-10 | Write unit tests for all tool handlers | P0 | L | TASK-3-001-04 through 08 |
| TASK-3-001-11 | Write integration tests (MCP server + REST API) | P1 | L | TASK-3-001-10 |

### TG-3-002: Chat API Route

| Task ID | Title | Priority | Estimate | Dependencies |
|---------|-------|----------|----------|--------------|
| TASK-3-002-01 | Create Next.js API route `/api/chat` | P0 | M | TG-3-001 |
| TASK-3-002-02 | Implement Claude Messages API integration | P0 | M | TASK-3-002-01 |
| TASK-3-002-03 | Implement tool_use → tool_result loop | P0 | L | TASK-3-002-02 |
| TASK-3-002-04 | Add streaming support (SSE response) | P1 | M | TASK-3-002-03 |
| TASK-3-002-05 | Add system prompt with user context and current date | P1 | S | TASK-3-002-02 |
| TASK-3-002-06 | Add rate limiting for chat endpoint | P1 | S | TASK-3-002-01 |
| TASK-3-002-07 | Add authentication middleware (require valid session) | P0 | S | TASK-3-002-01 |

### TG-3-003: Chat UI

| Task ID | Title | Priority | Estimate | Dependencies |
|---------|-------|----------|----------|--------------|
| TASK-3-003-01 | Create chat page layout at `/chat` with split panel | P0 | M | - |
| TASK-3-003-02 | Implement chat message list component | P0 | M | TASK-3-003-01 |
| TASK-3-003-03 | Implement chat input with send button | P0 | S | TASK-3-003-01 |
| TASK-3-003-04 | Implement message types (user, AI, tool result, error) | P0 | M | TASK-3-003-02 |
| TASK-3-003-05 | Connect chat UI to `/api/chat` endpoint | P0 | M | TASK-3-003-03, TG-3-002 |
| TASK-3-003-06 | Add streaming response rendering | P1 | M | TASK-3-003-05 |
| TASK-3-003-07 | Implement todo list auto-refresh after tool calls | P0 | S | TASK-3-003-05 |
| TASK-3-003-08 | Add loading states and typing indicators | P1 | S | TASK-3-003-05 |
| TASK-3-003-09 | Add responsive layout (mobile: stacked panels) | P2 | M | TASK-3-003-01 |
| TASK-3-003-10 | Add navigation link in dashboard header | P0 | S | TASK-3-003-01 |

### TG-3-004: Testing & Polish

| Task ID | Title | Priority | Estimate | Dependencies |
|---------|-------|----------|----------|--------------|
| TASK-3-004-01 | Write E2E tests for chat flow (mock Claude API) | P1 | L | TG-3-003 |
| TASK-3-004-02 | Add error boundary for chat component | P1 | S | TG-3-003 |
| TASK-3-004-03 | Add ANTHROPIC_API_KEY to `.env.example` | P0 | S | - |
| TASK-3-004-04 | Update CLAUDE.md with Phase III commands | P1 | S | - |
| TASK-3-004-05 | Write Phase III section of project documentation | P2 | M | TG-3-004 |

---

## Size Legend

| Size | Estimate |
|------|----------|
| S | < 1 hour |
| M | 1-3 hours |
| L | 3-8 hours |

---

## Dependency Graph

```
TG-3-001 (MCP Server)
    │
    ├──► TG-3-002 (Chat API Route)
    │        │
    │        ├──► TG-3-003 (Chat UI)
    │        │        │
    │        │        └──► TG-3-004 (Testing & Polish)
    │        │
    │        └──► TG-3-004
    │
    └──► TG-3-004
```

---

## Definition of Done

- [ ] MCP server starts and responds to tool calls
- [ ] Chat page accessible at `/chat` for authenticated users
- [ ] User can create, list, update, delete, and complete todos via chat
- [ ] Todo list panel refreshes after AI operations
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] ANTHROPIC_API_KEY documented in `.env.example`
