'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { cn } from '@/lib/utils'
import type { AgentStatus } from '@/types'

interface AgentNodeData {
  label: string
  icon: string
  status: AgentStatus
  color: string
  ringColor: string
}

const statusConfig: Record<AgentStatus, { ring: string; dot: string; text: string }> = {
  idle: {
    ring: 'ring-white/10',
    dot: 'bg-zinc-600',
    text: 'idle',
  },
  thinking: {
    ring: 'ring-violet-500',
    dot: 'bg-violet-400 animate-ping',
    text: 'thinking...',
  },
  done: {
    ring: 'ring-emerald-500',
    dot: 'bg-emerald-400',
    text: 'done',
  },
}

export const AgentNode = memo(({ data }: { data: AgentNodeData }) => {
  const { label, icon, status, color } = data
  const cfg = statusConfig[status]

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-zinc-900 border border-white/10',
        'ring-2 transition-all duration-500 min-w-[90px]',
        cfg.ring,
        status === 'thinking' && 'shadow-lg shadow-violet-500/20'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-700 !border-zinc-600 !w-2 !h-2" />

      <div className="relative">
        <span className="text-xl">{icon}</span>
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full',
            cfg.dot
          )}
        />
      </div>

      <span className={cn('text-xs font-semibold', color)}>{label}</span>
      <span className="text-[9px] text-zinc-600 capitalize">{cfg.text}</span>

      <Handle type="source" position={Position.Right} className="!bg-zinc-700 !border-zinc-600 !w-2 !h-2" />
    </div>
  )
})

AgentNode.displayName = 'AgentNode'
