import { Octokit } from '@octokit/rest'

export interface RepoFile {
  path: string
  content: string
  sha?: string
}

export interface RepoBranch {
  name: string
  sha: string
}

function makeOctokit(token: string) {
  return new Octokit({ auth: token })
}

/** Parse "https://github.com/owner/repo" → { owner, repo } */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

/** List files at a path in a repo (non-recursive for large repos) */
export async function listRepoFiles(
  token: string,
  owner: string,
  repo: string,
  path = '',
  ref = 'HEAD'
): Promise<string[]> {
  const octokit = makeOctokit(token)
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref })
  if (!Array.isArray(data)) return []
  return data.map((f) => f.path)
}

/** Read a single file from GitHub */
export async function readRepoFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref = 'HEAD'
): Promise<RepoFile> {
  const octokit = makeOctokit(token)
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref })
  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`${path} is not a file`)
  }
  const content = Buffer.from(data.content, 'base64').toString('utf8')
  return { path: data.path, content, sha: data.sha }
}

/** Get default branch and its HEAD SHA */
export async function getDefaultBranch(
  token: string,
  owner: string,
  repo: string
): Promise<RepoBranch> {
  const octokit = makeOctokit(token)
  const { data: repoData } = await octokit.repos.get({ owner, repo })
  const branch = repoData.default_branch
  const { data: branchData } = await octokit.repos.getBranch({ owner, repo, branch })
  return { name: branch, sha: branchData.commit.sha }
}

/** Create a new branch from a base SHA */
export async function createBranch(
  token: string,
  owner: string,
  repo: string,
  branchName: string,
  baseSha: string
): Promise<void> {
  const octokit = makeOctokit(token)
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  })
}

/** Commit multiple files to a branch */
export async function commitFiles(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: RepoFile[],
  message: string
): Promise<void> {
  const octokit = makeOctokit(token)
  for (const file of files) {
    const contentBase64 = Buffer.from(file.content).toString('base64')
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: file.path,
      message,
      content: contentBase64,
      branch,
      ...(file.sha ? { sha: file.sha } : {}),
    })
  }
}

/** Open a pull request */
export async function createPullRequest(
  token: string,
  owner: string,
  repo: string,
  head: string,
  base: string,
  title: string,
  body: string
): Promise<string> {
  const octokit = makeOctokit(token)
  const { data } = await octokit.pulls.create({ owner, repo, head, base, title, body })
  return data.html_url
}
