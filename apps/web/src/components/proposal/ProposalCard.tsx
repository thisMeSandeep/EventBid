import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import type { ProposalWithVenue } from '#/server/briefs'
import { Button } from '#/components/ui/button'
import { formatRupees } from '#/lib/format'
import { AcceptProposalDialog } from './AcceptProposalDialog'
import { ProposalDetailDialog } from './ProposalDetailDialog'

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
}

export function ProposalCard({ proposal, briefId, canAccept }: ProposalCardProps) {
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const isLocked = proposal.status === 'locked'
  const isClosed = proposal.status === 'closed'

  return (
    <div
      className={[
        'rounded-lg border p-5',
        isLocked ? 'border-emerald-300 bg-emerald-50/40' : 'border-border',
        isClosed ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            to="/venue/$venueId"
            params={{ venueId: proposal.venueId }}
            className="text-sm font-medium text-foreground hover:underline"
          >
            {proposal.venueName}
          </Link>
          <p className="text-xs text-muted-foreground">{proposal.venueCity}</p>
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
          {proposal.inclusions.map((inc) => (
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

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setDetailOpen(true)}
        >
          View Full Proposal
        </Button>
        {canAccept && proposal.status === 'active' && (
          <Button size="sm" className="flex-1" onClick={() => setAcceptOpen(true)}>
            Accept
          </Button>
        )}
      </div>

      <ProposalDetailDialog
        proposal={proposal}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canAccept={canAccept}
        onAccept={() => {
          setDetailOpen(false)
          setAcceptOpen(true)
        }}
      />

      <AcceptProposalDialog
        proposal={proposal}
        briefId={briefId}
        open={acceptOpen}
        onOpenChange={setAcceptOpen}
      />
    </div>
  )
}
