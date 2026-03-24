import type Anthropic from '@anthropic-ai/sdk'

/** Claude tool definitions for tool_use API */
export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'brave_search',
    description:
      'Search the web using Brave Search. Use this to find documentation, libraries, APIs, tutorials, or any up-to-date information needed to complete the task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query to look up',
        },
        count: {
          type: 'number',
          description: 'Number of results to return (default 5, max 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'github_list_files',
    description:
      'List files in a GitHub repository at a given path. Use this to understand the structure of a repo before reading specific files.',
    input_schema: {
      type: 'object' as const,
      properties: {
        owner: { type: 'string', description: 'Repository owner (username or org)' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'Directory path to list (default: root "")' },
        token: { type: 'string', description: 'GitHub Personal Access Token' },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'github_read_file',
    description: 'Read the content of a specific file from a GitHub repository.',
    input_schema: {
      type: 'object' as const,
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'File path within the repository' },
        token: { type: 'string', description: 'GitHub Personal Access Token' },
      },
      required: ['owner', 'repo', 'path'],
    },
  },
  {
    name: 'execute_code',
    description:
      'Execute code in an isolated Docker sandbox. Use this to test generated code or run scripts.',
    input_schema: {
      type: 'object' as const,
      properties: {
        code: { type: 'string', description: 'The code to execute' },
        language: {
          type: 'string',
          enum: ['javascript', 'python', 'typescript', 'go'],
          description: 'Programming language',
        },
      },
      required: ['code', 'language'],
    },
  },
]
