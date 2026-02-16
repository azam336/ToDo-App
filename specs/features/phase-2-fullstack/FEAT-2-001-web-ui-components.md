# FEAT-2-001: Web UI Components

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-2-001 |
| **Phase** | II - Full Stack Web |
| **Status** | Draft |
| **Priority** | P0 - Critical |
| **Constitution Refs** | AP-01, Section 3.3 (Next.js, Tailwind) |
| **Architecture Ref** | ARCH-002 |

---

## Overview

### Description
Implement a responsive, accessible web interface for todo management using Next.js 14, React 18, and Tailwind CSS. The UI provides all Phase I CLI functionality through a modern web experience.

### User Stories

```gherkin
AS A user
I WANT TO manage my todos through a web interface
SO THAT I can access my tasks from any device with a browser

AS A user
I WANT TO see real-time updates when my todos change
SO THAT I always have the latest information

AS A user
I WANT TO filter and search my todos
SO THAT I can quickly find specific tasks
```

### Acceptance Criteria

- [ ] AC-01: Users can view a list of all their todos
- [ ] AC-02: Users can create new todos with title, description, priority, due date, and tags
- [ ] AC-03: Users can edit existing todos inline or in a modal
- [ ] AC-04: Users can delete todos with confirmation
- [ ] AC-05: Users can mark todos as complete/incomplete
- [ ] AC-06: Users can filter todos by status, priority, and tags
- [ ] AC-07: Users can search todos by title or description
- [ ] AC-08: Users can sort todos by various fields
- [ ] AC-09: UI is responsive (mobile, tablet, desktop)
- [ ] AC-10: UI meets WCAG 2.1 AA accessibility standards

---

## Functional Requirements

### FR-01: Todo Dashboard Page

**Route:** `/` (authenticated) or `/dashboard`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo, User Menu, Logout)                           │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│   Sidebar     │   Main Content Area                         │
│   - Filters   │   ┌─────────────────────────────────────┐   │
│   - Tags      │   │  Search Bar + Add Button            │   │
│               │   ├─────────────────────────────────────┤   │
│               │   │  Todo List                          │   │
│               │   │  - Todo Card 1                      │   │
│               │   │  - Todo Card 2                      │   │
│               │   │  - ...                              │   │
│               │   └─────────────────────────────────────┘   │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

**Components:**
- Header with user avatar, name, and dropdown menu
- Collapsible sidebar with filter options
- Search bar with instant filtering
- "Add Todo" button (opens modal)
- Todo list with infinite scroll or pagination
- Empty state when no todos match filters

---

### FR-02: Todo Card Component

**Display Fields:**
| Field | Display |
|-------|---------|
| Title | Primary text, truncate at 60 chars |
| Description | Secondary text, 2 lines max |
| Priority | Colored badge (urgent=red, high=orange, medium=blue, low=gray) |
| Due Date | Relative date ("Tomorrow", "In 3 days", "Overdue") |
| Tags | Pill badges, max 3 visible + "+N" |
| Status | Checkbox for completion |

**Interactions:**
- Click checkbox → Toggle complete
- Click card → Open detail modal
- Click edit icon → Open edit modal
- Click delete icon → Show confirmation dialog
- Drag handle → Reorder (future)

**States:**
- Default
- Hover (shadow, highlight)
- Selected
- Completed (strikethrough, muted)
- Overdue (red border/highlight)

---

### FR-03: Create/Edit Todo Modal

**Fields:**
| Field | Input Type | Validation |
|-------|------------|------------|
| Title | Text input | Required, 1-200 chars |
| Description | Textarea | Optional, 0-2000 chars |
| Priority | Select dropdown | Required, default "medium" |
| Due Date | Date picker | Optional, not in past |
| Tags | Tag input (chips) | Optional, max 10 |

**Buttons:**
- Cancel → Close modal without saving
- Save → Validate and submit

**Behavior:**
- Pre-fill fields when editing
- Show validation errors inline
- Disable save button while submitting
- Close modal and refresh list on success
- Show toast notification on success/error

---

### FR-04: Delete Confirmation Dialog

**Content:**
```
┌─────────────────────────────────────┐
│  Delete Todo?                       │
│                                     │
│  Are you sure you want to delete    │
│  "Todo title here"?                 │
│                                     │
│  This action cannot be undone.      │
│                                     │
│        [Cancel]  [Delete]           │
└─────────────────────────────────────┘
```

---

### FR-05: Filter Panel

