import { queryOptions } from '@tanstack/react-query'
import type { Notification } from '@eventbid/shared'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'

export interface NotificationsPage {
  data: Notification[]
  nextCursor: string | null
}

// The backend returns unread notifications, newest first.
export const notificationsListQuery = (cursor?: string) =>
  queryOptions({
    queryKey: qk.notifications.list(cursor),
    queryFn: () =>
      apiClient.get<NotificationsPage>(
        `/api/notifications${cursor ? `?cursor=${cursor}` : ''}`,
      ),
  })

// Mutation helpers — called client-side from useMutation.
export const markNotificationRead = (id: string) =>
  apiClient.patch<{ success: boolean }>(`/api/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  apiClient.patch<{ success: boolean }>('/api/notifications/read-all')
