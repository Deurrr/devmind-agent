import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Code2,
  GitBranch,
  Globe,
  Play,
  Search,
  Shield,
  Sparkles,
  TestTube,
  Zap,
} from 'lucide-react'

const agents = [
  {
    icon: '🗺️',
    name: 'Planner',
    color: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/30',
    description: 'Breaks your request into subtasks and coordinates the team.',
  },
  {
    icon: '🔍',
    name: 'Researcher',
    color: 'from-blue-500 to-cyan-600',
    border: 'border-blue-500/30',
    description: 'Searches documentation, libraries, and the web for context.',
  },
  {
    icon: '🏛️',
    name: 'Architect',
    color: 'from-indigo-500 to-blue-600',
    border: 'border-indigo-500/30',
    description: 'Designs system architecture and generates visual diagrams.',
  },
  {
    icon: '💻',
    name: 'Coder',
    color: 'from-emerald-500 to-green-600',
    border: 'border-emerald-500/30',
    description: 'Writes the actual source code files, step by step.',
  },
  {
    icon: '🔎',
    name: 'Reviewer',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    description: 'Reviews code for security, performance, and best practices.',
  },
  {
    icon: '🧪',
    name: 'Tester',
    color: 'from-rose-500 to-pink-600',
    border: 'border-rose-500/30',
    description: 'Writes unit and integration tests automatically.',
  },
]

const features = [
  {
    icon: Zap,
    title: 'Real-time streaming',
    description: 'Watch agents think and write as it happens — token by token.',
  },
  {
    icon: GitBranch,
    title: 'Visual agent graph',
    description: 'See which agents are active and how they communicate live.',
  },
  {
    icon: Globe,
    title: 'Web search',
    description: 'Agents search the web for up-to-date docs and solutions.',
  },
  {
    icon: Code2,
    title: 'GitHub integration',
    description: 'Read repos, write code, create branches, and open PRs.',
  },
  {
    icon: TestTube,
    title: 'Code execution sandbox',
    description: 'Agents run and verify code in an isolated Docker container.',
  },
  {
    icon: Shield,
    title: 'Export & deploy',
    description: 'Download as ZIP or push directly to GitHub with one click.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-white/5 bg-zinc-950/80 backdrop-blur flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm">
            🧠
          </div>
          <span className="font-bold text-zinc-100">DevMind</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400 mr-8">
          <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
          <a href="#agents" className="hover:text-zinc-100 transition-colors">Agents</a>
          <Link href="/demo" className="hover:text-zinc-100 transition-colors">Demo</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Badge variant="outline" className="border-violet-500/40 text-violet-400 mb-6 text-xs px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Powered by Claude claude-sonnet-4-6
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Your AI dev team,<br />ready to ship.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe what you want to build. A team of specialized AI agents will plan,
            research, design, code, review, and test it — in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-base px-8">
                Start building for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-zinc-700 hover:border-zinc-600 text-zinc-300 text-base px-8">
                <Play className="w-4 h-4 mr-2" />
                Watch demo
              </Button>
            </Link>
          </div>

          <p className="text-xs text-zinc-600 mt-6">No credit card required · Free during beta</p>
        </div>
      </section>

      {/* Demo Video */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden aspect-video flex items-center justify-center group cursor-pointer">
          {/* Gradient overlay top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto group-hover:bg-violet-600/30 transition-colors">
              <Play className="w-6 h-6 text-violet-400 ml-1" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium">See DevMind in action</p>
              <p className="text-zinc-600 text-sm mt-1">Watch 6 agents build a REST API from scratch</p>
            </div>
          </div>

          {/* Corner labels showing agent names */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-zinc-800/80 text-zinc-400 border-zinc-700 text-[10px]">Planner → Researcher → Architect</Badge>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Badge className="bg-zinc-800/80 text-zinc-400 border-zinc-700 text-[10px]">Coder → Reviewer → Tester</Badge>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Meet the team
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Six specialized agents, each with a role — working together like a real engineering team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className={`rounded-xl border ${agent.border} bg-zinc-900/60 p-5 hover:bg-zinc-900 transition-colors`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-lg mb-3`}>
                  {agent.icon}
                </div>
                <h3 className="font-semibold text-zinc-100 mb-1">{agent.name}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 pb-24 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Built for real work
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Not just a chatbot. Real tool use, real GitHub integration, real code execution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-200 mb-1 text-sm">{f.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">How it works</h2>
          <p className="text-zinc-400 mb-12">Three steps from idea to working code.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Describe your idea', desc: 'Type what you want to build in plain English. No templates needed.' },
              { step: '02', title: 'Agents get to work', desc: 'Watch them plan, research, design, code, and test in real time on the agent graph.' },
              { step: '03', title: 'Export & ship', desc: 'Download the code as a ZIP or push a PR directly to your GitHub repo.' },
            ].map((item) => (
              <div key={item.step} className="text-left">
                <div className="text-4xl font-bold text-violet-500/30 mb-3 font-mono">{item.step}</div>
                <h3 className="font-semibold text-zinc-200 mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center rounded-2xl border border-violet-500/20 bg-violet-600/5 p-12">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl mx-auto mb-6">
            🧠
          </div>
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">Ready to ship faster?</h2>
          <p className="text-zinc-400 mb-8">
            Join developers using DevMind to build features in minutes, not hours.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-base px-10">
              Get started free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs">
              🧠
            </div>
            <span>DevMind — Built by Josue Rueda</span>
          </div>
          <div className="flex gap-6">
            <Link href="/demo" className="hover:text-zinc-400 transition-colors">Demo</Link>
            <a href="https://github.com/Deurrr/devmind-agent" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">GitHub</a>
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
