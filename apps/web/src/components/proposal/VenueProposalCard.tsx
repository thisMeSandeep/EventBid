import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Proposal } from '@eventbid/shared'
import { formatRupees } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const priceTypeLabel: Record<string, string> = {
  fixed: 'fixed',
  starting_from: 'starting from',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-foreground text-background',
  locked: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-muted text-muted-foreground',
  superseded: 'bg-muted text-muted-foreground',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  locked: 'Won',
  closed: 'Closed',
  superseded: 'Superseded',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h4>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function Confirm({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}

export function VenueProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={[
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              STATUS_STYLES[proposal.status] ?? 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {STATUS_LABEL[proposal.status] ?? cap(proposal.status)}
          </span>
          <span className="text-[13px] text-muted-foreground">
            Version {proposal.version}
          </span>
        </div>
        {proposal.createdAt && (
          <span className="text-[13px] text-muted-foreground">
            {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <Section title="Pricing">
          <p className="text-2xl font-semibold text-foreground">
            {formatRupees(proposal.totalPrice)}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {priceTypeLabel[proposal.priceType] ?? proposal.priceType}
            </span>
          </p>
        </Section>

        {proposal.inclusions && proposal.inclusions.length > 0 && (
          <Section title="What's included">
            <ul className="space-y-1.5">
              {proposal.inclusions.map((inc: string) => (
                <li
                  key={inc}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {inc}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {proposal.amenities && proposal.amenities.length > 0 && (
          <Section title="Amenities">
            <div className="flex flex-wrap gap-2">
              {proposal.amenities.map((a: string) => (
                <span
                  key={a}
                  className="rounded-full border border-black/[0.06] bg-muted/60 px-3 py-1 text-[13px] text-foreground"
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
          <div className="space-y-1.5">
            <Confirm ok={proposal.capacityConfirmed} label="Capacity confirmed" />
            <Confirm
              ok={proposal.availabilityConfirmed}
              label="Availability confirmed"
            />
          </div>
        </Section>

        {proposal.notes && (
          <Section title="Notes">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {proposal.notes}
            </p>
          </Section>
        )}
      </div>
    </div>
  )
}
