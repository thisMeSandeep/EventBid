import { Check } from 'lucide-react'
import type { ProposalWithVenue } from '#/server/briefs'
import { Button } from '#/components/ui/button'
import { formatRupees } from '#/lib/format'

const priceTypeLabel: Record<string, string> = {
  total: 'total',
  per_plate: 'per plate',
  per_person: 'per person',
  per_day: 'per day',
}

export function ProposalCard({ proposal }: { proposal: ProposalWithVenue }) {
  return (
    <div className="rounded-lg border border-border p-5">
      <h3 className="text-sm font-medium text-foreground">{proposal.venueName}</h3>
      <p className="text-xs text-muted-foreground">{proposal.venueCity}</p>

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

      {/* Opens the full-view modal in Step 19. */}
      <Button variant="outline" size="sm" className="mt-4 w-full">
        View Full Proposal
      </Button>
    </div>
  )
}
