import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Check } from 'lucide-react'
import type { ProposalWithVenue } from '#/server/briefs'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { formatRupees } from '#/lib/format'
import { AcceptProposalDialog } from './AcceptProposalDialog'

const priceTypeLabel: Record<string, string> = {
  total: 'total',
  per_plate: 'per plate',
  per_person: 'per person',
  per_day: 'per day',
}

interface ProposalCardProps {
  proposal: ProposalWithVenue
  briefId: string
  /** True when the brief is still open (i.e. a proposal can be accepted). */
  canAccept: boolean
  /** When true, an active proposal shows a checkbox for compare selection. */
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

export function ProposalCard({
  proposal,
  briefId,
  canAccept,
  selectable = false,
  selected = false,
  onToggleSelect,
}: ProposalCardProps) {
  const [acceptOpen, setAcceptOpen] = useState(false)
  const isLocked = proposal.status === 'locked'
  const isClosed = proposal.status === 'closed'
  const showCheckbox = selectable && proposal.status === 'active'

  return (
    <div
      className={[
        'rounded-lg border p-5 transition-colors',
        isLocked ? 'border-emerald-300 bg-emerald-50/40' : 'border-border',
        selected ? 'border-foreground/30 bg-muted/30' : '',
        isClosed ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          {showCheckbox && (
            <Checkbox
              className="mt-0.5"
              checked={selected}
              onCheckedChange={() => onToggleSelect?.(proposal.id)}
              aria-label={`Select ${proposal.venueName} to compare`}
            />
          )}
          <div>
          <Link
            to="/venue/$venueId"
            params={{ venueId: proposal.venueId }}
            className="group inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
          >
            {proposal.venueName}
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </Link>
          <p className="text-xs text-muted-foreground">{proposal.venueCity}</p>
          </div>
        </div>
        {isLocked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
            <Check className="h-3 w-3" />
            Accepted
          </span>
        )}
        {isClosed && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Closed
          </span>
        )}
      </div>

      <p className="mt-3 text-xl font-semibold text-foreground">
        {formatRupees(proposal.totalPrice)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          {priceTypeLabel[proposal.priceType] ?? proposal.priceType}
        </span>
      </p>

      {proposal.inclusions && proposal.inclusions.length > 0 && (
        <ul className="mt-3 space-y-1">
          {proposal.inclusions.map((inc: string) => (
            <li
              key={inc}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {inc}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {canAccept && proposal.status === 'active' && (
          <Button
            size="sm"
            className="w-full rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
            onClick={() => setAcceptOpen(true)}
          >
            Accept
          </Button>
        )}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full rounded-full border-black/[0.06] font-normal transition-colors duration-200 ease-out hover:bg-muted/60"
        >
          <Link
            to="/host/briefs/$briefId/proposals/$proposalId"
            params={{ briefId, proposalId: proposal.id }}
          >
            View full proposal
          </Link>
        </Button>
      </div>

      <AcceptProposalDialog
        proposal={proposal}
        briefId={briefId}
        open={acceptOpen}
        onOpenChange={setAcceptOpen}
      />
    </div>
  )
}
