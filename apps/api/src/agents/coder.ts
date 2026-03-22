import Anthropic from '@anthropic-ai/sdk'
import type { AgentEvent, GeneratedFile } from '../types/index.js'

const client = new Anthropic()

const CODER_SYSTEM_PROMPT = `You are an expert software engineer and code generator. Your job is to write clean, production-quality code based on the user's request.

Guidelines:
- Write complete, working code — no placeholders or TODOs unless absolutely necessary
- Use TypeScript when possible
- Follow best practices for the chosen language/framework
- Structure code in multiple files when appropriate
- Include brief inline comments only where logic is non-obvious
- When generating multiple files, clearly separate them with a header comment like: // FILE: path/to/filename.ts

Always respond with actual code, not just explanations. Be direct and thorough.`

export async function* runCoderAgent(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<AgentEvent> {
  yield { type: 'agent_start', agent: 'coder' }

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8096,
    system: CODER_SYSTEM_PROMPT,
    messages,
  })

  let fullContent = ''

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      fullContent += event.delta.text
      yield { type: 'token', agent: 'coder', content: event.delta.text }
    }
  }

  // Parse generated files from the response
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
