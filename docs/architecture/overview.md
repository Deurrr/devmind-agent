# Architecture Overview

## System Design

DevMind follows a **service-oriented architecture** with two main applications: a Next.js frontend and a Fastify backend API. Both are TypeScript-first and communicate via HTTP and Server-Sent Events (SSE) for real-time streaming.

```
┌─────────────────────────────────────────────────┐
│              Next.js Frontend                   │
│   TypeScript + Tailwind + shadcn/ui + Zustand   │
│   SSE streaming | Agent graph (React Flow)      │
└──────────────────┬──────────────────────────────┘
                   │ HTTP / SSE
┌──────────────────▼──────────────────────────────┐
│          API Gateway (Fastify)                  │
│              Auth — JWT / bcrypt                │
└──────┬──────────────────┬───────────────────────┘
       │                  │
┌──────▼──────┐  ┌────────▼──────────────────────┐
│ Orchestrator│  │        Tool Service            │
│   Service   │  │  Web Search | GitHub API       │
│             │  │  Code Sandbox (Docker exec)    │
└──────┬──────┘  └───────────────────────────────┘
       │
┌──────▼───────────────────────────────────────────┐
│              Claude API                          │
│   claude-sonnet-4-6 + tool use + streaming       │
└──────┬───────────────────────────────────────────┘
       │
┌──────▼──────┐  ┌────────────┐  ┌────────────────┐
│ PostgreSQL  │  │   Redis    │  │    Storage     │
│  projects  │  │  sessions  │  │  generated     │
│  users     │  │  cache     │  │  files         │
└────────────┘  └────────────┘  └────────────────┘
```

## Agent Orchestration Model

The orchestrator follows a **supervisor pattern**:

1. The **Planner Agent** receives the user request and creates a task plan
2. The Planner delegates tasks to **specialized agents**
3. Each agent has access to specific **tools** (web search, file write, code exec)
4. Agents communicate results back to the Planner
5. The Planner assembles the final output and streams it to the client

### Agent Communication

Agents do not communicate directly with each other. All communication goes through the Orchestrator, which:
- Maintains the shared context/memory for the session
- Decides which agent runs next based on the current plan
- Injects relevant previous agent outputs into each new agent's context

## Streaming Architecture

Real-time streaming uses **Server-Sent Events (SSE)**:

```
Client → POST /api/projects/:id/run  →  Fastify handler
                                           ↓
                                    Orchestrator starts
                                           ↓
                              Claude API stream (tool use)
                                           ↓
                            SSE events pushed to client:
                            { type: "agent_start", agent: "planner" }
                            { type: "token", content: "..." }
                            { type: "tool_call", tool: "web_search" }
                            { type: "agent_done", agent: "planner" }
                            { type: "agent_start", agent: "coder" }
                            ...
```

## Database Schema (high level)

```
users
  id, email, password_hash, created_at

projects
  id, user_id, title, description, status, created_at

sessions
  id, project_id, messages (JSONB), agent_log (JSONB), created_at

generated_files
  id, session_id, filename, content, language, created_at
```

## Security Considerations

- JWT tokens stored in httpOnly cookies (not localStorage)
- bcrypt for password hashing (cost factor 12)
- Rate limiting on all API routes via Fastify plugin
- Input sanitization before passing to Claude API
- Code sandbox runs in isolated Docker containers with no network access
