import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-zinc-800 mb-4 font-mono">404</div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Page not found</h1>
        <p className="text-zinc-500 text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Home className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  )
}
