import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Sparkles } from 'lucide-react'
import { analysisQuery, briefQuery, proposalsQuery } from '#/server/briefs'
import { BriefSummaryBlock } from '#/components/brief/BriefSummaryBlock'
import { ProposalGrid } from '#/components/proposal/ProposalGrid'
import { AnalysisPanel } from '#/components/analysis/AnalysisPanel'
import { EmptyState } from '#/components/app/EmptyState'

export const Route = createFileRoute('/_app/host/briefs/$briefId/')({
  component: BriefDetailIndex,
})

function BriefDetailIndex() {
  const { briefId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))
  const { data: proposalsData } = useQuery(proposalsQuery(briefId))
  const { data: analysis } = useQuery(analysisQuery(briefId))
  const [showAnalysis, setShowAnalysis] = useState(false)

  if (!brief) return null

  const proposals = proposalsData?.data ?? []
  const status = analysis?.status
  const hasAnalysis = status === 'complete' || status === 'stale'

  return (
    <div className="mt-6 space-y-8">
      <BriefSummaryBlock brief={brief} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">
            Proposals ({proposals.length})
          </h2>

          {status === 'running' && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analysing…
            </span>
          )}

          {hasAnalysis && (
            <button
              type="button"
              onClick={() => setShowAnalysis((v) => !v)}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {showAnalysis ? 'Hide AI Analysis' : 'View AI Analysis'}
            </button>
          )}
        </div>

        <div className="mt-4">
          {proposals.length === 0 ? (
            <EmptyState
              title="Waiting for proposals"
              description="Venues matched to this brief will send their proposals here."
            />
          ) : (
            <ProposalGrid
              proposals={proposals}
              briefId={briefId}
              canAccept={brief.status === 'open'}
            />
          )}
        </div>

        {showAnalysis && hasAnalysis && analysis && (
          <AnalysisPanel analysis={analysis} proposals={proposals} />
        )}
      </section>
    </div>
  )
}
