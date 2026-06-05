import { Link } from '@tanstack/react-router'
import { ChevronRight, MapPin } from 'lucide-react'
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
      className="group flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-card p-5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.15)] motion-reduce:transform-none"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-foreground">
            {eventTypeLabel(brief.eventType)}
          </span>
          <BriefStatusBadge status={brief.status} />
        </div>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          {formatDate(brief.eventDateFrom)} · {brief.headcount} guests ·{' '}
          {formatBudgetRange(brief.budgetMin, brief.budgetMax)}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          {brief.city}, {brief.state}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right text-[13px] text-muted-foreground sm:block">
          <span className="text-muted-foreground/70">Deadline</span>
          <br />
          {formatDate(brief.deadline)}
        </div>
        <ChevronRight
          className="h-4 w-4 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  )
}
