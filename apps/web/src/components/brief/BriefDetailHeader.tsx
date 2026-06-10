import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import type { Brief } from '@eventbid/shared'
import { BriefStatusBadge } from './BriefStatusBadge'
import { CloseBriefDialog } from './CloseBriefDialog'
import { DeleteBriefDialog } from './DeleteBriefDialog'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { formatDate } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

interface BriefDetailHeaderProps {
  brief: Brief
  proposalCount: number
}

export function BriefDetailHeader({ brief, proposalCount }: BriefDetailHeaderProps) {
  const [closeOpen, setCloseOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const canDelete = brief.status === 'open' && proposalCount === 0

  return (
    <div>
      <Link
        to="/host/briefs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to briefs
      </Link>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-[32px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground">
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
        <div className="flex items-center gap-2">
          {brief.status === 'open' && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border font-normal transition-colors duration-200 ease-out hover:bg-muted/60"
              onClick={() => setCloseOpen(true)}
            >
              Close brief
            </Button>
          )}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete brief
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <CloseBriefDialog
        briefId={brief.id}
        proposalCount={proposalCount}
        open={closeOpen}
        onOpenChange={setCloseOpen}
      />

      <DeleteBriefDialog
        briefId={brief.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <BriefStatusBadge status={brief.status} />
        <span>
          {proposalCount} proposal{proposalCount === 1 ? '' : 's'}
        </span>
        <span aria-hidden>·</span>
        <span>Deadline {formatDate(brief.deadline)}</span>
      </div>
    </div>
  )
}
