'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AgentType } from '@/types'

const AGENT_COLORS: Record<string, string> = {
  coder: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  planner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  researcher: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  architect: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  reviewer: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  tester: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

interface Props {
  content: string
  agentType: AgentType
}

export function StreamingBubble({ content, agentType }: Props) {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1 animate-pulse">
        AI
      </div>

      <div className="max-w-[80%] space-y-1">
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] font-mono capitalize',
            AGENT_COLORS[agentType] ?? ''
          )}
        >
          {agentType}
          <span className="ml-1 animate-pulse">●</span>
        </Badge>

        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-zinc-800/60 text-zinc-100 border border-white/5">
          <span className="whitespace-pre-wrap">{content}</span>
          <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-middle" />
        </div>
      </div>
    </div>
  )
}
