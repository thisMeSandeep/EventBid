import { Link } from '@tanstack/react-router'
import type { FeedMatch } from '#/server/venues'
import { formatBudgetRange, formatDate } from '#/lib/format'
import { MatchScoreDots } from './MatchScoreDots'

const eventTypeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

function deadlineLabel(deadline: string | Date): string {
  const end = typeof deadline === 'string' ? new Date(deadline) : deadline
  const days = Math.ceil((end.getTime() - Date.now()) / 86_400_000)
  if (days < 0) return 'Closed'
  if (days === 0) return 'Today'
  return `${days} day${days === 1 ? '' : 's'}`
}

export function FeedRow({ match }: { match: FeedMatch }) {
  const { brief } = match

  return (
    <Link
      to="/venue/briefs/$briefId"
      params={{ briefId: brief.id }}
      className="block border-b border-border py-4 transition-colors duration-150 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-medium text-foreground">
          {eventTypeLabel(brief.eventType)}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          Deadline: {deadlineLabel(brief.deadline)}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatDate(brief.eventDateFrom)} · {brief.headcount} guests ·{' '}
        {formatBudgetRange(brief.budgetMin, brief.budgetMax)}
      </p>
      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{brief.city}</span>
        <span>·</span>
        <MatchScoreDots score={match.matchScore} />
      </div>
    </Link>
  )
}
