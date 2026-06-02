import { queryOptions } from '@tanstack/react-query'
import type { Brief, BriefVenueMatch, UpdateVenueDto, Venue } from '@eventbid/shared'
import { apiClient, ApiError } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'

export type FeedMatch = BriefVenueMatch & { brief: Brief }

export interface FeedPage {
  data: FeedMatch[]
  nextCursor: string | null
}

// Returns null when the venue rep hasn't created a profile yet (404).
export const venueMeQuery = queryOptions({
  queryKey: qk.venues.me,
  queryFn: async (): Promise<Venue | null> => {
    try {
      return await apiClient.get<Venue>('/api/venues/me')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  },
})

export const venueByIdQuery = (id: string) =>
  queryOptions({
    queryKey: qk.venues.byId(id),
    queryFn: () => apiClient.get<Venue>(`/api/venues/${id}`),
  })

interface FeedParams {
  cursor?: string
  eventType?: string
}

export const feedQuery = (params: FeedParams = {}) =>
  queryOptions({
    queryKey: qk.venues.feed(params.cursor, params.eventType),
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.cursor) qs.set('cursor', params.cursor)
      const s = qs.toString()
      return apiClient.get<FeedPage>(`/api/venues/me/feed${s ? `?${s}` : ''}`)
    },
  })

// Mutation helper — called client-side from a useMutation (Step 24).
export const updateVenue = (body: UpdateVenueDto) =>
  apiClient.put<Venue>('/api/venues/me', body)
