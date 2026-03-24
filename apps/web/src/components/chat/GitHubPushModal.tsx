'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  projectId: string
  sessionId: string
  defaultRepoUrl?: string
  onClose: () => void
}

export function GitHubPushModal({ projectId, sessionId, defaultRepoUrl, onClose }: Props) {
  const [token, setToken] = useState('')
  const [repoUrl, setRepoUrl] = useState(defaultRepoUrl ?? '')
  const [prTitle, setPrTitle] = useState('feat: add AI-generated code')
  const [loading, setLoading] = useState(false)
  const [prUrl, setPrUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !repoUrl) return
    setLoading(true)
    try {
      const res = await api.export.pushToGitHub(projectId, sessionId, {
        githubToken: token,
        repoUrl,
        prTitle,
      })
      setPrUrl(res.prUrl)
      toast.success(`PR created with ${res.filesCount} file${res.filesCount !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'GitHub push failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-100">Push to GitHub</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">×</button>
        </div>

        {prUrl ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">🎉</div>
            <p className="text-zinc-300 text-sm">Pull request created successfully!</p>
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              View Pull Request →
            </a>
            <button
              onClick={onClose}
              className="block w-full text-center py-2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">GitHub Personal Access Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                required
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
              />
              <p className="text-[10px] text-zinc-600 mt-1">Needs repo scope. Token is not stored.</p>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Repository URL</label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                required
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">PR Title</label>
              <input
                type="text"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token || !repoUrl}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating PR…
                </>
              ) : (
                'Create Pull Request'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
