import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient, ApiError } from '#/lib/api-client'
import { briefQuery, proposalsQuery } from '#/server/briefs'

export function useAcceptProposal(briefId: string) {
  const queryClient = useQueryClient()

  const reconcile = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: briefQuery(briefId).queryKey }),
      queryClient.invalidateQueries({ queryKey: proposalsQuery(briefId).queryKey }),
    ])

  return useMutation({
    mutationFn: (proposalId: string) =>
      apiClient.post(`/api/briefs/${briefId}/proposals/${proposalId}/accept`),
    onSuccess: async () => {
      await reconcile()
      toast.success('Proposal accepted')
    },
    onError: async (err) => {
      // Lost the race — the brief was already closed. Reconcile so the UI catches up.
      if (err instanceof ApiError && err.code === 'DEAL_LOCK_FAILED') {
        toast.error('This brief was just closed — refreshing the latest state.')
        await reconcile()
        return
      }
      toast.error(err instanceof Error ? err.message : 'Failed to accept proposal')
    },
  })
}
