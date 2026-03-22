export interface JwtPayload {
  userId: string
  email: string
}

export interface AgentEvent {
  type:
    | 'agent_start'
    | 'agent_thinking'
    | 'token'
    | 'agent_done'
    | 'tool_call'
    | 'tool_result'
    | 'error'
    | 'done'
  agent?: AgentType
  content?: string
  tool?: string
  toolInput?: Record<string, unknown>
  toolResult?: unknown
  error?: string
}

export type AgentType =
  | 'planner'
  | 'researcher'
  | 'architect'
  | 'coder'
  | 'reviewer'
  | 'tester'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  agentType?: AgentType
  timestamp: string
}

export interface GeneratedFile {
  filename: string
  content: string
  language: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload
  }
}
