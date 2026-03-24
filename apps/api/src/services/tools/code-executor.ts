import { execFile } from 'child_process'
import { promisify } from 'util'
import { mkdtemp, writeFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

const execFileAsync = promisify(execFile)

export interface ExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
}

const LANG_CONFIG: Record<string, { image: string; filename: string; cmd: string[] }> = {
  javascript: { image: 'node:20-alpine', filename: 'script.js', cmd: ['node', '/code/script.js'] },
  typescript: { image: 'node:20-alpine', filename: 'script.ts', cmd: ['npx', 'ts-node', '/code/script.ts'] },
  python: { image: 'python:3.12-alpine', filename: 'script.py', cmd: ['python', '/code/script.py'] },
  go: { image: 'golang:1.22-alpine', filename: 'main.go', cmd: ['go', 'run', '/code/main.go'] },
}

export async function executeCode(
  code: string,
  language: string,
  timeoutMs = 10_000
): Promise<ExecutionResult> {
  const config = LANG_CONFIG[language.toLowerCase()]
  if (!config) {
    return { stdout: '', stderr: `Language "${language}" is not supported for execution.`, exitCode: 1, timedOut: false }
  }

  // Check if Docker is available
  try {
    await execFileAsync('docker', ['info'], { timeout: 3000 })
  } catch {
    return {
      stdout: '',
      stderr: 'Docker is not available in this environment. Code execution skipped.',
      exitCode: 1,
      timedOut: false,
    }
  }

  const tmpDir = await mkdtemp(join(tmpdir(), 'devmind-'))
  const codePath = join(tmpDir, config.filename)

  try {
    await writeFile(codePath, code, 'utf8')

    const { stdout, stderr } = await execFileAsync(
      'docker',
      [
        'run', '--rm',
        '--network', 'none',
        '--memory', '128m',
        '--cpus', '0.5',
        '-v', `${tmpDir}:/code:ro`,
        config.image,
        ...config.cmd,
      ],
      { timeout: timeoutMs }
    )

    return { stdout, stderr, exitCode: 0, timedOut: false }
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; code?: number; killed?: boolean }
    return {
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? (err instanceof Error ? err.message : 'Unknown error'),
      exitCode: error.code ?? 1,
      timedOut: error.killed ?? false,
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
