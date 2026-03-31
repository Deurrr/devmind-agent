# DevMind — Multi-Agent AI Code Orchestrator

> A platform where you describe what you want to build and a team of specialized AI agents collaborate in real-time to design it, code it, review it, and test it.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Fastify%20%7C%20Claude%20API-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What is DevMind?

DevMind is a multi-agent AI platform that orchestrates a team of specialized agents to help developers build software faster. You describe a feature or project, and the agents take over:

| Agent | Responsibility |
|-------|---------------|
| **Planner** | Breaks down the task into subtasks and coordinates the team |
| **Researcher** | Searches documentation, libraries, and best practices |
| **Architect** | Designs system architecture and generates diagrams |
| **Coder** | Writes the actual source code files |
| **Reviewer** | Reviews code for security, performance, and best practices |
| **Tester** | Writes unit and integration tests |

## Key Features

- **Real-time streaming** — Watch agents think and work as it happens
- **Visual agent graph** — See which agents are active and how they communicate
- **Real tool use** — Web search, GitHub API, code execution sandbox
- **Agent handoff** — Agents can delegate and request work from each other
- **Project memory** — Persistent context across sessions
- **Code export** — Download as ZIP or push directly to GitHub

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Flow |
| Backend | Fastify, Node.js, TypeScript |
| AI | Claude API (claude-sonnet-4-6), tool use, streaming |
| Database | PostgreSQL (Prisma), Redis |
| Infrastructure | Docker Compose, Vercel, Railway |
| Extras | Mermaid.js, Shiki, Brave Search API |

## Project Structure

```
devmind-agent/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Fastify backend
├── packages/
│   └── shared/       # Shared types and utilities
├── docs/             # Project documentation
│   ├── architecture/ # System design docs
│   ├── technologies/ # Tech stack explanations
│   └── phases/       # Development roadmap and phase logs
└── docker-compose.yml
```

## Development Roadmap

- [x] **Phase 0** — Project setup, repo, documentation
- [x] **Phase 1** — Auth + single agent chat with streaming
- [x] **Phase 2** — Multi-agent orchestration + agent graph UI
- [x] **Phase 3** — Real tool use (web search, GitHub, sandbox)
- [x] **Phase 4** — Polish, deploy, landing page

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Deurrr/devmind-agent.git
cd devmind-agent

# Install dependencies
npm install

# Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start with Docker
docker-compose up -d

# Start development servers
npm run dev
```

## Documentation

Full documentation is available in the [`/docs`](./docs) folder:
- [Architecture Overview](./docs/architecture/overview.md)
- [Technology Stack](./docs/technologies/stack.md)
- [Development Phases](./docs/phases/roadmap.md)

---

Built by [Josue Rueda](https://github.com/Deurrr) — Full Stack Developer
