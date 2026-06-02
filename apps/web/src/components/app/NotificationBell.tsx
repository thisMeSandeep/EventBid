import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import type { Notification } from '@eventbid/shared'
import type { SessionUser } from '#/server/auth'
import { notificationsListQuery } from '#/server/notifications'
import { useMarkRead } from '#/hooks/use-mutations/use-mark-read'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { NotificationDropdown } from './NotificationDropdown'

// Resolves where a notification should take the user, based on their role.
function targetFor(
  n: Notification,
  role: SessionUser['role'],
): Parameters<ReturnType<typeof useRouter>['navigate']>[0] | null {
  if (role === 'host') {
    return n.briefId
      ? { to: '/host/briefs/$briefId', params: { briefId: n.briefId } }
      : null
  }
  // venue_rep
  if (n.type === 'proposal.accepted') return { to: '/venue/proposals' }
  return n.briefId
    ? { to: '/venue/briefs/$briefId', params: { briefId: n.briefId } }
    : null
}

export function NotificationBell({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const markRead = useMarkRead()
  const { data } = useQuery(notificationsListQuery())

  const unread = (data?.data ?? []).filter((n) => !n.read)
  const hasUnread = unread.length > 0
  const recent = unread.slice(0, 5)

  function handleSelect(n: Notification) {
    if (!n.read) markRead.mutate(n.id)
    setOpen(false)
    const target = targetFor(n, user.role)
    if (target) router.navigate(target)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {hasUnread && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <NotificationDropdown notifications={recent} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
}
