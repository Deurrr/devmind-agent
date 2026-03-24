'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { StreamingBubble } from './StreamingBubble'
import { AgentStatusBar } from './AgentStatusBar'
import { InputBar } from './InputBar'
import { ExportBar } from './ExportBar'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import type { AgentEvent } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  projectId: string
  projectTitle: string
}

export function ChatWindow({ projectId, projectTitle }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const {
    messages,
    sessionId,
    isStreaming,
    activeAgent,
    streamingContent,
    githubRepoUrl,
    githubToken,
    addMessage,
    addToolEvent,
    setSessionId,
    setStreaming,
    setActiveAgent,
    setAgentStatus,
    appendStreamingContent,
    flushStreamingContent,
  } = useChatStore()

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streamingContent])

  const handleSend = async (message: string) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to continue')
      return
    }

    addMessage({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    })

    setStreaming(true)

    try {
      await api.chat.streamMessage(
        projectId,
        message,
        sessionId ?? undefined,
        githubToken ?? undefined,
        (event: AgentEvent) => {
          if (event.type === 'agent_start' && event.agent) {
            setActiveAgent(event.agent)
            setAgentStatus(event.agent, 'thinking')
          } else if (event.type === 'token' && event.content) {
            appendStreamingContent(event.content)
          } else if (event.type === 'agent_done' && event.agent) {
            flushStreamingContent(event.agent)
            setAgentStatus(event.agent, 'done')
          } else if (event.type === 'agent_handoff' && event.agent) {
            setActiveAgent(event.agent)
          } else if (event.type === 'tool_call') {
            addToolEvent(event)
          } else if (event.type === 'tool_result') {
            addToolEvent(event)
          } else if (event.type === 'error') {
            toast.error(event.error ?? 'An error occurred')
            setStreaming(false)
            setActiveAgent(null)
          } else if (event.type === 'done') {
            setStreaming(false)
            setActiveAgent(null)
          }
        },
        (id) => setSessionId(id)
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
      setStreaming(false)
      setActiveAgent(null)
    }
  }

  const hasContent = messages.some((m) => m.role === 'assistant')

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-zinc-900/50">
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        <h2 className="font-semibold text-zinc-100 text-sm">{projectTitle}</h2>
        <span className="text-xs text-zinc-600 ml-auto">
          {messages.filter((m) => m.role !== 'tool').length} messages
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isStreaming && activeAgent && streamingContent && (
          <StreamingBubble content={streamingContent} agentType={activeAgent} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Export bar — shown once there is assistant content and a session */}
      {hasContent && sessionId && !isStreaming && (
        <ExportBar
          projectId={projectId}
          sessionId={sessionId}
          githubRepoUrl={githubRepoUrl}
        />
      )}

      <AgentStatusBar activeAgent={activeAgent} isStreaming={isStreaming} />
      <InputBar onSend={handleSend} disabled={isStreaming} />
    </div>
  )
}
