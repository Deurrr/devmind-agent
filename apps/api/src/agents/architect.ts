import { anthropic, MODEL } from '../lib/anthropic.js'
import type { AgentEvent } from '../types/index.js'

const SYSTEM_PROMPT = `You are the Architect agent in a multi-agent AI development system.
Your job is to design the system architecture based on the user's request and the Planner's output.

You MUST include:
1. A brief architecture overview (2-3 sentences)
2. A Mermaid diagram showing the system components and their relationships

Use this exact format for the diagram:
\`\`\`mermaid
graph TD
  ...your diagram here...
\`\`\`

3. A list of the main components/modules and their responsibilities

Keep it focused and practical. Do NOT write implementation code.`

export async function* runArchitectAgent(
  userMessage: string,
  plannerOutput: string
): AsyncGenerator<AgentEvent> {
  yield { type: 'agent_start', agent: 'architect' }

  const userContent = `User request: ${userMessage}\n\nPlanner's analysis:\n${plannerOutput}\n\nDesign the architecture.`

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
      yield { type: 'token', agent: 'architect', content: chunk.delta.text }
    }
  }

  yield { type: 'agent_done', agent: 'architect' }
}
