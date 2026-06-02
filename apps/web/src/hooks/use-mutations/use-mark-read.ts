import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markNotificationRead, type NotificationsPage } from '#/server/notifications'

// Marks a single notification read with an optimistic update: the row flips to
// read:true across every cached notifications page immediately, rolling back on
// error. The bell dot (which counts unread) clears as soon as the last unread
// is marked.
export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const snapshots = queryClient.getQueriesData<NotificationsPage>({
        queryKey: ['notifications'],
      })
      for (const [key, page] of snapshots) {
        if (!page) continue
        queryClient.setQueryData<NotificationsPage>(key, {
          ...page,
          data: page.data.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
