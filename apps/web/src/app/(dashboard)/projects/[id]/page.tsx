'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useChatStore } from '@/store/chatStore'
import { api } from '@/lib/api'
import type { Project } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const { reset } = useChatStore()

  useEffect(() => {
    reset()
    api.projects.get(projectId)
      .then(({ project }) => setProject(project))
      .catch(() => {
        toast.error('Project not found')
        router.push('/dashboard')
      })
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex items-center gap-2 px-6 py-2 border-b border-white/5 bg-zinc-900/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="text-zinc-500 hover:text-zinc-200 h-7 px-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Dashboard
        </Button>
        <span className="text-zinc-700 text-xs">/</span>
        <span className="text-xs text-zinc-400">{project.title}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow projectId={project.id} projectTitle={project.title} />
      </div>
    </div>
  )
}
