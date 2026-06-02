import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  markAllNotificationsRead,
  type NotificationsPage,
} from '#/server/notifications'

// Marks every notification read with an optimistic update across all cached
// notification pages (bell + full list), rolling back on error.
export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const snapshots = queryClient.getQueriesData<NotificationsPage>({
        queryKey: ['notifications'],
      })
      for (const [key, page] of snapshots) {
        if (!page) continue
        queryClient.setQueryData<NotificationsPage>(key, {
          ...page,
          data: page.data.map((n) => ({ ...n, read: true })),
        })
      }
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
