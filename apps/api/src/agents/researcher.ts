import Anthropic from '@anthropic-ai/sdk'
import { anthropic, MODEL } from '../lib/anthropic.js'
import { braveSearch } from '../services/tools/brave-search.js'
import { listRepoFiles, readRepoFile } from '../services/tools/github.js'
import { executeCode } from '../services/tools/code-executor.js'
import { TOOL_DEFINITIONS } from '../services/tools/index.js'
import type { AgentEvent } from '../types/index.js'

const SYSTEM_PROMPT = `You are the Researcher agent in a multi-agent AI development system.
Your job is to gather relevant context and information before the other agents begin their work.

You have access to:
- brave_search: Search the web for documentation, libraries, examples, and best practices
- github_list_files: Explore a GitHub repository's structure
- github_read_file: Read specific files from a GitHub repository
- execute_code: Run code in an isolated sandbox to test or verify behavior

Use your tools to gather exactly the context needed. Be focused — only search for what is directly relevant to the task.
After gathering information, write a concise Research Summary that other agents will use as context.`

type ToolInput = {
  query?: string
  count?: number
  owner?: string
  repo?: string
  path?: string
  token?: string
  code?: string
  language?: string
}

export async function* runResearcherAgent(
  userMessage: string,
  githubToken?: string
): AsyncGenerator<AgentEvent> {
  yield { type: 'agent_start', agent: 'researcher' }

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ]

  // Inject GitHub token into tool inputs if available
  const systemWithToken = githubToken
    ? `${SYSTEM_PROMPT}\n\nA GitHub token is available for repository access.`
    : SYSTEM_PROMPT

  let continueLoop = true

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemWithToken,
      tools: TOOL_DEFINITIONS,
      messages,
    })

    // Stream text content tokens
    for (const block of response.content) {
      if (block.type === 'text') {
        // Emit text in chunks to simulate streaming
        const words = block.text.split(' ')
        for (const word of words) {
          yield { type: 'token', agent: 'researcher', content: word + ' ' }
        }
      }
    }

    if (response.stop_reason === 'end_turn') {
      continueLoop = false
      break
    }

    if (response.stop_reason !== 'tool_use') {
      continueLoop = false
      break
    }

    // Process tool calls
    const toolResults: Anthropic.ToolResultBlockParam[] = []

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue

      const input = block.input as ToolInput

      yield {
        type: 'tool_call',
        agent: 'researcher',
        tool: block.name,
        toolInput: input as Record<string, unknown>,
      }

      let result: unknown
      try {
        if (block.name === 'brave_search') {
          result = await braveSearch(input.query ?? '', input.count ?? 5)
        } else if (block.name === 'github_list_files') {
          const token = input.token ?? githubToken ?? ''
          result = await listRepoFiles(token, input.owner ?? '', input.repo ?? '', input.path ?? '')
        } else if (block.name === 'github_read_file') {
          const token = input.token ?? githubToken ?? ''
          result = await readRepoFile(token, input.owner ?? '', input.repo ?? '', input.path ?? '')
        } else if (block.name === 'execute_code') {
          result = await executeCode(input.code ?? '', input.language ?? 'javascript')
        } else {
          result = { error: `Unknown tool: ${block.name}` }
        }
      } catch (err) {
        result = { error: err instanceof Error ? err.message : 'Tool execution failed' }
      }

      yield {
        type: 'tool_result',
        agent: 'researcher',
        tool: block.name,
        toolResult: result,
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      })
    }

    // Add assistant response + tool results to conversation
    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })
  }

  yield { type: 'agent_done', agent: 'researcher' }
}
