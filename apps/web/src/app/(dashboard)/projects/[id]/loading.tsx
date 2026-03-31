export default function ProjectLoading() {
  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      {/* Navbar skeleton */}
      <div className="h-14 border-b border-white/5 bg-zinc-900/50 flex items-center px-6 gap-4 shrink-0">
        <div className="h-7 w-7 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />
        <div className="ml-auto h-4 w-32 rounded bg-zinc-800 animate-pulse" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area skeleton */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse shrink-0" />
              <div className={`h-16 rounded-xl bg-zinc-900 animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-72'}`} />
            </div>
          ))}

          {/* Input skeleton */}
          <div className="mt-auto h-12 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
        </div>

        {/* Agent graph skeleton */}
        <div className="hidden lg:block w-80 border-l border-zinc-800 bg-zinc-900/30 p-4">
          <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
