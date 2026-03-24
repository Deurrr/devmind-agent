export interface SearchResult {
  title: string
  url: string
  description: string
}

export async function braveSearch(query: string, count = 5): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY
  if (!apiKey) {
    return [
      {
        title: 'Brave Search not configured',
        url: '',
        description: 'Set BRAVE_API_KEY in environment to enable web search.',
      },
    ]
  }

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
  })

  if (!res.ok) {
    throw new Error(`Brave Search API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as {
    web?: { results?: Array<{ title: string; url: string; description?: string }> }
  }

  return (data.web?.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    description: r.description ?? '',
  }))
}
