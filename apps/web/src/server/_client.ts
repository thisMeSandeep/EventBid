export interface ApiServerOptions {
  cookieHeader?: string
}

export async function apiServer<T>(
  path: string,
  opts: ApiServerOptions = {},
): Promise<T> {
  const baseUrl =
    process.env['API_URL_INTERNAL'] ?? process.env['VITE_API_URL'] ?? ''

  const headers: Record<string, string> = {}
  if (opts.cookieHeader) {
    headers['cookie'] = opts.cookieHeader
  }

  const res = await fetch(`${baseUrl}${path}`, { headers })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.error?.message ?? res.statusText
    const err = new Error(`[apiServer] ${path} → ${res.status}: ${message}`)
    ;(err as Error & { status: number }).status = res.status
    throw err
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