**Filter Options:**

| Filter | Type | Options |
|--------|------|---------|
| Status | Checkbox group | All, Pending, In Progress, Completed |
| Priority | Checkbox group | Urgent, High, Medium, Low |
| Due Date | Radio group | All, Today, This Week, Overdue, No Date |
| Tags | Multi-select | User's tags |

**Behavior:**
- Filters applied immediately (no apply button)
- URL updated with filter params (shareable)
- Clear all filters button
- Show count of active filters

---

### FR-06: Search Functionality

**Features:**
- Search input with magnifying glass icon
- Debounced search (300ms)
- Searches title and description
- Highlights matching text in results
- Clear search button (X icon)

---

### FR-07: Sort Options

**Sort Fields:**
| Field | Options |
|-------|---------|
| Created Date | Newest first, Oldest first |
| Due Date | Soonest first, Latest first |
| Priority | Highest first, Lowest first |
| Title | A-Z, Z-A |

**UI:** Dropdown in toolbar

---

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Initial page load (LCP) | < 2.5s |
| NFR-02 | Time to Interactive | < 3.5s |
| NFR-03 | Cumulative Layout Shift | < 0.1 |
| NFR-04 | Lighthouse Performance Score | > 90 |
| NFR-05 | Lighthouse Accessibility Score | > 90 |
| NFR-06 | Mobile responsiveness | Works on 320px+ |

---

## Technical Design

### Component Hierarchy

```
app/
├── (dashboard)/
│   ├── layout.tsx          # Dashboard layout with sidebar
│   └── page.tsx            # Todo dashboard page
│
components/
├── ui/                     # Base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── checkbox.tsx
│   ├── modal.tsx
│   ├── dialog.tsx
│   ├── toast.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── avatar.tsx
│   ├── dropdown.tsx
│   └── date-picker.tsx
│
├── layout/
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── mobile-nav.tsx
│   └── footer.tsx
│
├── todo/
│   ├── todo-list.tsx       # List container with virtualization
│   ├── todo-card.tsx       # Individual todo card
│   ├── todo-form.tsx       # Create/edit form
│   ├── todo-modal.tsx      # Modal wrapper for form
│   ├── todo-filters.tsx    # Filter panel
│   ├── todo-search.tsx     # Search input
│   ├── todo-sort.tsx       # Sort dropdown
│   ├── priority-badge.tsx  # Priority indicator
│   ├── due-date-badge.tsx  # Due date display
│   ├── tag-list.tsx        # Tag pills
│   └── empty-state.tsx     # No todos message
│
└── common/
    ├── loading-spinner.tsx
    ├── error-boundary.tsx
    └── confirm-dialog.tsx
```

### State Management

