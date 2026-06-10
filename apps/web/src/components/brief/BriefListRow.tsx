import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
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
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors duration-200 ease-out hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="text-[16px] font-medium text-foreground">
            {eventTypeLabel(brief.eventType)}
          </span>
          <BriefStatusBadge status={brief.status} />
        </div>
        <p className="mt-2 truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {formatDate(brief.eventDateFrom)} · {brief.headcount} guests ·{' '}
          {formatBudgetRange(brief.budgetMin, brief.budgetMax)} · {brief.city}, {brief.state}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
            Deadline
          </p>
          <p className="mt-0.5 font-mono text-[12px] text-foreground">
            {formatDate(brief.deadline)}
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  )
}
