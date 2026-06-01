import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'
import { briefQuery, proposalsQuery } from '#/server/briefs'

export function useCloseBrief(briefId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.post(`/api/briefs/${briefId}/close`),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: briefQuery(briefId).queryKey }),
        queryClient.invalidateQueries({ queryKey: proposalsQuery(briefId).queryKey }),
        queryClient.invalidateQueries({ queryKey: qk.briefs.list() }),
      ])
      toast.success('Brief closed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to close brief')
    },
  })
}