```typescript
// hooks/use-todos.ts - React Query hooks

export function useTodos(filters: TodoFilters) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => api.getTodos(filters),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

### API Client

```typescript
// lib/api-client.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error);
    }

    return response.json();
  }

  // Todo methods
  getTodos(filters: TodoFilters) {
    const params = new URLSearchParams(filters as any);
    return this.fetch<TodoListResponse>(`/api/v1/todos?${params}`);
  }

  createTodo(data: CreateTodoInput) {
    return this.fetch<TodoResponse>('/api/v1/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTodo(id: string, data: UpdateTodoInput) {
    return this.fetch<TodoResponse>(`/api/v1/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteTodo(id: string) {
    return this.fetch<void>(`/api/v1/todos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
```

---

## Wireframes

### Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]              Todo App              [User Avatar ▼]              │
├────────────┬────────────────────────────────────────────────────────────┤
│            │                                                            │
│  FILTERS   │  [🔍 Search todos...]              [+ Add Todo]  [↕ Sort] │
│            │  ─────────────────────────────────────────────────────────│
│  Status    │                                                            │
│  ☑ All     │  ┌─────────────────────────────────────────────────────┐  │
│  ☐ Pending │  │ ☐  [!] Complete project report            Dec 31    │  │
│  ☐ Done    │  │      Quarterly review document                      │  │
│            │  │      [work] [urgent]                                 │  │
│  Priority  │  └─────────────────────────────────────────────────────┘  │
│  ☐ Urgent  │  ┌─────────────────────────────────────────────────────┐  │
│  ☐ High    │  │ ☑  Buy groceries                          Completed │  │
│  ☐ Medium  │  │      Milk, bread, eggs                              │  │
│  ☐ Low     │  │      [personal]                                     │  │
│            │  └─────────────────────────────────────────────────────┘  │
│  Due Date  │                                                            │
│  ○ All     │                                                            │
│  ○ Today   │                                                            │
│  ○ Week    │                                                            │
│  ○ Overdue │                                                            │
│            │                                                            │
│  [Clear]   │  Showing 2 of 15 todos                                     │
└────────────┴────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────────────┐
│  [≡]    Todo App        [👤]   │
├─────────────────────────────────┤
│  [🔍 Search...] [⚙] [+]        │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ ☐  Complete project report  ││
│  │    [!] Due: Dec 31         ││
│  │    [work] [urgent]         ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ ☑  Buy groceries           ││
│  │    ✓ Completed             ││
│  │    [personal]              ││
│  └─────────────────────────────┘│
│                                 │
│  [Load more...]                 │
│                                 │
└─────────────────────────────────┘

Hamburger menu slides in:
┌──────────────────┐
│  FILTERS         │
│                  │
│  Status          │
│  ☑ All           │
│  ...             │
│                  │
│  [Apply] [Clear] │
└──────────────────┘
```

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab order, focus visible, Enter/Space activation |
| Screen reader support | ARIA labels, live regions for updates |
| Color contrast | 4.5:1 minimum for text |
| Focus management | Modal focus trap, return focus on close |
| Error announcements | aria-live for form errors |
| Skip links | Skip to main content link |

---

## Test Cases

### Unit Tests

| Test ID | Component | Description |
|---------|-----------|-------------|
| UT-UI-001 | TodoCard | Renders todo data correctly |
| UT-UI-002 | TodoCard | Checkbox toggles completion |
| UT-UI-003 | TodoCard | Shows overdue styling for past due |
| UT-UI-004 | TodoForm | Validates required fields |
| UT-UI-005 | TodoForm | Submits valid data |
| UT-UI-006 | TodoFilters | Updates filter state |
| UT-UI-007 | TodoSearch | Debounces input |
| UT-UI-008 | PriorityBadge | Shows correct color per priority |

### Integration Tests

| Test ID | Description |
|---------|-------------|
| IT-UI-001 | Create todo flow end-to-end |
| IT-UI-002 | Edit todo flow end-to-end |
| IT-UI-003 | Delete todo with confirmation |
| IT-UI-004 | Filter and search combination |
| IT-UI-005 | Pagination/infinite scroll |

### E2E Tests (Playwright)

| Test ID | Description |
|---------|-------------|
| E2E-UI-001 | Full CRUD workflow |
| E2E-UI-002 | Mobile responsive layout |
| E2E-UI-003 | Keyboard navigation |
| E2E-UI-004 | Real-time updates (WebSocket) |

---

## Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `next` | Framework | ^14.0.0 |
| `react` | UI Library | ^18.0.0 |
| `tailwindcss` | Styling | ^3.4.0 |
| `@tanstack/react-query` | Data fetching | ^5.0.0 |
| `react-hook-form` | Form handling | ^7.0.0 |
| `zod` | Validation | ^3.23.0 |
| `date-fns` | Date formatting | ^3.0.0 |
| `lucide-react` | Icons | ^0.300.0 |
| `class-variance-authority` | Component variants | ^0.7.0 |
| `clsx` | Class merging | ^2.0.0 |

---

## File Mapping

| File Path | Task ID |
|-----------|---------|
| `apps/web/app/(dashboard)/layout.tsx` | TASK-2-001-01 |
| `apps/web/app/(dashboard)/page.tsx` | TASK-2-001-01 |
| `apps/web/components/ui/*.tsx` | TASK-2-001-02 |
| `apps/web/components/layout/*.tsx` | TASK-2-001-03 |
| `apps/web/components/todo/todo-card.tsx` | TASK-2-001-04 |
| `apps/web/components/todo/todo-list.tsx` | TASK-2-001-05 |
| `apps/web/components/todo/todo-form.tsx` | TASK-2-001-06 |
| `apps/web/components/todo/todo-modal.tsx` | TASK-2-001-07 |
| `apps/web/components/todo/todo-filters.tsx` | TASK-2-001-08 |
| `apps/web/components/todo/todo-search.tsx` | TASK-2-001-09 |
| `apps/web/hooks/use-todos.ts` | TASK-2-001-10 |
| `apps/web/lib/api-client.ts` | TASK-2-001-11 |
| `apps/web/__tests__/` | TASK-2-001-12 |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
| UX Designer | | | |
