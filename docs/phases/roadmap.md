# Development Roadmap

## Phase 0 — Project Setup ✅
**Goal:** Repository, folder structure, documentation baseline, tooling.

### Completed
- [x] GitHub repository created (`Deurrr/devmind-agent`)
- [x] Folder structure defined (`apps/web`, `apps/api`, `packages/shared`, `docs`)
- [x] README written
- [x] Architecture documentation
- [x] Technology stack documentation
- [x] Roadmap created

---

## Phase 1 — Core MVP
**Goal:** A working web app where a user can register, log in, and chat with a single AI agent that streams responses and generates code.

### Tasks
- [ ] Monorepo setup with npm workspaces
- [ ] Docker Compose for PostgreSQL + Redis
- [ ] Fastify API bootstrapped with TypeScript
- [ ] Prisma schema + migrations (users, projects, sessions)
- [ ] JWT auth (register, login, refresh, logout)
- [ ] Claude API integration with streaming (SSE)
- [ ] Single "Coder" agent that responds to prompts
- [ ] Next.js app with auth pages (login, register)
- [ ] Chat UI with streaming token display
- [ ] Syntax-highlighted code blocks (Shiki)
- [ ] Basic project creation and history

### Definition of Done
A user can sign up, create a project, type "build me a REST API for users", and see a streaming response with formatted code.

---

## Phase 2 — Multi-Agent Orchestration
**Goal:** Multiple specialized agents working together, with a visual graph showing their activity.

### Tasks
- [ ] Agent Orchestrator service
- [ ] Planner, Researcher, Architect, Coder, Reviewer, Tester agents
- [ ] Agent context/memory sharing through Orchestrator
- [ ] SSE event types for agent lifecycle (start, thinking, done, handoff)
- [ ] React Flow agent graph component
- [ ] Custom agent nodes with status indicators (idle, thinking, done)
- [ ] Animated edges showing active communication
- [ ] Mermaid diagram rendering for Architect agent output
- [ ] Split view: agent graph + chat/code output

### Definition of Done
User sends a prompt, watches 4+ agents activate in sequence on the graph, and receives a complete response with architecture diagram + code.

---

## Phase 3 — Real Tool Use
**Goal:** Agents can actually search the web, interact with GitHub, and execute code.

### Tasks
- [ ] Tool Service abstraction layer
- [ ] Brave Search API integration (Research agent)
- [ ] GitHub API integration via Octokit (read repos, create repos, push files)
- [ ] Code execution sandbox (Docker exec, isolated environment)
- [ ] Tool call UI: show tool invocations in the chat timeline
- [ ] Export to ZIP (archiver)
- [ ] Push to GitHub flow (OAuth or PAT)

### Definition of Done
User can ask "add a search feature to this GitHub repo" and the agent reads the repo, plans, writes code, and opens a PR.

---

## Phase 4 — Polish & Deploy
**Goal:** Production-ready, publicly accessible, impressive to show.

### Tasks
- [ ] Landing page with demo video embed
- [ ] Responsive design review
- [ ] Error handling and loading states throughout
- [ ] Rate limiting and security hardening
- [ ] Environment variable documentation
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend + DB + Redis to Railway
- [ ] Custom domain (optional)
- [ ] Demo project preloaded for unauthenticated preview

### Definition of Done
Project is live at a public URL and works end-to-end for a demo.

---

## Phase Log

### 2026-03-21 — Phase 0 Complete
- Initialized project with full documentation
- Created GitHub repository: https://github.com/Deurrr/devmind-agent
- Defined architecture, tech stack, and roadmap
