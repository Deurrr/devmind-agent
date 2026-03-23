import { anthropic, MODEL } from '../lib/anthropic.js'
import type { AgentEvent } from '../types/index.js'

const SYSTEM_PROMPT = `You are the Reviewer agent in a multi-agent AI development system.
Your job is to review the generated code and provide constructive feedback.

Your review should cover:
1. **Correctness** — does the code do what was asked?
2. **Code quality** — clean, readable, follows best practices?
3. **Potential issues** — edge cases, error handling, security?
4. **Improvements** — 2-3 specific suggestions to make it better

Keep the review concise (under 250 words). Be direct and actionable.
End with a summary verdict: ✅ Good to go / ⚠️ Minor improvements needed / ❌ Needs rework`

export async function* runReviewerAgent(
  userMessage: string,
  coderOutput: string
): AsyncGenerator<AgentEvent> {
  yield { type: 'agent_start', agent: 'reviewer' }

  const userContent = `Original request: ${userMessage}

Generated code:
${coderOutput}

Please review the code.`

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield { type: 'token', agent: 'reviewer', content: chunk.delta.text }
    }
  }

  yield { type: 'agent_done', agent: 'reviewer' }
}
