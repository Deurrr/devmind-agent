'use client'

import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

const AGENT_COLORS: Record<string, string> = {
  coder: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  planner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  researcher: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  architect: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  reviewer: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  tester: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled || !ref.current) return
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: { background: '#09090b', primaryColor: '#8b5cf6' },
      })
      const id = `mermaid-${Math.random().toString(36).slice(2)}`
      mermaid.render(id, code).then(({ svg }) => {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg
        }
      }).catch(() => {
        if (!cancelled && ref.current) {
          ref.current.textContent = code
        }
      })
    })
    return () => { cancelled = true }
  }, [code])

  return (
    <div
      ref={ref}
      className="my-3 p-4 rounded-lg bg-zinc-900/80 border border-white/10 overflow-x-auto flex justify-center"
    />
  )
}

function renderContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const firstNewline = part.indexOf('\n')
      const language = firstNewline > 3 ? part.slice(3, firstNewline).trim() : 'plaintext'
      const code = firstNewline > -1 ? part.slice(firstNewline + 1, -3) : ''

      if (language === 'mermaid') {
        return <MermaidDiagram key={i} code={code} />
      }

      return (
        <div key={i} className="my-3 rounded-lg overflow-hidden border border-white/10">
          <div className="flex items-center justify-between px-4 py-1.5 bg-white/5 border-b border-white/10">
            <span className="text-xs text-zinc-400 font-mono">{language || 'plaintext'}</span>
          </div>
          <pre className="p-4 overflow-x-auto bg-zinc-950">
            <code className="text-sm font-mono text-zinc-200">{code}</code>
          </pre>
        </div>
      )
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {part}
      </span>
    )
  })
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
          AI
        </div>
      )}

      <div className={cn('max-w-[80%] space-y-1', isUser && 'items-end')}>
        {!isUser && message.agentType && (
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-mono capitalize',
              AGENT_COLORS[message.agentType] ?? ''
            )}
          >
            {message.agentType}
          </Badge>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-violet-600 text-white rounded-tr-sm'
              : 'bg-zinc-800/60 text-zinc-100 rounded-tl-sm border border-white/5'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div>{renderContent(message.content)}</div>
          )}
        </div>

        <p className="text-[10px] text-zinc-600 px-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0 mt-1">
          U
        </div>
      )}
    </div>
  )
}
