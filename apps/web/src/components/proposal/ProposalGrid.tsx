import type { ProposalWithVenue } from '#/server/briefs'
import { ProposalCard } from './ProposalCard'

interface ProposalGridProps {
  proposals: ProposalWithVenue[]
  briefId: string
  canAccept: boolean
  selectable?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

export function ProposalGrid({
  proposals,
  briefId,
  canAccept,
  selectable = false,
  selectedIds,
  onToggleSelect,
}: ProposalGridProps) {
  // Stack for 1–2 proposals; responsive grid for 3+.
  const grid = proposals.length >= 3
  return (
    <div
      className={
        grid ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
      }
    >
      {proposals.map((p) => (
        <ProposalCard
          key={p.id}
          proposal={p}
          briefId={briefId}
          canAccept={canAccept}
          selectable={selectable}
          selected={selectedIds?.has(p.id) ?? false}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}
