import { Link } from '@tanstack/react-router'
import type { Brief } from '@eventbid/shared'
import { BriefStatusBadge } from './BriefStatusBadge'
import { formatBudgetRange, formatDate } from '#/lib/format'

interface BriefListRowProps {
  brief: Brief
}

const eventTypeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export function BriefListRow({ brief }: BriefListRowProps) {
  return (
    <Link
      to="/host/briefs/$briefId"
      params={{ briefId: brief.id }}
      className="block border-b border-border py-4 transition-colors duration-150 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {eventTypeLabel(brief.eventType)}
            </span>
            <BriefStatusBadge status={brief.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(brief.eventDateFrom)} · {brief.headcount} guests ·{' '}
            {formatBudgetRange(brief.budgetMin, brief.budgetMax)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {brief.city}, {brief.state}
          </p>
        </div>
        <div className="shrink-0 text-right text-xs text-muted-foreground">
          Deadline {formatDate(brief.deadline)}
        </div>
      </div>
    </Link>
  )
}
