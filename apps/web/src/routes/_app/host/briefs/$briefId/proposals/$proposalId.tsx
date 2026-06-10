import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import {
  briefQuery,
  proposalAnalysisQuery,
  proposalsQuery,
  regenerateProposalAnalysis,
} from '#/server/briefs'
import { qk } from '#/lib/query-keys'
import { VenueProposalCard } from '#/components/proposal/VenueProposalCard'
import { AcceptProposalDialog } from '#/components/proposal/AcceptProposalDialog'
import { ProposalAnalysisCard } from '#/components/analysis/ProposalAnalysisCard'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute(
  '/_app/host/briefs/$briefId/proposals/$proposalId',
)({
  component: HostProposalDetailPage,
})

function HostProposalDetailPage() {
  const { briefId, proposalId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))
  const { data: proposalsData } = useQuery(proposalsQuery(briefId))
  const { data: analysis } = useQuery(
    proposalAnalysisQuery(briefId, proposalId),
  )
  const queryClient = useQueryClient()
  const regenerate = useMutation({
    mutationFn: () => regenerateProposalAnalysis(briefId, proposalId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: qk.briefs.proposalAnalysis(briefId, proposalId),
      }),
  })
  const [acceptOpen, setAcceptOpen] = useState(false)

  if (!brief) return null

  const proposal = proposalsData?.data.find((p) => p.id === proposalId)

  if (!proposal) {
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
        <p className="mt-8 text-sm text-muted-foreground">Proposal not found.</p>
      </div>
    )
  }

  const canAccept = brief.status === 'open' && proposal.status === 'active'

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

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/venue/$venueId"
            params={{ venueId: proposal.venueId }}
            className="inline-flex items-center gap-1 font-serif text-[32px] font-normal tracking-[-0.01em] text-foreground transition-colors hover:text-foreground/70"
          >
            {proposal.venueName}
            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {proposal.venueCity}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-border font-normal transition-colors duration-200 ease-out hover:bg-muted/60"
          >
            <Link to="/venue/$venueId" params={{ venueId: proposal.venueId }}>
              View venue profile
            </Link>
          </Button>
          {canAccept && (
            <Button
              className="rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
              onClick={() => setAcceptOpen(true)}
            >
              Accept proposal
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <VenueProposalCard proposal={proposal} />
        {analysis && (
          <ProposalAnalysisCard
            analysis={analysis}
            onRegenerate={() => regenerate.mutate()}
            isRegenerating={regenerate.isPending}
          />
        )}
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
