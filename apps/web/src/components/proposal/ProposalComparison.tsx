import { useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Check, X } from 'lucide-react'
import type { ProposalWithVenue } from '#/server/briefs'
import { formatRupees } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { AcceptProposalDialog } from './AcceptProposalDialog'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const priceTypeLabel: Record<string, string> = {
  fixed: 'Fixed',
  starting_from: 'Starting from',
}

const cateringLabel: Record<string, string> = {
  included: 'Included',
  external: 'External',
  addon: 'Add-on',
}

// Higher is better — used to pick the strongest catering offer.
const cateringRank: Record<string, number> = {
  included: 3,
  addon: 2,
  external: 1,
}

interface ComparisonRow {
  label: string
  render: (p: ProposalWithVenue) => ReactNode
  /** Column indices that "win" this row (highlighted). */
  best: Set<number>
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
  ) : (
    <X className="mx-auto h-[18px] w-[18px] text-muted-foreground/40" strokeWidth={1.5} />
  )
}

function buildRows(proposals: ProposalWithVenue[]): ComparisonRow[] {
  const prices = proposals.map((p) => p.totalPrice)
  const minPrice = Math.min(...prices)

  const cateringRanks = proposals.map((p) => cateringRank[p.cateringType ?? ''] ?? 0)
  const maxCatering = Math.max(...cateringRanks, 0)

  const inclCounts = proposals.map((p) => p.inclusions?.length ?? 0)
  const maxIncl = Math.max(...inclCounts, 0)

  const indicesWhere = (pred: (i: number) => boolean) =>
    new Set(proposals.map((_, i) => i).filter(pred))

  const rows: ComparisonRow[] = [
    {
      label: 'Total price',
      render: (p) => (
        <span className="text-[15px] font-medium tabular-nums text-foreground">
          {formatRupees(p.totalPrice)}
          <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-muted-foreground">
            {priceTypeLabel[p.priceType] ?? p.priceType}
          </span>
        </span>
      ),
      best: indicesWhere((i) => prices[i] === minPrice),
    },
    {
      label: 'Catering',
      render: (p) => (
        <span className="text-sm text-foreground">
          {p.cateringType ? cateringLabel[p.cateringType] ?? cap(p.cateringType) : '—'}
        </span>
      ),
      best:
        maxCatering > 0
          ? indicesWhere((i) => cateringRanks[i] === maxCatering)
          : new Set(),
    },
    {
      label: 'Capacity confirmed',
      render: (p) => <BoolCell value={p.capacityConfirmed} />,
      best: indicesWhere((i) => proposals[i]!.capacityConfirmed),
    },
    {
      label: 'Availability confirmed',
      render: (p) => <BoolCell value={p.availabilityConfirmed} />,
      best: indicesWhere((i) => proposals[i]!.availabilityConfirmed),
    },
    {
      label: 'Other inclusions',
      render: (p) =>
        p.inclusions && p.inclusions.length > 0 ? (
          <span className="text-sm text-foreground">
            {p.inclusions.length} item{p.inclusions.length === 1 ? '' : 's'}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
      best: maxIncl > 0 ? indicesWhere((i) => inclCounts[i] === maxIncl) : new Set(),
    },
  ]

  // One row per amenity across all proposals (✓ / ✗).
  const allAmenities = [
    ...new Set(proposals.flatMap((p) => p.amenities ?? [])),
  ].sort()

  for (const amenity of allAmenities) {
    rows.push({
      label: cap(amenity),
      render: (p) => <BoolCell value={(p.amenities ?? []).includes(amenity)} />,
      best: indicesWhere((i) => (proposals[i]!.amenities ?? []).includes(amenity)),
    })
  }

  return rows
}

/** The proposal that wins the most comparison rows gets the "Best match" badge. */
function pickBestIndex(proposals: ProposalWithVenue[], rows: ComparisonRow[]): number {
  const wins = proposals.map((_, i) => rows.filter((row) => row.best.has(i)).length)
  let best = 0
  for (let i = 1; i < wins.length; i++) {
    if (wins[i]! > wins[best]!) best = i
  }
  return best
}

interface ProposalComparisonProps {
  proposals: ProposalWithVenue[]
  briefId: string
  canAccept: boolean
}

export function ProposalComparison({
  proposals,
  briefId,
  canAccept,
}: ProposalComparisonProps) {
  const [acceptTarget, setAcceptTarget] = useState<ProposalWithVenue | null>(null)

  const rows = buildRows(proposals)
  const bestIndex = pickBestIndex(proposals, rows)

  const colHighlight = (i: number) => (i === bestIndex ? 'bg-accent/30' : '')

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-0 hover:bg-transparent">
            <TableHead className="w-[180px] px-5 pb-5 align-bottom" />
            {proposals.map((p, i) => (
              <TableHead
                key={p.id}
                className={`px-5 pb-5 pt-4 text-center align-bottom ${
                  i === bestIndex ? 'rounded-t-2xl bg-accent/30' : ''
                }`}
              >
                {i === bestIndex && (
                  <Badge className="mb-2 rounded-full bg-primary px-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-primary-foreground">
                    Best match
                  </Badge>
                )}
                <Link
                  to="/venue/$venueId"
                  params={{ venueId: p.venueId }}
                  className="inline-flex items-center gap-1 text-[15px] font-medium text-foreground hover:underline"
                >
                  {p.venueName}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
                <div className="font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                  {p.venueCity}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.label}
              className="border-border hover:bg-transparent"
            >
              <TableCell className="px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {row.label}
              </TableCell>
              {proposals.map((p, i) => (
                <TableCell
                  key={p.id}
                  className={`px-5 py-3.5 text-center ${colHighlight(i)}`}
                >
                  {row.render(p)}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Per-proposal actions */}
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell className="px-5 pt-5" />
            {proposals.map((p, i) => (
              <TableCell
                key={p.id}
                className={`px-5 pb-5 pt-5 text-center align-top ${
                  i === bestIndex ? 'rounded-b-2xl bg-accent/30' : ''
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {canAccept && p.status === 'active' && (
                    <Button
                      size="sm"
                      className="w-full rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
                      onClick={() => setAcceptTarget(p)}
                    >
                      Accept
                    </Button>
                  )}
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full rounded-full border-border font-normal transition-colors duration-200 ease-out hover:bg-muted/60"
                  >
                    <Link to="/venue/$venueId" params={{ venueId: p.venueId }}>
                      View profile
                    </Link>
                  </Button>
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>

      {acceptTarget && (
        <AcceptProposalDialog
          proposal={acceptTarget}
          briefId={briefId}
          open={acceptTarget != null}
          onOpenChange={(open) => !open && setAcceptTarget(null)}
        />
      )}
    </div>
  )
}
