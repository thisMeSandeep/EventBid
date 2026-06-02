import { queryOptions } from '@tanstack/react-query'
import type { Notification } from '@eventbid/shared'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'

export interface NotificationsPage {
  data: Notification[]
  nextCursor: string | null
}

// Unread notifications, newest first — drives the bell.
export const notificationsListQuery = (cursor?: string) =>
  queryOptions({
    queryKey: qk.notifications.list(cursor),
    queryFn: () =>
      apiClient.get<NotificationsPage>(
        `/api/notifications${cursor ? `?cursor=${cursor}` : ''}`,
      ),
  })

// Full list (read + unread) for the notifications page.
export const notificationsAllQuery = (cursor?: string) =>
  queryOptions({
    queryKey: qk.notifications.all(cursor),
    queryFn: () => {
      const qs = new URLSearchParams({ all: 'true' })
      if (cursor) qs.set('cursor', cursor)
      return apiClient.get<NotificationsPage>(`/api/notifications?${qs.toString()}`)
    },
  })

// Mutation helpers — called client-side from useMutation.
export const markNotificationRead = (id: string) =>
  apiClient.patch<{ success: boolean }>(`/api/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  apiClient.patch<{ success: boolean }>('/api/notifications/read-all')
