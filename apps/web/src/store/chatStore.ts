import { create } from 'zustand'
import type { Message, AgentEvent, AgentType } from '@/types'

interface ChatState {
  messages: Message[]
  sessionId: string | null
  isStreaming: boolean
  activeAgent: AgentType | null
  streamingContent: string

  addMessage: (message: Message) => void
  setSessionId: (id: string) => void
  setStreaming: (streaming: boolean) => void
  setActiveAgent: (agent: AgentType | null) => void
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

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setSessionId: (id) => set({ sessionId: id }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setActiveAgent: (agent) => set({ activeAgent: agent }),

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
      activeAgent: null,
    }))
  },

  reset: () =>
    set({
      messages: [],
      sessionId: null,
      isStreaming: false,
      activeAgent: null,
      streamingContent: '',
    }),
}))
