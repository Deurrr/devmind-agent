'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  return (
    <header className="h-14 border-b border-white/5 bg-zinc-900/50 backdrop-blur flex items-center px-6 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 mr-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm">
          🧠
        </div>
        <span className="font-bold text-zinc-100 text-sm">DevMind</span>
      </Link>

      <nav className="hidden sm:flex items-center gap-1">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-zinc-400 hover:text-zinc-100 h-8')}
        >
          <LayoutDashboard className="w-4 h-4 mr-1.5" />
          Dashboard
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="text-xs text-zinc-500 hidden sm:block max-w-[120px] truncate">
          {user?.name ?? user?.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-zinc-400 hover:text-zinc-100 h-8"
        >
          <LogOut className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
