import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { Brief } from '@eventbid/shared'
import { BriefStatusBadge } from './BriefStatusBadge'
import { CloseBriefDialog } from './CloseBriefDialog'
import { Button } from '#/components/ui/button'
import { formatDate } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

interface BriefDetailHeaderProps {
  brief: Brief
  proposalCount: number
}

export function BriefDetailHeader({ brief, proposalCount }: BriefDetailHeaderProps) {
  const [closeOpen, setCloseOpen] = useState(false)

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
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">
            {cap(brief.eventType)} in {brief.city}
          </h1>
          {brief.status === 'open' && (
            <Link
              to="/host/briefs/$briefId/edit"
              params={{ briefId: brief.id }}
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Edit
            </Link>
          )}
        </div>
        {brief.status === 'open' && (
          <Button variant="outline" size="sm" onClick={() => setCloseOpen(true)}>
            Close Brief
          </Button>
        )}
      </div>

      <CloseBriefDialog
        briefId={brief.id}
        proposalCount={proposalCount}
        open={closeOpen}
        onOpenChange={setCloseOpen}
      />

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
