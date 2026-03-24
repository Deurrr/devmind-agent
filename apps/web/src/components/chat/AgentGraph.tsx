'use client'

import { useMemo, useCallback } from 'react'
import ReactFlow, {
  Background,
  type Node,
  type Edge,
  type NodeTypes,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { AgentNode } from './AgentNode'
import { useChatStore } from '@/store/chatStore'
import type { AgentType, AgentStatus } from '@/types'

const nodeTypes: NodeTypes = { agentNode: AgentNode }

interface AgentMeta {
  label: string
  icon: string
  color: string
  x: number
  y: number
}

const AGENTS: Record<AgentType, AgentMeta> = {
  researcher: { label: 'Researcher', icon: '🔍', color: 'text-amber-400', x: 0, y: 60 },
  planner: { label: 'Planner', icon: '🗺️', color: 'text-blue-400', x: 160, y: 60 },
  architect: { label: 'Architect', icon: '🏗️', color: 'text-emerald-400', x: 320, y: 0 },
  coder: { label: 'Coder', icon: '💻', color: 'text-violet-400', x: 320, y: 120 },
  reviewer: { label: 'Reviewer', icon: '🔬', color: 'text-rose-400', x: 480, y: 60 },
  tester: { label: 'Tester', icon: '✅', color: 'text-cyan-400', x: 640, y: 60 },
}

const STATIC_EDGES: Edge[] = [
  { id: 're-pl', source: 'researcher', target: 'planner', type: 'smoothstep', style: { stroke: '#52525b' } },
  { id: 'pl-ar', source: 'planner', target: 'architect', type: 'smoothstep', style: { stroke: '#52525b' } },
  { id: 'pl-co', source: 'planner', target: 'coder', type: 'smoothstep', style: { stroke: '#52525b' } },
  { id: 'ar-co', source: 'architect', target: 'coder', type: 'smoothstep', style: { stroke: '#52525b' } },
  { id: 'co-rv', source: 'coder', target: 'reviewer', type: 'smoothstep', style: { stroke: '#52525b' } },
  { id: 'rv-te', source: 'reviewer', target: 'tester', type: 'smoothstep', style: { stroke: '#52525b' } },
]

// Edge pairs that become animated when the source agent is active
const ACTIVE_EDGE_MAP: Record<AgentType, string[]> = {
  researcher: ['re-pl'],
  planner: ['pl-ar', 'pl-co'],
  architect: ['ar-co'],
  coder: ['co-rv'],
  reviewer: ['rv-te'],
  tester: [],
}

function buildNodes(statuses: Record<AgentType, AgentStatus>): Node[] {
  return (Object.entries(AGENTS) as [AgentType, AgentMeta][]).map(([id, meta]) => ({
    id,
    type: 'agentNode',
    position: { x: meta.x, y: meta.y },
    data: {
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
      status: statuses[id],
    },
    draggable: false,
  }))
}

function buildEdges(activeAgent: AgentType | null): Edge[] {
  const activeEdgeIds = activeAgent ? (ACTIVE_EDGE_MAP[activeAgent] ?? []) : []
  return STATIC_EDGES.map((e) =>
    activeEdgeIds.includes(e.id)
      ? { ...e, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }
      : { ...e, animated: false, style: { stroke: '#52525b' } }
  )
}

export function AgentGraph() {
  const { agentStatuses, activeAgent } = useChatStore()

  const initialNodes = useMemo(() => buildNodes(agentStatuses), [])
  const initialEdges = useMemo(() => buildEdges(activeAgent), [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Sync store → graph nodes when statuses change
  useMemo(() => {
    setNodes(buildNodes(agentStatuses))
  }, [agentStatuses, setNodes])

  // Sync active agent → animated edges
  useMemo(() => {
    setEdges(buildEdges(activeAgent))
  }, [activeAgent, setEdges])

  const onInit = useCallback((instance: { fitView: () => void }) => {
    instance.fitView()
  }, [])

  return (
    <div className="w-full h-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}
