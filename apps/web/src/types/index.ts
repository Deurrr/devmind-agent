export interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  _count?: { sessions: number }
}

export interface Message {
  role: 'user' | 'assistant' | 'tool'
  content: string
  agentType?: AgentType
  timestamp: string
  // populated when role === 'tool'
  tool?: string
  toolInput?: Record<string, unknown>
  toolResult?: unknown
}

export type AgentType =
  | 'planner'
  | 'researcher'
  | 'architect'
  | 'coder'
  | 'reviewer'
  | 'tester'

export type AgentStatus = 'idle' | 'thinking' | 'done'

export interface AgentEvent {
  type:
    | 'agent_start'
    | 'agent_thinking'
    | 'token'
    | 'agent_done'
    | 'agent_handoff'
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

export interface GeneratedFile {
  filename: string
  content: string
  language: string
}

export interface Session {
  id: string
  projectId: string
  messages: Message[]
  agentLog: AgentEvent[]
  createdAt: string
  updatedAt: string
  generatedFiles?: GeneratedFile[]
}
