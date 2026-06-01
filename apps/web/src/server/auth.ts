import { queryOptions } from '@tanstack/react-query'
import { qk } from '#/lib/query-keys'
import { apiClient } from '#/lib/api-client'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'host' | 'venue_rep' | null
}

async function fetchMe(): Promise<SessionUser | null> {
  try {
    return await apiClient.get<SessionUser>('/api/auth/me')
  } catch {
    return null
  }
}

export const meQuery = queryOptions({
  queryKey: qk.me,
  queryFn: fetchMe,
  staleTime: 60_000,
})
