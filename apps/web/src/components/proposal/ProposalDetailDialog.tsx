import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import type { ProposalWithVenue } from '#/server/briefs'
import { Button } from '#/components/ui/button'
import { formatRupees } from '#/lib/format'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

const priceTypeLabel: Record<string, string> = {
  total: 'total',
  per_plate: 'per plate',
  per_person: 'per person',
  per_day: 'per day',
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

interface ProposalDetailDialogProps {
  proposal: ProposalWithVenue
  open: boolean
  onOpenChange: (open: boolean) => void
  canAccept: boolean
  onAccept: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

function Confirm({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}

export function ProposalDetailDialog({
  proposal,
  open,
  onOpenChange,
  canAccept,
  onAccept,
}: ProposalDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          {/* Becomes a link to the public venue page in Step 25. */}
          <DialogTitle>{proposal.venueName}</DialogTitle>
          <DialogDescription>{proposal.venueCity}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Section title="Pricing">
            <p className="text-xl font-semibold text-foreground">
              {formatRupees(proposal.totalPrice)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {priceTypeLabel[proposal.priceType] ?? proposal.priceType}
              </span>
            </p>
          </Section>

          {proposal.inclusions && proposal.inclusions.length > 0 && (
            <Section title="What's included">
              <ul className="space-y-1">
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
            </Section>
          )}

          {proposal.amenities && proposal.amenities.length > 0 && (
            <Section title="Amenities">
              <div className="flex flex-wrap gap-2">
                {proposal.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-accent/60 px-2.5 py-0.5 text-xs text-accent-foreground"
                  >
                    {cap(a)}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {proposal.cateringType && (
            <Section title="Catering">
              <p className="text-sm text-foreground">{cap(proposal.cateringType)}</p>
            </Section>
          )}

          <Section title="Confirmations">
            <div className="space-y-1">
              <Confirm ok={proposal.capacityConfirmed} label="Capacity confirmed" />
              <Confirm
                ok={proposal.availabilityConfirmed}
                label="Availability confirmed"
              />
            </div>
          </Section>

          {proposal.notes && (
            <Section title="Notes">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {proposal.notes}
              </p>
            </Section>
          )}
        </div>

        {canAccept && proposal.status === 'active' && (
          <DialogFooter>
            <Button onClick={onAccept}>Accept proposal</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
