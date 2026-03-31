'use client'

import { useEffect, useRef, useState } from 'react'
import { Lock as LockIcon } from 'lucide-react'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { AgentStatusBar } from '@/components/chat/AgentStatusBar'
import type { Message, AgentType } from '@/types'

const DEMO_MESSAGES: Message[] = [
  {
    role: 'user',
    content: 'Build me a REST API for user authentication with JWT — register, login, refresh token, and logout endpoints.',
    timestamp: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    role: 'assistant',
    agentType: 'planner',
    content: `I'll coordinate the team to build your JWT auth REST API. Here's the plan:

1. **Researcher** — Look up best practices for JWT auth and bcrypt password hashing
2. **Architect** — Design the API structure and data model
3. **Coder** — Implement the four endpoints (register, login, refresh, logout)
4. **Reviewer** — Security review of the auth implementation
5. **Tester** — Write integration tests for all endpoints

Let's get started. Handing off to Researcher.`,
    timestamp: new Date(Date.now() - 118_000).toISOString(),
  },
  {
    role: 'tool',
    content: '',
    tool: 'brave_search',
    toolInput: { query: 'JWT authentication best practices 2024 Node.js refresh token rotation' },
    toolResult: `Top results:
- JWT Best Practices (jwt.io): Use short-lived access tokens (15m), long-lived refresh tokens (7d) with rotation
- OWASP: Store refresh tokens in httpOnly cookies, not localStorage
- Auth0 Blog: Implement token rotation — invalidate old refresh token on use
- Node.js security: bcrypt with cost factor 12+ for password hashing`,
    timestamp: new Date(Date.now() - 115_000).toISOString(),
  },
  {
    role: 'assistant',
    agentType: 'researcher',
    content: `Research complete. Key findings:

- **Access tokens**: 15 minute expiry (short-lived)
- **Refresh tokens**: 7 day expiry with **rotation** (invalidate on each use)
- **Storage**: Refresh tokens in httpOnly cookies, access tokens in memory
- **Passwords**: bcrypt with cost factor 12
- **Security**: Rate limit auth endpoints, constant-time comparison for tokens

Handing off to Architect.`,
    timestamp: new Date(Date.now() - 113_000).toISOString(),
  },
  {
    role: 'assistant',
    agentType: 'architect',
    content: `Here's the API architecture:

\`\`\`mermaid
graph TD
  Client --> |POST /auth/register| Register[Register Handler]
  Client --> |POST /auth/login| Login[Login Handler]
  Client --> |POST /auth/refresh| Refresh[Refresh Token Handler]
  Client --> |POST /auth/logout| Logout[Logout Handler]

  Register --> DB[(PostgreSQL)]
  Login --> DB
  Refresh --> Redis[(Redis Token Store)]
  Logout --> Redis

  Register --> |bcrypt hash| DB
  Login --> |JWT sign| Client
  Refresh --> |token rotation| Redis
\`\`\`

**Data model:**
\`\`\`
User: id, email, passwordHash, createdAt
RefreshToken: id, userId, token, expiresAt, used
\`\`\`

Ready for Coder.`,
    timestamp: new Date(Date.now() - 110_000).toISOString(),
  },
  {
    role: 'assistant',
    agentType: 'coder',
    content: `Implementing the auth API. Here are the core files:

\`\`\`typescript
// src/routes/auth.ts
import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { redis } from '../lib/redis.js'
import crypto from 'node:crypto'

const REFRESH_TTL = 7 * 24 * 60 * 60  // 7 days in seconds

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/register', {
    config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
  }, async (req, reply) => {
    const { email, password, name } = z.object({
      email: z.string().email(),
      password: z.string().min(8).max(128),
      name: z.string().min(1).max(100).optional(),
    }).parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return reply.code(409).send({ error: 'Email already in use' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true },
    })

    return reply.code(201).send({ user })
  })

  // POST /auth/login
  app.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
  }, async (req, reply) => {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string(),
    }).parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    const validPassword = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, '$2a$12$placeholder')  // timing-safe

    if (!user || !validPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }

    const accessToken = app.jwt.sign({ userId: user.id }, { expiresIn: '15m' })
    const refreshToken = crypto.randomBytes(64).toString('hex')

    await redis.setex(\`refresh:\${refreshToken}\`, REFRESH_TTL, user.id)

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true, secure: true, sameSite: 'strict', maxAge: REFRESH_TTL,
    })

    return reply.send({ accessToken, user: { id: user.id, email: user.email, name: user.name } })
  })

  // POST /auth/refresh — token rotation
  app.post('/refresh', async (req, reply) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return reply.code(401).send({ error: 'No refresh token' })

    const userId = await redis.get(\`refresh:\${refreshToken}\`)
    if (!userId) return reply.code(401).send({ error: 'Invalid or expired refresh token' })

    // Rotate: delete old, issue new
    await redis.del(\`refresh:\${refreshToken}\`)
    const newRefreshToken = crypto.randomBytes(64).toString('hex')
    await redis.setex(\`refresh:\${newRefreshToken}\`, REFRESH_TTL, userId)

    const accessToken = app.jwt.sign({ userId }, { expiresIn: '15m' })

    reply.setCookie('refreshToken', newRefreshToken, {
      httpOnly: true, secure: true, sameSite: 'strict', maxAge: REFRESH_TTL,
    })

    return reply.send({ accessToken })
  })

  // POST /auth/logout
  app.post('/logout', async (req, reply) => {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
      await redis.del(\`refresh:\${refreshToken}\`)
    }
    reply.clearCookie('refreshToken')
    return reply.send({ ok: true })
  })
}
\`\`\`

All four endpoints implemented. Passing to Reviewer.`,
    timestamp: new Date(Date.now() - 105_000).toISOString(),
  },
  {
    role: 'assistant',
    agentType: 'reviewer',
    content: `Security review complete. ✅ **Approved with notes:**

**Good practices found:**
- ✅ Timing-safe password check (dummy hash prevents user enumeration)
- ✅ Refresh token rotation on every use
- ✅ httpOnly + Secure + SameSite cookies for refresh tokens
- ✅ Rate limiting on register and login
- ✅ Input validation with Zod (max lengths enforced)
- ✅ bcrypt cost factor 12

**Recommendations:**
- Consider adding CSRF protection if using cookie-based auth in a browser
- Log failed login attempts for monitoring
- Add refresh token family tracking to detect token theft

Overall: production-ready. Passing to Tester.`,
    timestamp: new Date(Date.now() - 100_000).toISOString(),
  },
  {
    role: 'tool',
    content: '',
    tool: 'execute_code',
    toolInput: { language: 'typescript', code: 'run integration tests' },
    toolResult: `✓ POST /auth/register → 201 (happy path)
✓ POST /auth/register → 409 (duplicate email)
✓ POST /auth/register → 400 (invalid email)
✓ POST /auth/login → 200 (valid credentials)
✓ POST /auth/login → 401 (wrong password, constant time)
✓ POST /auth/refresh → 200 (valid refresh token)
✓ POST /auth/refresh → 401 (reuse after rotation — blocked)
✓ POST /auth/logout → 200

All 8 tests passed in 312ms`,
    timestamp: new Date(Date.now() - 95_000).toISOString(),
  },
  {
    role: 'assistant',
    agentType: 'tester',
    content: `All 8 integration tests pass ✅

Test coverage includes:
- Happy path for all 4 endpoints
- Duplicate email rejection
- Invalid credentials (constant-time verified)
- **Refresh token rotation attack** — reusing a rotated token is correctly rejected (401)
- Clean logout clears token from Redis

The JWT auth API is complete and verified. You can download the full implementation as a ZIP or push it to your GitHub repo using the export buttons above.`,
    timestamp: new Date(Date.now() - 90_000).toISOString(),
  },
]

