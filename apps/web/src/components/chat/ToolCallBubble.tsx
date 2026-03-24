'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

const TOOL_ICONS: Record<string, string> = {
  brave_search: '🔍',
  github_list_files: '📁',
  github_read_file: '📄',
  execute_code: '⚡',
}

const TOOL_LABELS: Record<string, string> = {
  brave_search: 'Web Search',
  github_list_files: 'List Repo Files',
  github_read_file: 'Read File',
  execute_code: 'Execute Code',
}

interface Props {
  message: Message
}

export function ToolCallBubble({ message }: Props) {
  const [expanded, setExpanded] = useState(false)
  const tool = message.tool ?? 'unknown'
  const icon = TOOL_ICONS[tool] ?? '🔧'
  const label = TOOL_LABELS[tool] ?? tool
  const hasResult = message.toolResult !== undefined

  const inputSummary = getInputSummary(tool, message.toolInput ?? {})

  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 shrink-0 mt-1" /> {/* spacer to align with agent bubbles */}

      <div className="max-w-[80%]">
        <button
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono',
            'border transition-colors cursor-pointer w-full text-left',
            hasResult
              ? 'bg-zinc-900/80 border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
              : 'bg-amber-950/30 border-amber-700/30 text-amber-400/80 animate-pulse'
          )}
        >
          <span className="text-base leading-none">{icon}</span>
          <span className="text-zinc-500">{label}</span>
          <span className="text-zinc-600 truncate flex-1">{inputSummary}</span>
          {hasResult && (
            <span className="text-zinc-600 ml-auto shrink-0">{expanded ? '▲' : '▼'}</span>
          )}
          {!hasResult && <span className="text-amber-500/60 ml-auto shrink-0 text-[10px]">running…</span>}
        </button>

        {expanded && hasResult && (
          <div className="mt-1 rounded-xl border border-zinc-700/40 bg-zinc-950 overflow-hidden">
            <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 text-[10px] text-zinc-500 font-mono">
              result
            </div>
            <pre className="p-3 text-[11px] text-zinc-300 font-mono overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
              {formatResult(message.toolResult)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

function getInputSummary(tool: string, input: Record<string, unknown>): string {
  if (tool === 'brave_search') return `"${input.query ?? ''}"`
  if (tool === 'github_list_files') return `${input.owner}/${input.repo}${input.path ? `/${input.path}` : ''}`
  if (tool === 'github_read_file') return `${input.owner}/${input.repo}/${input.path}`
  if (tool === 'execute_code') return `${input.language ?? 'code'}`
  return JSON.stringify(input).slice(0, 60)
}

function formatResult(result: unknown): string {
  if (result === null || result === undefined) return 'null'
  if (typeof result === 'string') return result
  return JSON.stringify(result, null, 2)
}
