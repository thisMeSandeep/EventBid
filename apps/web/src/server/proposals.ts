import { queryOptions } from '@tanstack/react-query'
import type { CreateProposalDto, Proposal, ReviseProposalDto } from '@eventbid/shared'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'

export type ProposalWithBrief = Proposal & {
  briefEventType: string
  briefCity: string
  briefDeadline: string
  briefStatus: string
}

export interface ProposalsPage {
  data: ProposalWithBrief[]
  nextCursor: string | null
}

interface MyProposalsParams {
  cursor?: string
  status?: string
}

export const myProposalsQuery = (params: MyProposalsParams = {}) =>
  queryOptions({
    queryKey: qk.venues.proposals(params.cursor, params.status),
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.cursor) qs.set('cursor', params.cursor)
      const s = qs.toString()
      return apiClient.get<ProposalsPage>(
        `/api/venues/me/proposals${s ? `?${s}` : ''}`,
      )
    },
  })

// Mutation helpers — called client-side from useMutation (Step 28).
export const submitProposal = (briefId: string, body: CreateProposalDto) =>
  apiClient.post<Proposal>(`/api/briefs/${briefId}/proposals`, body)

export const reviseProposal = (
  briefId: string,
  proposalId: string,
  body: ReviseProposalDto,
) => apiClient.patch<Proposal>(`/api/briefs/${briefId}/proposals/${proposalId}`, body)
