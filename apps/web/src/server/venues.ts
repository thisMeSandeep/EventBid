import { queryOptions } from '@tanstack/react-query'
import type {
  Brief,
  BriefVenueMatch,
  UpdateVenueDto,
  Venue,
  VenuePhoto,
} from '@eventbid/shared'
import { apiClient, ApiError } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'

export type VenueWithPhotos = Venue & { photos: VenuePhoto[] }

export type FeedMatch = BriefVenueMatch & { brief: Brief }

export interface FeedPage {
  data: FeedMatch[]
  nextCursor: string | null
}

// Returns null when the venue rep hasn't created a profile yet (404).
export const venueMeQuery = queryOptions({
  queryKey: qk.venues.me,
  queryFn: async (): Promise<VenueWithPhotos | null> => {
    try {
      return await apiClient.get<VenueWithPhotos>('/api/venues/me')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  },
})

export const venueByIdQuery = (id: string) =>
  queryOptions({
    queryKey: qk.venues.byId(id),
    queryFn: () => apiClient.get<VenueWithPhotos>(`/api/venues/${id}`),
  })

interface FeedParams {
  cursor?: string
  eventType?: string
}

const EMPTY_FEED: FeedPage = { data: [], nextCursor: null }

export const feedQuery = (params: FeedParams = {}) =>
  queryOptions({
    queryKey: qk.venues.feed(params.cursor, params.eventType),
    queryFn: async (): Promise<FeedPage> => {
      const qs = new URLSearchParams()
      if (params.cursor) qs.set('cursor', params.cursor)
      const s = qs.toString()
      try {
        return await apiClient.get<FeedPage>(`/api/venues/me/feed${s ? `?${s}` : ''}`)
      } catch (err) {
        // A rep who hasn't created a profile yet has no feed — show it empty
        // rather than erroring, so they can go set up their profile.
        if (err instanceof ApiError && err.status === 404) return EMPTY_FEED
        throw err
      }
    },
  })

// Mutation helper — called client-side from a useMutation (Step 24).
export const updateVenue = (body: UpdateVenueDto) =>
  apiClient.put<Venue>('/api/venues/me', body)

// Photo mutation helpers — called client-side (Step 26).
export const uploadVenuePhoto = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return apiClient.upload<Pick<VenuePhoto, 'id' | 'url'>>(
    '/api/venues/me/photos',
    form,
  )
}

export const deleteVenuePhoto = (photoId: string) =>
  apiClient.delete<void>(`/api/venues/me/photos/${photoId}`)
