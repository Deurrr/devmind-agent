import type Anthropic from '@anthropic-ai/sdk'
import { anthropic, MODEL } from '../lib/anthropic.js'
import type { AgentEvent } from '../types/index.js'

const SYSTEM_PROMPT = `You are the Planner agent in a multi-agent AI development system.
Your job is to analyze the user's request and produce a clear, structured implementation plan.

Output a concise plan with:
1. A brief summary of what will be built
2. A numbered list of implementation steps
3. Key technical decisions (language, framework, patterns)

Be specific and actionable. Keep it under 300 words. Do NOT write code.`

export async function* runPlannerAgent(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<AgentEvent> {
  yield { type: 'agent_start', agent: 'planner' }

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ]

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield { type: 'token', agent: 'planner', content: chunk.delta.text }
    }
  }

  yield { type: 'agent_done', agent: 'planner' }
}
