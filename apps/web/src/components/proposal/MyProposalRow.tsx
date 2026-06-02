import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ProposalWithBrief } from '#/server/proposals'
import { formatRupees } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const priceTypeLabel: Record<string, string> = {
  fixed: 'fixed',
  starting_from: 'starting from',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-accent text-accent-foreground',
  locked: 'bg-primary/15 text-primary',
  closed: 'bg-muted text-muted-foreground',
  superseded: 'bg-muted text-muted-foreground',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  locked: 'Locked',
  closed: 'Closed',
  superseded: 'Superseded',
}

function deadlineLine(p: ProposalWithBrief): string {
  if (p.status === 'locked') return 'You won this brief'
  if (p.status === 'closed') return 'Another venue was selected'
  if (p.status === 'superseded') return 'Revised — superseded by a newer version'

  const end = new Date(p.briefDeadline)
  const days = Math.ceil((end.getTime() - Date.now()) / 86_400_000)
  if (days < 0) return 'Brief deadline passed'
  if (days === 0) return 'Brief deadline: today'
  return `Brief deadline: ${days} day${days === 1 ? '' : 's'} left`
}

export function MyProposalRow({ proposal }: { proposal: ProposalWithBrief }) {
  return (
    <Link
      to="/venue/briefs/$briefId"
      params={{ briefId: proposal.briefId }}
      className="block border-b border-border py-4 transition-colors duration-150 hover:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          {cap(proposal.briefEventType)} · {proposal.briefCity}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={[
              'rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_STYLES[proposal.status] ?? 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {STATUS_LABEL[proposal.status] ?? cap(proposal.status)}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatRupees(proposal.totalPrice)}{' '}
        {priceTypeLabel[proposal.priceType] ?? proposal.priceType}
        {proposal.createdAt && (
          <>
            {' · '}
            Submitted{' '}
            {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
          </>
        )}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{deadlineLine(proposal)}</p>
    </Link>
  )
}
