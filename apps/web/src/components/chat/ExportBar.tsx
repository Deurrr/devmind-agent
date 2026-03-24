'use client'

import { useState } from 'react'
import { GitHubPushModal } from './GitHubPushModal'

interface Props {
  projectId: string
  sessionId: string
  githubRepoUrl?: string | null
}

export function ExportBar({ projectId, sessionId, githubRepoUrl }: Props) {
  const [showModal, setShowModal] = useState(false)

  const handleDownloadZip = () => {
    const token = localStorage.getItem('devmind_token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    // Create a link with auth header workaround: open in new tab, but we need auth
    // Since we can't set headers on a direct link, we'll fetch and create a blob URL
    const url = `${apiUrl}/api/projects/${projectId}/sessions/${sessionId}/export`
    fetch(url, {
      headers: { Authorization: `Bearer ${token ?? ''}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed')
        return res.blob()
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `devmind-${sessionId.slice(0, 8)}.zip`
        a.click()
        URL.revokeObjectURL(blobUrl)
      })
      .catch(() => alert('Export failed. Make sure there are generated files in this session.'))
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5 bg-zinc-900/50">
        <span className="text-[10px] text-zinc-600 font-mono mr-1">export</span>

        <button
          onClick={handleDownloadZip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors border border-white/5"
        >
          <span>⬇</span> Download ZIP
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors border border-white/5"
        >
          <span>🐙</span> Push to GitHub
        </button>

        {githubRepoUrl && (
          <span className="text-[10px] text-zinc-600 font-mono ml-1 truncate max-w-[200px]">
            {githubRepoUrl.replace('https://github.com/', '')}
          </span>
        )}
      </div>

      {showModal && (
        <GitHubPushModal
          projectId={projectId}
          sessionId={sessionId}
          defaultRepoUrl={githubRepoUrl ?? undefined}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
