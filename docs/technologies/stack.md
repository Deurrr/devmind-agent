# Technology Stack

## Frontend — Next.js 14

**What it is:** React framework with server-side rendering, app router, and built-in API routes.

**Why we use it:**
- App Router enables server components, which reduce client-side bundle size
- Built-in TypeScript support
- Seamless deployment to Vercel
- Industry standard for modern React applications

**Key features used:**
- App Router (`/app` directory)
- Server Components for initial data fetching
- Client Components for interactive UI (chat, agent graph)
- Route Handlers for lightweight API endpoints (auth, etc.)
- Streaming with `ReadableStream` for SSE consumption

---

## UI — Tailwind CSS + shadcn/ui

**What it is:** Tailwind is a utility-first CSS framework. shadcn/ui is a collection of accessible, unstyled components built with Radix UI.

**Why we use it:**
- Tailwind eliminates CSS file bloat and enables rapid UI development
- shadcn/ui components are copy-paste (not a dependency), giving full control over the code
- Consistent design system without fighting a heavy component library

---

## State Management — Zustand

**What it is:** Minimal, unopinionated state management library for React.

**Why we use it:**
- Much simpler than Redux for this use case
- Works great with TypeScript
- No boilerplate — define a store in ~10 lines
- Persistent middleware for localStorage sync

---

## Agent Graph — React Flow

**What it is:** Library for building node-based editors and diagrams in React.

**Why we use it:**
- Renders the live agent communication graph
- Supports custom node types (each agent is a custom node)
- Built-in zoom, pan, and minimap
- Can animate edges to show active message passing between agents

---

## Backend — Fastify

**What it is:** High-performance Node.js web framework, faster than Express.

**Why we use it:**
- Schema-based validation with JSON Schema (built-in)
- Plugin system keeps code modular
- Better TypeScript support than Express out of the box
- ~35% faster than Express in benchmarks
- SSE support via `@fastify/sse-v2`

---

## AI — Claude API (claude-sonnet-4-6)

**What it is:** Anthropic's Claude model accessed via REST API.

**Why claude-sonnet-4-6:**
- Best balance of intelligence and speed for agentic tasks
- Native tool use (function calling) — agents can call real tools
- Extended thinking capability for complex planning tasks
- Supports streaming, so we can push tokens to the client in real-time

**How tool use works:**
```typescript
// We define tools the agent can call
const tools = [
  {
    name: "web_search",
    description: "Search the web for documentation or examples",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" }
      }
    }
  }
]

// Claude decides when and how to call them
// We execute the tool and send the result back to Claude
// Claude continues generating with the tool result as context
```

---

## Database — PostgreSQL + Prisma

**What it is:** PostgreSQL is a production-grade relational database. Prisma is a type-safe ORM for Node.js.

**Why we use it:**
- Projects, users, sessions are relational data — PostgreSQL is the right fit
- Prisma generates TypeScript types from the schema automatically
- Prisma Migrate handles database migrations
- JSONB columns for flexible agent log storage

---

## Cache — Redis

**What it is:** In-memory key-value store.

**Why we use it:**
- Store active SSE session state
- Cache frequent tool results (web searches)
- Rate limiting counters
- Session tokens for quick lookup

---

## Infrastructure — Docker Compose

**What it is:** Tool for defining and running multi-container Docker applications.

**Why we use it:**
- Single `docker-compose up` starts PostgreSQL, Redis, and the API
- Consistent environment across all developer machines
- Same config used in production (Railway)

---

## Deployment

| Service | Platform |
|---------|---------|
| Frontend | Vercel (automatic deployments from `main` branch) |
| Backend API | Railway (Docker-based deployment) |
| PostgreSQL | Railway managed database |
| Redis | Railway managed Redis |

---

## Additional Libraries

| Library | Purpose |
|---------|---------|
| `shiki` | Syntax highlighting for generated code |
| `mermaid` | Render architecture diagrams from the Architect agent |
| `archiver` | Bundle generated files into ZIP for download |
| `@octokit/rest` | GitHub API client for pushing code to repos |
| `brave-search` | Web search API for the Research agent |
