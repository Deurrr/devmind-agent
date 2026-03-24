import { runPlannerAgent } from '../agents/planner.js'
import { runArchitectAgent } from '../agents/architect.js'
import { runCoderAgent } from '../agents/coder.js'
import { runReviewerAgent } from '../agents/reviewer.js'
import { runResearcherAgent } from '../agents/researcher.js'
import { parseGitHubUrl } from './tools/github.js'
import type { AgentEvent, Message } from '../types/index.js'

/** Returns true if the message likely needs web research */
function needsResearch(message: string): boolean {
  const lower = message.toLowerCase()
  const keywords = [
    'search', 'find', 'look up', 'latest', 'current version',
    'documentation', 'docs for', 'how to use', 'best library',
    'trending', 'npm package', 'pip install',
  ]
  return keywords.some((k) => lower.includes(k))
}

/** Extracts a GitHub repo URL from a message, if present */
function extractGitHubUrl(message: string): string | null {
  const match = message.match(/https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/i)
  return match ? match[0] : null
}

/** Build a research prompt that includes GitHub context if present */
function buildResearchPrompt(userMessage: string, githubUrl: string | null): string {
  if (githubUrl) {
    const parsed = parseGitHubUrl(githubUrl)
    if (parsed) {
      return `${userMessage}

The user is working with this GitHub repository: ${githubUrl}
Owner: ${parsed.owner}, Repo: ${parsed.repo}

Please:
1. List the root files of the repository to understand its structure
2. Read the most important files (README, package.json, main entry point, etc.)
3. Summarize what the repo does and its key technology choices`
    }
  }
  return userMessage
}

export async function* runOrchestrator(
  userMessage: string,
  history: Message[],
  githubToken?: string
): AsyncGenerator<AgentEvent> {
  const conversationHistory = history.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const githubUrl = extractGitHubUrl(userMessage)
  const shouldResearch = githubUrl !== null || needsResearch(userMessage)

  let researchContext = ''

  // ── 0. Researcher (conditional) ─────────────────────────────────────────────
  if (shouldResearch) {
    yield { type: 'agent_handoff', agent: 'researcher' }

    const researchPrompt = buildResearchPrompt(userMessage, githubUrl)

    for await (const event of runResearcherAgent(researchPrompt, githubToken)) {
      yield event
      if (event.type === 'token' && event.content) {
        researchContext += event.content
      }
    }
  }

  // ── 1. Planner ──────────────────────────────────────────────────────────────
  yield { type: 'agent_handoff', agent: 'planner' }

  const plannerMessage = researchContext
    ? `${userMessage}\n\n---\nResearch Context:\n${researchContext}`
    : userMessage

  let plannerOutput = ''
  for await (const event of runPlannerAgent(plannerMessage, conversationHistory)) {
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

  // Emit GitHub context so the client can offer "Push to GitHub"
  if (githubUrl) {
    yield { type: 'tool_result', agent: 'coder', tool: 'github_context', toolResult: { repoUrl: githubUrl } }
  }
}
