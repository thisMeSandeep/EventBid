import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '@eventbid/shared'
import { meQuery } from '#/server/auth'
import { notificationsAllQuery } from '#/server/notifications'
import { useMarkRead } from '#/hooks/use-mutations/use-mark-read'
import { useMarkAllRead } from '#/hooks/use-mutations/use-mark-all-read'
import { notificationLabel } from '#/components/app/NotificationDropdown'
import { targetFor } from '#/components/app/NotificationBell'
import { EmptyState } from '#/components/app/EmptyState'
import { Button } from '#/components/ui/button'

const searchSchema = z.object({
  cursor: z.string().optional(),
})

export const Route = createFileRoute('/_app/notifications')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ cursor: search.cursor }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(notificationsAllQuery(deps.cursor)),
  component: NotificationsPage,
})

function NotificationsPage() {
  const { cursor } = Route.useSearch()
  const router = useRouter()
  const { data: user } = useQuery(meQuery)
  const { data } = useQuery(notificationsAllQuery(cursor))
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const notifications = data?.data ?? []
  const hasUnread = notifications.some((n) => !n.read)
  const role = user?.role ?? null

  function handleSelect(n: Notification) {
    if (!n.read) markRead.mutate(n.id)
    if (role) {
      const target = targetFor(n, role)
      if (target) router.navigate(target)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-4">
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="Updates about your briefs and proposals will show up here."
          />
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(n)}
                  className={[
                    'flex w-full flex-col items-start gap-1 rounded-r py-3 pr-4 text-left transition-colors duration-150',
                    n.read
                      ? 'pl-6 hover:bg-muted/30'
                      : 'border-l-2 border-primary bg-muted/30 pl-4',
                  ].join(' ')}
                >
                  <span className="flex w-full items-center gap-2">
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {notificationLabel(n.type)}
                    </span>
                  </span>
                  {n.createdAt && (
                    <span className="pl-4 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
