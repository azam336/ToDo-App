# CLAUDE.md - AI Assistant Instructions

## Project Overview
**Project:** Evolving Todo System
**Methodology:** Spec-Driven Development
**Architecture:** Cloud-Native Monorepo

## Non-Negotiable Rules

### Spec-Driven Development Mandate
1. **NO implementation before specification** - Every feature must be specified first
2. **NO code before task breakdown** - Tasks must be granular and approved
3. **Every file must map to a Task ID** - Traceability is mandatory
4. **Every task must map to a Feature Spec** - Under `/specs/features/`
5. **Every feature must map to Constitution principles** - Reference `Constitution.md`

### Mandatory Workflow
```
Constitution.md → Feature Spec → Architecture Plan → Task Breakdown → Implementation
```

### Development Commands
```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Start development
pnpm dev

# Lint/format
pnpm lint
pnpm format
```

## Project Phases

| Phase | Name | Description |
|-------|------|-------------|
| I | CLI In-Memory | Command-line todo with in-memory storage |
| II | Full Stack Web | React frontend + Node.js API + PostgreSQL |
| III | AI Chatbot | Natural language interface with MCP tools |
| IV | Local K8s | Kubernetes deployment with Helm charts |
| V | Cloud Native | Event-driven with Kafka + Dapr on cloud |

## Spec Locations

| Artifact | Location |
|----------|----------|
| Constitution | `/Constitution.md` |
| Spec Config | `/.spec-kit/config.yaml` |
| Feature Specs | `/specs/features/` |
| Architecture | `/specs/architecture/` |
| Task Breakdown | `/specs/tasks/` |

## Code Organization (Monorepo)

```
apps/           → Deployable applications
packages/       → Shared libraries
infra/          → Infrastructure as Code
specs/          → All specifications
docs/           → Documentation
```

## Quality Gates

Before any PR/commit:
1. ✅ Spec exists and is approved
2. ✅ Task ID referenced in commit message
3. ✅ Tests written and passing
4. ✅ No linting errors
5. ✅ Architecture constraints satisfied

## AI Assistant Behavior

When asked to implement:
1. **Check** if spec exists at `/specs/features/`
2. **Check** if task breakdown exists at `/specs/tasks/`
3. **If missing** → Generate spec first, ask for approval
4. **If exists** → Implement strictly per spec

When asked about architecture:
1. Reference `/specs/architecture/`
2. Ensure cloud-native principles
3. Maintain phase compatibility

## Key Principles Reference

See `Constitution.md` for:
- Core architectural principles
- Technology choices
- Constraints and boundaries
- Quality attributes
