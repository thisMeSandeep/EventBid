import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import {
  briefQuery,
  briefWinGuideQuery,
  regenerateBriefWinGuide,
} from '#/server/briefs'
import { myProposalsForBriefQuery } from '#/server/proposals'
import { qk } from '#/lib/query-keys'
import { BriefSummaryBlock } from '#/components/brief/BriefSummaryBlock'
import { VenueProposalCard } from '#/components/proposal/VenueProposalCard'
import { BriefWinGuideCard } from '#/components/analysis/BriefWinGuideCard'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/venue/briefs/$briefId/')({
  loader: ({ context: { queryClient }, params: { briefId } }) =>
    queryClient.ensureQueryData(myProposalsForBriefQuery(briefId)),
  component: VenueBriefReadPage,
})

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function VenueBriefReadPage() {
  const { briefId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))
  const { data: proposals = [] } = useQuery(myProposalsForBriefQuery(briefId))
  const { data: winGuide } = useQuery(briefWinGuideQuery(briefId))
  const queryClient = useQueryClient()
  const regenerateGuide = useMutation({
    mutationFn: () => regenerateBriefWinGuide(briefId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: qk.briefs.venueAnalysis(briefId),
      }),
  })

  if (!brief) return null

  const isOpen = brief.status === 'open'
  const hasActive = proposals.some((p) => p.status === 'active')

  return (
    <>
      <Link
        to="/venue/proposals"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        My Proposals
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="font-serif text-[28px] font-normal tracking-[-0.01em] text-foreground">
          {cap(brief.eventType)}
        </h1>
        {isOpen && (
          <Button
            asChild
            className="rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
          >
            <Link to="/venue/briefs/$briefId/propose" params={{ briefId }}>
              {hasActive ? 'Revise proposal' : 'Submit a proposal'}
            </Link>
          </Button>
        )}
      </div>

      {/* Brief details */}
      <div className="mt-8">
        <BriefSummaryBlock brief={brief} />
      </div>

      {!isOpen && (
        <p className="mt-4 text-sm text-muted-foreground">
          This brief is no longer accepting proposals.
        </p>
      )}

      {/* AI "how to win" guidance for venues */}
      {isOpen && winGuide && (
        <div className="mt-6">
          <BriefWinGuideCard
            analysis={winGuide}
            onRegenerate={() => regenerateGuide.mutate()}
            isRegenerating={regenerateGuide.isPending}
          />
        </div>
      )}

      {/* The venue rep's own proposals for this brief */}
      <section className="mt-10">
        <h2 className="text-base font-medium text-foreground">
          {proposals.length > 1 ? 'Your proposals' : 'Your proposal'}
        </h2>
        {proposals.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            You haven't submitted a proposal for this brief yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {proposals.map((proposal) => (
              <VenueProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
