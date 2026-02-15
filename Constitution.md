# Constitution.md - Evolving Todo System

> **This document is the supreme authority for all architectural and implementation decisions.**
> Any conflict between this Constitution and other documents shall be resolved in favor of this Constitution.

---

## Article I: Core Mission

### Section 1.1: Purpose
Build a production-ready, cloud-native todo system that demonstrates progressive architectural evolution while maintaining:
- **Simplicity** - Start simple, grow complex only when needed
- **Scalability** - Design for growth from day one
- **Extensibility** - AI-native, plugin-friendly architecture
- **Quality** - Production-grade code at every phase

### Section 1.2: Guiding Philosophy
```
"Make it work, make it right, make it fast — in that order."
                                        — Kent Beck
```

---

## Article II: Architectural Principles

### Section 2.1: Fundamental Laws

| ID | Principle | Description |
|----|-----------|-------------|
| AP-01 | **Domain First** | Business logic is independent of frameworks, UI, and infrastructure |
| AP-02 | **Dependency Inversion** | High-level modules shall not depend on low-level modules |
| AP-03 | **Single Responsibility** | Each module/service has one reason to change |
| AP-04 | **Interface Segregation** | Depend on abstractions, not concretions |
| AP-05 | **Open/Closed** | Open for extension, closed for modification |

### Section 2.2: Cloud-Native Mandates

| ID | Mandate | Rationale |
|----|---------|-----------|
| CN-01 | **12-Factor App** | All services must comply with 12-factor methodology |
| CN-02 | **Stateless Services** | Application layer must be horizontally scalable |
| CN-03 | **Config via Environment** | No hardcoded configuration |
| CN-04 | **Health Endpoints** | Every service exposes /health and /ready |
| CN-05 | **Graceful Shutdown** | Handle SIGTERM with connection draining |

### Section 2.3: Data Principles

| ID | Principle | Application |
|----|-----------|-------------|
| DP-01 | **Single Source of Truth** | PostgreSQL is authoritative for todo state |
| DP-02 | **Event Sourcing Ready** | All mutations can be expressed as events |
| DP-03 | **Schema Evolution** | Database migrations are versioned and reversible |
| DP-04 | **Data Validation** | Validate at boundaries, trust internally |

---

## Article III: Technology Mandates

### Section 3.1: Language & Runtime
```yaml
language: TypeScript 5.x
runtime: Node.js 20 LTS
strict_mode: true
target: ES2022
```

**Rationale:** TypeScript provides type safety while maintaining JavaScript ecosystem access. Node.js 20 LTS ensures long-term support and modern features.

### Section 3.2: Monorepo Structure
```yaml
tool: Turborepo
package_manager: pnpm
workspace_protocol: true
```

**Mandated Structure:**
```
/apps       → Deployable applications (cli, web, api, ai-bot, mcp-server)
/packages   → Shared libraries (core, db, events, shared)
/infra      → Infrastructure as Code
/specs      → All specifications
```

### Section 3.3: Framework Choices

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | Next.js 14 + React 18 | Server components, app router, industry standard |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| Backend | Fastify | Performance, schema validation, ecosystem |
| ORM | Drizzle | Type-safe, performant, SQL-like syntax |
| Validation | Zod | Runtime validation with TypeScript inference |
| Testing | Vitest | Fast, ESM-native, Jest-compatible |

### Section 3.4: Infrastructure Stack

| Component | Technology | Phase Introduced |
|-----------|------------|------------------|
| Database | PostgreSQL 16 | Phase II |
| Cache | Redis 7 | Phase II |
| Containers | Docker | Phase IV |
| Orchestration | Kubernetes | Phase IV |
| Events | Apache Kafka | Phase V |
| Sidecar | Dapr | Phase V |
| IaC | Terraform | Phase V |

---

## Article IV: Quality Standards

### Section 4.1: Code Quality

| Metric | Minimum | Target |
|--------|---------|--------|
| Test Coverage | 80% | 90% |
| Type Coverage | 95% | 100% |
| Cyclomatic Complexity | < 10 | < 5 |
| Duplicate Code | < 3% | 0% |

### Section 4.2: Testing Pyramid

```
         ╱╲
        ╱  ╲        E2E Tests (10%)
       ╱────╲       - Critical user journeys
      ╱      ╲
     ╱        ╲     Integration Tests (30%)
    ╱──────────╲    - API contracts, DB operations
   ╱            ╲
  ╱              ╲  Unit Tests (60%)
 ╱────────────────╲ - Business logic, utilities
```

### Section 4.3: Documentation Requirements

| Artifact | Required | Format |
|----------|----------|--------|
| API Endpoints | Yes | OpenAPI 3.1 |
| Database Schema | Yes | DBML + Migrations |
| Architecture Decisions | Yes | ADR (Architecture Decision Record) |
| Component Interfaces | Yes | TypeScript types + JSDoc |

---

## Article V: Security Constraints

### Section 5.1: Authentication & Authorization

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT with refresh tokens |
| Password Storage | Argon2id hashing |
| Session Management | Secure, httpOnly cookies |
| Authorization | Role-based (RBAC) |

