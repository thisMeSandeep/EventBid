import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '@eventbid/shared'

const LABELS: Record<string, string> = {
  'proposal.received': 'New proposal received',
  'analysis.ready': 'AI analysis is ready',
  'analysis.stale': 'AI analysis is out of date',
  'brief.matched': 'A new brief matches your venue',
  'proposal.accepted': 'Your proposal was accepted',
  'brief.closed': 'A brief was closed',
  'deal.locked': 'Deal locked',
}

export function notificationLabel(type: string): string {
  return LABELS[type] ?? type
}

interface NotificationDropdownProps {
  notifications: Notification[]
  onSelect: (notification: Notification) => void
}

export function NotificationDropdown({
  notifications,
  onSelect,
}: NotificationDropdownProps) {
  return (
    <div>
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">Notifications</p>
      </div>

      {notifications.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          You're all caught up.
        </p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(n)}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-muted/50"
              >
                <span className="text-sm text-foreground">
                  {notificationLabel(n.type)}
                </span>
                {n.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
