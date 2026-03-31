'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Something went wrong</h1>
        <p className="text-zinc-500 text-sm mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={reset} className="bg-violet-600 hover:bg-violet-700">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  )
}
