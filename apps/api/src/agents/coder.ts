import Anthropic from '@anthropic-ai/sdk'
import { anthropic, MODEL } from '../lib/anthropic.js'
import type { AgentEvent, GeneratedFile } from '../types/index.js'

const SYSTEM_PROMPT = `You are the Coder agent in a multi-agent AI development system.
Your job is to write the actual implementation code based on the plan and architecture provided.

Rules:
- Write complete, working code — no placeholders or TODOs
- Use this format for each file:
  // FILE: path/to/filename.ext
  <file content here>
- Separate multiple files clearly
- Include all necessary imports
- Write clean, idiomatic code for the chosen language/framework`

export async function* runCoderAgent(
  userMessage: string,
  plannerOutput: string,
  architectOutput: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<AgentEvent> {
  yield { type: 'agent_start', agent: 'coder' }

  const userContent = `User request: ${userMessage}

Planner's plan:
${plannerOutput}

Architect's design:
${architectOutput}

Now implement the code.`

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent },
  ]

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
  })

  let fullContent = ''

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      fullContent += chunk.delta.text
      yield { type: 'token', agent: 'coder', content: chunk.delta.text }
    }
  }

  const files = parseGeneratedFiles(fullContent)
  if (files.length > 0) {
    yield { type: 'tool_result', agent: 'coder', toolResult: files }
  }

  yield { type: 'agent_done', agent: 'coder' }
}

function parseGeneratedFiles(content: string): GeneratedFile[] {
  const files: GeneratedFile[] = []
  const filePattern = /\/\/\s*FILE:\s*(.+)\n([\s\S]*?)(?=\/\/\s*FILE:|$)/g
  let match

  while ((match = filePattern.exec(content)) !== null) {
    const filename = match[1].trim()
    const fileContent = match[2].trim()
    const language = getLanguageFromFilename(filename)
    files.push({ filename, content: fileContent, language })
  }

  return files
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    css: 'css',
    html: 'html',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
  }
  return map[ext] ?? 'plaintext'
}
