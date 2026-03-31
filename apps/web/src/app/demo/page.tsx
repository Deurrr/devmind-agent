import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { DemoChat } from './DemoChat'

export const metadata = {
  title: 'DevMind — Live Demo',
  description: 'See 6 AI agents collaborate to build a REST API in real time.',
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-white/5 bg-zinc-900/50 backdrop-blur flex items-center px-4 sm:px-6 shrink-0 gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs">
            🧠
          </div>
          <span className="font-bold text-zinc-100 text-sm hidden sm:block">DevMind</span>
        </Link>

        <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] ml-1">
          Demo mode
        </Badge>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500 hidden sm:block">Read-only preview</span>
          <Link href="/register">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs h-8">
              Try it yourself
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-violet-950/40 border-b border-violet-500/20 px-4 py-2 text-center">
        <p className="text-xs text-violet-300">
          This is a pre-recorded demo conversation. No agents are running live.{' '}
          <Link href="/register" className="underline hover:text-violet-100">
            Sign up free
          </Link>{' '}
          to run real agents.
        </p>
      </div>

      {/* Chat demo */}
      <div className="flex-1 overflow-hidden">
        <DemoChat />
      </div>

      {/* CTA footer */}
      <div className="border-t border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Ready to ship with AI agents?</p>
            <p className="text-xs text-zinc-500">Free during beta — no credit card required.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                <ArrowLeft className="w-3 h-3 mr-1.5" />
                Back
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                Get started free
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
