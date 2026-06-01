import { queryOptions } from '@tanstack/react-query'
import type { AiAnalysis, Brief, Proposal } from '@eventbid/shared'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'

export type ProposalWithVenue = Proposal & {
  venueName: string
  venueCity: string
  venueEmail: string | null
  venuePhone: string | null
}

export interface BriefsPage {
  data: Brief[]
  nextCursor: string | null
}

interface BriefsListParams {
  cursor?: string
  status?: string
}

function briefsListPath({ cursor, status }: BriefsListParams): string {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  if (status) params.set('status', status)
  const qs = params.toString()
  return qs ? `/api/briefs?${qs}` : '/api/briefs'
}

export const briefsListQuery = (params: BriefsListParams = {}) =>
  queryOptions({
    queryKey: qk.briefs.list(params.cursor, params.status),
    queryFn: () => apiClient.get<BriefsPage>(briefsListPath(params)),
  })

export const briefQuery = (id: string) =>
  queryOptions({
    queryKey: qk.briefs.detail(id),
    queryFn: () => apiClient.get<Brief>(`/api/briefs/${id}`),
  })

export const proposalsQuery = (briefId: string) =>
  queryOptions({
    queryKey: qk.briefs.proposals(briefId),
    queryFn: () =>
      apiClient.get<{ data: ProposalWithVenue[] }>(
        `/api/briefs/${briefId}/proposals`,
      ),
  })

export const analysisQuery = (briefId: string) =>
  queryOptions({
    queryKey: qk.briefs.analysis(briefId),
    queryFn: () =>
      apiClient.get<AiAnalysis>(`/api/briefs/${briefId}/analysis`),
  })
