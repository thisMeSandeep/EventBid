import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { Brief } from '@eventbid/shared'
import { BriefStatusBadge } from './BriefStatusBadge'
import { Button } from '#/components/ui/button'
import { formatDate } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

interface BriefDetailHeaderProps {
  brief: Brief
  proposalCount: number
}

export function BriefDetailHeader({ brief, proposalCount }: BriefDetailHeaderProps) {
  return (
    <div>
      <Link
        to="/host/briefs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to briefs
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">
          {cap(brief.eventType)} in {brief.city}
        </h1>
        {brief.status === 'open' && (
          // Wired in Step 18.
          <Button variant="outline" size="sm">
            Close Brief
          </Button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <BriefStatusBadge status={brief.status} />
        <span>·</span>
        <span>
          {proposalCount} proposal{proposalCount === 1 ? '' : 's'}
        </span>
        <span>·</span>
        <span>Deadline {formatDate(brief.deadline)}</span>
      </div>
    </div>
  )
}
