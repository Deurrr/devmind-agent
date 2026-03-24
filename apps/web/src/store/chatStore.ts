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
  githubRepoUrl: string | null
  githubToken: string | null

  addMessage: (message: Message) => void
  addToolEvent: (event: AgentEvent) => void
  setSessionId: (id: string) => void
  setStreaming: (streaming: boolean) => void
  setActiveAgent: (agent: AgentType | null) => void
  setAgentStatus: (agent: AgentType, status: AgentStatus) => void
  appendStreamingContent: (content: string) => void
  flushStreamingContent: (agentType: AgentType) => void
  setGithubToken: (token: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: null,
  isStreaming: false,
  activeAgent: null,
  streamingContent: '',
  agentStatuses: { ...INITIAL_STATUSES },
  githubRepoUrl: null,
  githubToken: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  addToolEvent: (event) => {
    if (event.type === 'tool_call' && event.tool && event.agent) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: 'tool' as const,
            content: '',
            agentType: event.agent,
            tool: event.tool,
            toolInput: event.toolInput,
            timestamp: new Date().toISOString(),
          },
        ],
      }))
    } else if (event.type === 'tool_result' && event.tool) {
      if (event.tool === 'github_context') {
        // Extract repo URL for the push-to-github flow
        const result = event.toolResult as { repoUrl?: string } | null
        if (result?.repoUrl) {
          set({ githubRepoUrl: result.repoUrl })
        }
        return
      }
      // Attach result to the last tool_call message for the same tool
      set((state) => {
        const messages = [...state.messages]
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === 'tool' && messages[i].tool === event.tool && !messages[i].toolResult) {
            messages[i] = { ...messages[i], toolResult: event.toolResult }
            break
          }
        }
        return { messages }
      })
    }
  },

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

  setGithubToken: (token) => set({ githubToken: token }),

  reset: () =>
    set({
      messages: [],
      sessionId: null,
      isStreaming: false,
      activeAgent: null,
      streamingContent: '',
      agentStatuses: { ...INITIAL_STATUSES },
      githubRepoUrl: null,
    }),
}))
