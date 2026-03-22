const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('devmind_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error ?? 'Request failed')
  }

  return res.json()
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name?: string }) =>
      request<{ user: import('@/types').User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ user: import('@/types').User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () =>
      request<{ user: import('@/types').User }>('/api/auth/me'),
  },

  projects: {
    list: () =>
      request<{ projects: import('@/types').Project[] }>('/api/projects'),

    create: (data: { title: string; description?: string }) =>
      request<{ project: import('@/types').Project }>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    get: (id: string) =>
      request<{ project: import('@/types').Project }>(`/api/projects/${id}`),

    delete: (id: string) =>
      request<{ success: boolean }>(`/api/projects/${id}`, { method: 'DELETE' }),
  },

  chat: {
    streamMessage: (
      projectId: string,
      message: string,
      sessionId: string | undefined,
      onEvent: (event: import('@/types').AgentEvent) => void,
      onSessionId: (id: string) => void
    ): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        const token = getToken()
        const res = await fetch(`${API_URL}/api/projects/${projectId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message, sessionId }),
        })

        if (!res.ok) {
          reject(new Error('Failed to connect to chat'))
          return
        }

        const sessionIdHeader = res.headers.get('X-Session-Id')
        if (sessionIdHeader) onSessionId(sessionIdHeader)

        const reader = res.body?.getReader()
        if (!reader) {
          reject(new Error('No response body'))
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6))
                onEvent(event)
                if (event.type === 'done') {
                  resolve()
                  return
                }
              } catch {
                // malformed event, skip
              }
            }
          }
        }

        resolve()
      })
    },
  },
}
