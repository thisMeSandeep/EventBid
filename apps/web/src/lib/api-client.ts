import { env } from './env'

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
      window.dispatchEvent(new CustomEvent('eventbid:unauthorized'))
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
        throw new ApiError(
          res.status,
          body?.error?.code ?? 'UNKNOWN',
          body?.error?.message ?? res.statusText,
        )
      }
      return res.json() as Promise<T>
    }),
}
