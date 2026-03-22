'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import type { Project } from '@/types'
import { Plus, Folder, Trash2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '' })

  useEffect(() => {
    api.projects.list()
      .then(({ projects }) => setProjects(projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProject.title.trim()) return
    setCreating(true)
    try {
      const { project } = await api.projects.create(newProject)
      setProjects([project, ...projects])
      setNewProject({ title: '', description: '' })
      setShowForm(false)
      toast.success('Project created!')
      router.push(`/projects/${project.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project? This cannot be undone.')) return
    try {
      await api.projects.delete(id)
      setProjects(projects.filter((p) => p.id !== id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">
                Welcome back, {user?.name?.split(' ')[0] ?? 'developer'} 👋
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Your AI-powered development workspace
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* New Project Form */}
          {showForm && (
            <Card className="bg-zinc-900 border-zinc-800 border-violet-500/30">
              <CardHeader>
                <CardTitle className="text-zinc-100 text-base">New Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-3">
                  <Input
                    placeholder="Project title (e.g. REST API for user auth)"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating} className="bg-violet-600 hover:bg-violet-700">
                      {creating ? 'Creating...' : 'Create & Open'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-zinc-400">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-zinc-900 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-3xl mb-4">
                🧠
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">No projects yet</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Create your first project and let the agents get to work.
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="bg-zinc-900 border-zinc-800 hover:border-violet-500/40 cursor-pointer transition-colors group"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-violet-400 shrink-0" />
                        <CardTitle className="text-zinc-100 text-sm font-semibold line-clamp-1">
                          {project.title}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(project.id, e)}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    {project.description && (
                      <CardDescription className="text-zinc-500 text-xs line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">
                          {project._count?.sessions ?? 0} sessions
                        </Badge>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
