import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { queryOptions } from '@tanstack/react-query'
import { qk } from '#/lib/query-keys'
import { apiServer } from './_client'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'host' | 'venue_rep'
}

export const fetchMe = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => {
    const cookieHeader = getRequestHeader('cookie')
    if (!cookieHeader) return null
    try {
      return await apiServer<SessionUser>('/auth/me', { cookieHeader })
    } catch {
      return null
    }
  },
)

export const meQuery = queryOptions({
  queryKey: qk.me,
  queryFn: () => fetchMe(),
  staleTime: 60_000,
})
