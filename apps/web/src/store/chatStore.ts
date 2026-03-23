import { create } from 'zustand'
import type { Message, AgentEvent, AgentType, AgentStatus } from '@/types'

const INITIAL_STATUSES: Record<AgentType, AgentStatus> = {
  planner: 'idle',
  researcher: 'idle',
  architect: 'idle',
  coder: 'idle',
  reviewer: 'idle',
  tester: 'idle',
}

interface ChatState {
  messages: Message[]
  sessionId: string | null
  isStreaming: boolean
  activeAgent: AgentType | null
  streamingContent: string
  agentStatuses: Record<AgentType, AgentStatus>

  addMessage: (message: Message) => void
  setSessionId: (id: string) => void
  setStreaming: (streaming: boolean) => void
  setActiveAgent: (agent: AgentType | null) => void
  setAgentStatus: (agent: AgentType, status: AgentStatus) => void
  appendStreamingContent: (content: string) => void
  flushStreamingContent: (agentType: AgentType) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: null,
  isStreaming: false,
  activeAgent: null,
  streamingContent: '',
  agentStatuses: { ...INITIAL_STATUSES },

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setSessionId: (id) => set({ sessionId: id }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setActiveAgent: (agent) => set({ activeAgent: agent }),

  setAgentStatus: (agent, status) =>
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [agent]: status },
    })),

  appendStreamingContent: (content) =>
    set((state) => ({ streamingContent: state.streamingContent + content })),

  flushStreamingContent: (agentType) => {
    const { streamingContent } = get()
    if (!streamingContent) return
    set((state) => ({
      messages: [
        ...state.messages,
        {
          role: 'assistant',
          content: streamingContent,
          agentType,
          timestamp: new Date().toISOString(),
        },
      ],
      streamingContent: '',
    }))
  },

  reset: () =>
    set({
      messages: [],
      sessionId: null,
      isStreaming: false,
      activeAgent: null,
      streamingContent: '',
      agentStatuses: { ...INITIAL_STATUSES },
    }),
}))
