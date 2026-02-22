# FEAT-3-002: AI Chat Interface

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-3-002 |
| **Phase** | III - AI Chatbot |
| **Status** | Draft |
| **Priority** | P1 - High |
| **Constitution Refs** | AP-01, AP-03, CN-01, Article IX (AI Integration) |
| **Architecture Ref** | ARCH-003 |
| **Dependencies** | FEAT-3-001 (MCP Server) |

---

## Overview

### Description
Implement a chat-based user interface that allows users to manage their todos through natural language conversation. The chat interface connects to the Claude API with MCP tools, enabling the AI to execute todo operations based on user messages.

### User Stories

```gherkin
AS A user
I WANT TO type "add a todo to buy groceries tomorrow" in a chat
SO THAT a todo is created without filling out a form

AS A user
I WANT TO ask "what are my urgent tasks?" in the chat
SO THAT I get a filtered list through natural conversation

AS A user
I WANT TO say "mark the groceries todo as done"
SO THAT I can complete tasks conversationally

AS A user
I WANT TO see both the chat and my todo list
SO THAT I can verify actions taken by the AI
```

### Acceptance Criteria

- [ ] AC-01: Chat UI renders as a page within the existing web app
- [ ] AC-02: User messages are sent to Claude API with MCP tools attached
- [ ] AC-03: AI responses display inline with tool call results
- [ ] AC-04: Todo list auto-refreshes when AI performs operations
- [ ] AC-05: Chat history persists within the session
- [ ] AC-06: Loading states shown during AI processing
- [ ] AC-07: Error messages are user-friendly
- [ ] AC-08: Chat is only accessible to authenticated users

---

## UI Design

### Layout
```
┌──────────────────────────────────────────────┐
│  Header: Todo App          [User] [Logout]   │
├────────────────────┬─────────────────────────┤
│                    │                         │
│   Chat Panel       │   Todo List Panel       │
│                    │   (live-updating)       │
│   [AI messages]    │                         │
│   [User messages]  │   [ ] Buy groceries     │
│   [Tool results]   │   [x] Write report      │
│                    │   [ ] Deploy app         │
│                    │                         │
│   ┌──────────────┐ │                         │
│   │ Type message │ │                         │
│   └──────────────┘ │                         │
└────────────────────┴─────────────────────────┘
```

### Message Types
1. **User message** - Plain text from the user
2. **AI message** - Claude's text response
3. **Tool result** - Formatted card showing the operation performed (e.g., "Created todo: Buy groceries")
4. **Error message** - Red-styled error notification

### Natural Language Examples
| User Input | Expected Action |
|------------|----------------|
| "Add a todo to buy groceries" | `create_todo({ title: "Buy groceries" })` |
| "Show my urgent tasks" | `list_todos({ priority: "urgent" })` |
| "Mark the groceries todo as done" | `complete_todo({ id: "..." })` |
| "What's due this week?" | `list_todos({ dueRelative: "week" })` |
| "Delete the old report todo" | `delete_todo({ id: "..." })` |
| "Change priority of deploy to urgent" | `update_todo({ id: "...", priority: "urgent" })` |

---

## Technical Design

### Architecture
- **Frontend:** New Next.js page at `/chat` within existing web app
- **API Route:** Next.js API route `/api/chat` proxies to Claude API
- **Claude API:** Messages API with MCP tool definitions
- **State:** React Query for todo list, local state for chat history

### Chat Flow
```
User types message
  → POST /api/chat { messages, tools }
  → Claude API processes with MCP tools
  → If tool_use: execute tool via REST API
  → Return AI response + tool results
  → Update chat UI
  → Invalidate todo queries (auto-refresh list)
```

### Context Management
- System prompt includes user's name and current date
- Recent todo summary included for context-aware responses
- Chat history maintained in component state (session-scoped)

---

## Non-Functional Requirements

| Attribute | Requirement |
|-----------|-------------|
| Response Time | First token within 2s, full response within 10s |
| Accessibility | Chat input supports keyboard navigation |
| Mobile | Responsive layout, panels stack vertically on mobile |
| Security | API key stored server-side only, never exposed to client |
