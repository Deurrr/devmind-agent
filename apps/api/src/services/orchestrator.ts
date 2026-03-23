import { runPlannerAgent } from '../agents/planner.js'
import { runArchitectAgent } from '../agents/architect.js'
import { runCoderAgent } from '../agents/coder.js'
import { runReviewerAgent } from '../agents/reviewer.js'
import type { AgentEvent, Message } from '../types/index.js'

export async function* runOrchestrator(
  userMessage: string,
  history: Message[]
): AsyncGenerator<AgentEvent> {
  const conversationHistory = history.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // ── 1. Planner ──────────────────────────────────────────────────────────────
  let plannerOutput = ''
  for await (const event of runPlannerAgent(userMessage, conversationHistory)) {
    yield event
    if (event.type === 'token' && event.content) {
      plannerOutput += event.content
    }
  }

  // ── 2. Architect ─────────────────────────────────────────────────────────────
  yield { type: 'agent_handoff', agent: 'architect' }

  let architectOutput = ''
  for await (const event of runArchitectAgent(userMessage, plannerOutput)) {
    yield event
    if (event.type === 'token' && event.content) {
      architectOutput += event.content
    }
  }

  // ── 3. Coder ─────────────────────────────────────────────────────────────────
  yield { type: 'agent_handoff', agent: 'coder' }

  let coderOutput = ''
  for await (const event of runCoderAgent(
    userMessage,
    plannerOutput,
    architectOutput,
    conversationHistory
  )) {
    yield event
    if (event.type === 'token' && event.content) {
      coderOutput += event.content
    }
  }

  // ── 4. Reviewer ──────────────────────────────────────────────────────────────
  yield { type: 'agent_handoff', agent: 'reviewer' }

  for await (const event of runReviewerAgent(userMessage, coderOutput)) {
    yield event
  }
}
