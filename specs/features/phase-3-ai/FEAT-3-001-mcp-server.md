# FEAT-3-001: MCP Server for Todo Operations

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-3-001 |
| **Phase** | III - AI Chatbot |
| **Status** | Draft |
| **Priority** | P0 - Critical |
| **Constitution Refs** | AP-01, AP-02, CN-01, Article IX (AI Integration) |
| **Architecture Ref** | ARCH-003 |
| **Dependencies** | Phase II API must be running |

---

## Overview

### Description
Implement a Model Context Protocol (MCP) server that exposes todo operations as tools for AI assistants. The MCP server acts as a bridge between natural language interfaces and the Todo REST API, enabling Claude and other AI models to manage todos on behalf of users.

### User Stories

```gherkin
AS AN AI assistant
I WANT TO call MCP tools for todo operations
SO THAT I can manage todos based on natural language instructions

AS A user
I WANT TO manage my todos through a chat interface
SO THAT I can use natural language instead of forms and buttons

AS A developer
I WANT well-defined MCP tool schemas
SO THAT I can integrate any MCP-compatible AI client
```

### Acceptance Criteria

- [ ] AC-01: MCP server exposes `create_todo` tool with title, description, priority, dueDate, tags
- [ ] AC-02: MCP server exposes `list_todos` tool with filter parameters (status, priority, search, limit)
- [ ] AC-03: MCP server exposes `update_todo` tool with id and partial update fields
- [ ] AC-04: MCP server exposes `delete_todo` tool with id parameter
- [ ] AC-05: MCP server exposes `complete_todo` tool with id parameter
- [ ] AC-06: All tools return structured JSON responses
- [ ] AC-07: Error responses include human-readable messages
- [ ] AC-08: MCP server authenticates with the REST API using service credentials

---

## MCP Tool Definitions

### Tool: `create_todo`

**Description:** Create a new todo item

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "The todo title (required, 1-200 characters)"
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the todo"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high", "urgent"],
      "description": "Priority level (default: medium)"
    },
    "dueDate": {
      "type": "string",
      "format": "date",
      "description": "Due date in ISO format (YYYY-MM-DD)"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Tags for categorization (max 10)"
    }
  },
  "required": ["title"]
}
```

**Response Format:**
```json
{
  "success": true,
  "todo": {
    "id": "uuid",
    "title": "string",
    "status": "pending",
    "priority": "string",
    "dueDate": "string | null",
    "tags": ["string"],
    "createdAt": "ISO datetime"
  },
  "message": "Todo 'Buy groceries' created successfully"
}
```

### Tool: `list_todos`

**Description:** List and filter todos

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["pending", "in_progress", "completed", "active", "all"],
      "description": "Filter by status (default: all)"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high", "urgent"],
      "description": "Filter by priority"
    },
    "search": {
      "type": "string",
      "description": "Search in title and description"
    },
    "limit": {
      "type": "number",
      "description": "Maximum number of results (default: 20)"
    }
  }
}
```

**Response Format:**
```json
{
  "success": true,
  "todos": [{ "id": "...", "title": "...", "status": "...", "priority": "..." }],
  "total": 42,
  "message": "Found 20 of 42 todos"
}
```

### Tool: `update_todo`

**Description:** Update an existing todo

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "Todo ID to update" },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "priority": { "type": "string", "enum": ["low", "medium", "high", "urgent"] },
    "dueDate": { "type": ["string", "null"], "format": "date" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "status": { "type": "string", "enum": ["pending", "in_progress", "completed"] }
  },
  "required": ["id"]
}
```

### Tool: `delete_todo`

**Description:** Delete a todo by ID

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "Todo ID to delete" }
  },
  "required": ["id"]
}
```

### Tool: `complete_todo`

**Description:** Mark a todo as completed

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "Todo ID to mark as completed" }
  },
  "required": ["id"]
}
```

---

## Technical Design

### Technology Stack
- **Runtime:** Node.js with TypeScript
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **Transport:** stdio (for local) or SSE (for remote)
- **HTTP Client:** Native fetch for REST API calls

### Authentication Flow
1. MCP server starts with API credentials (service account or user token)
2. Each tool call authenticates against the Phase II REST API
3. Token refresh handled automatically

### Error Handling
- API errors mapped to human-readable MCP tool responses
- Validation errors include field-specific messages
- Network errors return retry-friendly messages

---

## Non-Functional Requirements

| Attribute | Requirement |
|-----------|-------------|
| Latency | Tool calls complete within 2s |
| Reliability | Graceful degradation on API unavailability |
| Security | No credential leakage in tool responses |
| Logging | All tool calls logged with correlation IDs |
