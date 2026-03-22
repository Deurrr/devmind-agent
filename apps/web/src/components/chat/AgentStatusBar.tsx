'use client'

import type { AgentType } from '@/types'
import { cn } from '@/lib/utils'

const AGENT_INFO: Record<AgentType, { label: string; icon: string; color: string }> = {
  planner: { label: 'Planner', icon: '🗺️', color: 'text-blue-400' },
  researcher: { label: 'Researcher', icon: '🔍', color: 'text-amber-400' },
  architect: { label: 'Architect', icon: '🏗️', color: 'text-emerald-400' },
  coder: { label: 'Coder', icon: '💻', color: 'text-violet-400' },
  reviewer: { label: 'Reviewer', icon: '🔬', color: 'text-rose-400' },
  tester: { label: 'Tester', icon: '✅', color: 'text-cyan-400' },
}

interface Props {
  activeAgent: AgentType | null
  isStreaming: boolean
}

export function AgentStatusBar({ activeAgent, isStreaming }: Props) {
  if (!isStreaming) return null

  const info = activeAgent ? AGENT_INFO[activeAgent] : null

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border-t border-white/5 text-xs text-zinc-400">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
      {info ? (
        <span>
          <span className={cn('font-medium', info.color)}>
            {info.icon} {info.label}
          </span>
          {' '}is working...
        </span>
      ) : (
        <span>Thinking...</span>
      )}
    </div>
  )
}