### Section 5.2: Data Protection

| Requirement | Implementation |
|-------------|----------------|
| Data at Rest | AES-256 encryption |
| Data in Transit | TLS 1.3 minimum |
| PII Handling | Minimal collection, explicit consent |
| Secrets Management | Environment variables, never in code |

### Section 5.3: OWASP Compliance

All code must be protected against:
- [ ] A01: Broken Access Control
- [ ] A02: Cryptographic Failures
- [ ] A03: Injection
- [ ] A04: Insecure Design
- [ ] A05: Security Misconfiguration
- [ ] A06: Vulnerable Components
- [ ] A07: Authentication Failures
- [ ] A08: Data Integrity Failures
- [ ] A09: Logging Failures
- [ ] A10: SSRF

---

## Article VI: API Design Standards

### Section 6.1: REST Conventions

```yaml
versioning: URL path (/api/v1/)
naming: kebab-case for URLs, camelCase for JSON
pagination: cursor-based
filtering: query parameters
errors: RFC 7807 Problem Details
```

### Section 6.2: Response Format

**Success Response:**
```json
{
  "data": { },
  "meta": {
    "timestamp": "ISO8601",
    "requestId": "uuid"
  }
}
```

**Error Response:**
```json
{
  "type": "https://api.todo.app/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "The 'title' field is required",
  "instance": "/api/v1/todos",
  "errors": []
}
```

### Section 6.3: HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Server error |

---

## Article VII: Domain Model

### Section 7.1: Core Entities

```typescript
// Todo - The central entity
interface Todo {
  id: string;           // UUID v7
  title: string;        // 1-200 characters
  description?: string; // 0-2000 characters
  status: TodoStatus;   // 'pending' | 'in_progress' | 'completed'
  priority: Priority;   // 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: Date;       // Optional deadline
  tags: string[];       // 0-10 tags
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId: string;       // Owner reference
}

// User - Todo owner
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
```

### Section 7.2: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-01 | Todo title is required and 1-200 chars | Validation layer |
| BR-02 | Completed todos cannot be edited | Domain layer |
| BR-03 | Due date cannot be in the past (on create) | Domain layer |
| BR-04 | Users can only access their own todos | Authorization layer |
| BR-05 | Maximum 1000 active todos per user | Domain layer |

---

## Article VIII: Event Schema (Phase V)

### Section 8.1: Event Structure

```typescript
interface DomainEvent {
  eventId: string;      // UUID v7
  eventType: string;    // e.g., 'todo.created'
  aggregateId: string;  // Todo ID
  aggregateType: string;// 'Todo'
  payload: object;      // Event-specific data
  metadata: {
    timestamp: string;  // ISO8601
    userId: string;
    correlationId: string;
    causationId?: string;
  };
  version: number;      // Schema version
}
```

### Section 8.2: Event Types

| Event | Trigger | Payload |
|-------|---------|---------|
| `todo.created` | New todo | Full todo object |
| `todo.updated` | Todo modified | Changed fields only |
| `todo.completed` | Status → completed | Todo ID, timestamp |
| `todo.deleted` | Todo removed | Todo ID |

---

## Article IX: Observability

### Section 9.1: Logging

```yaml
format: JSON structured
levels: [debug, info, warn, error]
required_fields:
  - timestamp
  - level
  - message
  - requestId
  - service
```

### Section 9.2: Metrics

| Metric Type | Examples |
|-------------|----------|
| Counter | requests_total, errors_total |
| Histogram | request_duration_seconds |
| Gauge | active_connections, queue_depth |

### Section 9.3: Tracing

```yaml
protocol: OpenTelemetry
propagation: W3C Trace Context
sampling: 10% in production, 100% in dev
```

---

## Article X: Development Workflow

### Section 10.1: Spec-Driven Development

```
┌─────────────────────────────────────────────────────────────┐
│  1. CONSTITUTION                                             │
│     Define principles & constraints                          │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. FEATURE SPECIFICATION                                    │
│     Write detailed spec in /specs/features/                  │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ARCHITECTURE PLAN                                        │
│     Document in /specs/architecture/                         │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  4. TASK BREAKDOWN                                           │
│     Granular tasks in /specs/tasks/                          │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  5. IMPLEMENTATION                                           │
│     Code strictly per spec, reference task IDs               │
└─────────────────────────────────────────────────────────────┘
```

### Section 10.2: Git Workflow

```yaml
branches:
  main: Production-ready code
  develop: Integration branch
  feature/*: Feature branches
  fix/*: Bug fix branches
  release/*: Release preparation

commit_format: "[TASK-XXX] type: description"
```

### Section 10.3: Code Review Requirements

- [ ] Spec compliance verified
- [ ] Tests passing
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] Performance acceptable

---

## Article XI: Amendments

### Section 11.1: Amendment Process

1. Propose change via PR to Constitution.md
2. Document rationale in PR description
3. Obtain approval from architect role
4. Update all affected specifications

### Section 11.2: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-XX-XX | Initial Constitution |

---

## Signatures

This Constitution is ratified and in effect.

```
Architect: ____________________  Date: __________
Lead Dev:  ____________________  Date: __________
```
