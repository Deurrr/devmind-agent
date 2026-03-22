import type { AgentEvent, GeneratedFile } from '../types/index.js'

const MOCK_RESPONSE = `Sure! Here's a simple white square in HTML/CSS:

// FILE: index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>White Square</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="square"></div>
</body>
</html>

// FILE: style.css
body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background: #111;
}

.square {
  width: 200px;
  height: 200px;
  background: #ffffff;
}
`

export async function* runCoderAgent(
  userMessage: string,
  _conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<AgentEvent> {
  yield { type: 'agent_start', agent: 'coder' }

  // TODO: replace with real AI call (Anthropic / Groq) when API key is available
  const words = MOCK_RESPONSE.split(' ')
  let fullContent = ''

  for (const word of words) {
    const token = word + ' '
    fullContent += token
    yield { type: 'token', agent: 'coder', content: token }
    await new Promise((r) => setTimeout(r, 30))
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
