import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import { briefQuery, proposalsQuery } from '#/server/briefs'
import { ProposalComparison } from '#/components/proposal/ProposalComparison'

export const Route = createFileRoute('/_app/host/briefs/$briefId/compare')({
  validateSearch: z.object({
    ids: z.string().optional().default(''),
  }),
  component: ComparePage,
})

function ComparePage() {
  const { briefId } = Route.useParams()
  const { ids } = Route.useSearch()
  const { data: brief } = useQuery(briefQuery(briefId))
  const { data: proposalsData } = useQuery(proposalsQuery(briefId))

  if (!brief) return null

  const selectedIds = ids.split(',').filter(Boolean)
  const all = proposalsData?.data ?? []
  // Preserve the order proposals appear in, keep only selected ones.
  const proposals = all.filter((p) => selectedIds.includes(p.id))

  return (
    <div className="mt-2">
      <Link
        to="/host/briefs/$briefId"
        params={{ briefId }}
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to brief
      </Link>

      <h1 className="mt-6 font-serif text-[28px] font-normal tracking-[-0.01em] text-foreground">
        Compare proposals
      </h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {proposals.length} proposal{proposals.length === 1 ? '' : 's'} side by side
      </p>

      <div className="mt-8">
        {proposals.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            Select at least two proposals from the brief to compare them.
          </p>
        ) : (
          <ProposalComparison
            proposals={proposals}
            briefId={briefId}
            canAccept={brief.status === 'open'}
          />
        )}
      </div>
    </div>
  )
}