const AGENT_SEQUENCE: Array<{ agent: AgentType | null; delay: number }> = [
  { agent: 'planner', delay: 800 },
  { agent: 'researcher', delay: 2200 },
  { agent: 'architect', delay: 3800 },
  { agent: 'coder', delay: 5500 },
  { agent: 'reviewer', delay: 7500 },
  { agent: 'tester', delay: 9000 },
  { agent: null, delay: 10500 },
]

const AGENT_COLORS: Record<AgentType, string> = {
  planner: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  researcher: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  architect: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  coder: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
  reviewer: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
  tester: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
}

const ALL_AGENTS: AgentType[] = ['planner', 'researcher', 'architect', 'coder', 'reviewer', 'tester']

export function DemoChat() {
  const [visibleCount, setVisibleCount] = useState(1)
  const [activeAgent, setActiveAgent] = useState<AgentType | null>('planner')
  const [isStreaming, setIsStreaming] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    DEMO_MESSAGES.forEach((_, idx) => {
      const t = setTimeout(() => {
        setVisibleCount(idx + 2) // +1 for next message, +1 for index offset
      }, (idx + 1) * 1200)
      timers.push(t)
    })

    AGENT_SEQUENCE.forEach(({ agent, delay }) => {
      const t = setTimeout(() => {
        setActiveAgent(agent)
        if (agent === null) setIsStreaming(false)
      }, delay * 1.5)
      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount])

  const messages = DEMO_MESSAGES.slice(0, visibleCount)

  return (
    <div className="h-full flex">
      {/* Chat panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        <AgentStatusBar activeAgent={activeAgent} isStreaming={isStreaming} />

        {/* Locked input */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <LockIcon className="w-4 h-4 text-zinc-600 shrink-0" />
            <span className="text-zinc-600 text-sm flex-1">
              This is a demo. Sign up to run your own agents.
            </span>
            <a href="/register" className="text-xs text-violet-400 hover:text-violet-300 shrink-0 underline">
              Get started →
            </a>
          </div>
        </div>
      </div>

      {/* Agent panel */}
      <div className="hidden lg:flex flex-col w-72 border-l border-zinc-800 bg-zinc-900/30 p-4 gap-4 shrink-0">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Agent Graph</p>

        <div className="grid grid-cols-2 gap-2">
          {ALL_AGENTS.map((agent) => {
            const isDone = messages.some((m) => m.agentType === agent)
            const isActive = activeAgent === agent
            return (
              <div
                key={agent}
                className={`rounded-lg border p-2.5 transition-all ${
                  isActive
                    ? AGENT_COLORS[agent] + ' scale-105 shadow-lg'
                    : isDone
                    ? 'bg-zinc-800/60 border-zinc-700 opacity-70'
                    : 'bg-zinc-900 border-zinc-800 opacity-40'
                }`}
              >
                <div className="text-base mb-1">
                  {agent === 'planner' ? '🗺️' : agent === 'researcher' ? '🔍' : agent === 'architect' ? '🏛️' : agent === 'coder' ? '💻' : agent === 'reviewer' ? '🔎' : '🧪'}
                </div>
                <div className="text-[11px] font-medium capitalize text-zinc-300">{agent}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">
                  {isActive ? 'working...' : isDone ? 'done ✓' : 'waiting'}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-auto border-t border-zinc-800 pt-4">
          <p className="text-[11px] text-zinc-500 mb-2">Session summary</p>
          <div className="space-y-1 text-[11px] text-zinc-600">
            <div className="flex justify-between">
              <span>Messages</span>
              <span className="text-zinc-400">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Agents used</span>
              <span className="text-zinc-400">{new Set(messages.filter(m => m.agentType).map(m => m.agentType)).size}/6</span>
            </div>
            <div className="flex justify-between">
              <span>Tool calls</span>
              <span className="text-zinc-400">{messages.filter(m => m.role === 'tool').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
