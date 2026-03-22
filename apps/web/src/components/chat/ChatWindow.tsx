'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { StreamingBubble } from './StreamingBubble'
import { AgentStatusBar } from './AgentStatusBar'
import { InputBar } from './InputBar'
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
  const {
    messages,
    sessionId,
    isStreaming,
    activeAgent,
    streamingContent,
    addMessage,
    setSessionId,
    setStreaming,
    setActiveAgent,
    appendStreamingContent,
    flushStreamingContent,
  } = useChatStore()

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    setActiveAgent('coder')

    try {
      await api.chat.streamMessage(
        projectId,
        message,
        sessionId ?? undefined,
        (event: AgentEvent) => {
          if (event.type === 'agent_start' && event.agent) {
            setActiveAgent(event.agent)
          } else if (event.type === 'token' && event.content) {
            appendStreamingContent(event.content)
          } else if (event.type === 'agent_done' && event.agent) {
            flushStreamingContent(event.agent)
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

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-zinc-900/50">
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        <h2 className="font-semibold text-zinc-100 text-sm">{projectTitle}</h2>
        <span className="text-xs text-zinc-600 ml-auto">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl mb-4">
                💻
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                Ready to build
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Describe what you want to build and the Coder agent will generate
                production-quality code for you.
              </p>
            </div>
          )}

          {messages.map((message, i) => (
            <MessageBubble key={i} message={message} />
          ))}

          {isStreaming && streamingContent && activeAgent && (
            <StreamingBubble content={streamingContent} agentType={activeAgent} />
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Status bar */}
      <AgentStatusBar activeAgent={activeAgent} isStreaming={isStreaming} />

      {/* Input */}
      <InputBar onSend={handleSend} disabled={isStreaming} />
    </div>
  )
}
