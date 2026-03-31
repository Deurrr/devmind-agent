import { Navbar } from '@/components/layout/Navbar'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 rounded-lg bg-zinc-800 animate-pulse" />
              <div className="h-4 w-64 rounded bg-zinc-800 animate-pulse" />
            </div>
            <div className="h-9 w-32 rounded-lg bg-zinc-800 animate-pulse" />
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
