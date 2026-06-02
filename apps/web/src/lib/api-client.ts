import { env } from './env'

// Decoupling shim: the API client can't import the router/query client without
// a cycle, so a 401 is published on a tiny event bus. `_app/route.tsx`
// subscribes and performs the cache clear + redirect to /login.
export const UNAUTHORIZED_EVENT = 'eventbid:unauthorized'

function notifyUnauthorized() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const code = body?.error?.code ?? 'UNKNOWN'
    const message = body?.error?.message ?? res.statusText

    if (res.status === 401) {
      notifyUnauthorized()
    }

    throw new ApiError(res.status, code, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  upload: <T>(path: string, form: FormData): Promise<T> =>
    fetch(`${env.VITE_API_URL}${path}`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        if (res.status === 401) notifyUnauthorized()
        throw new ApiError(
          res.status,
          body?.error?.code ?? 'UNKNOWN',
          body?.error?.message ?? res.statusText,
        )
      }
      return res.json() as Promise<T>
    }),
}
