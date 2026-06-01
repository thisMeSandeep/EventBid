import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'

export function useDeleteBrief(briefId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => apiClient.delete(`/api/briefs/${briefId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.briefs.list() })
      toast.success('Brief deleted')
      navigate({ to: '/host/briefs' })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete brief')
    },
  })
}
