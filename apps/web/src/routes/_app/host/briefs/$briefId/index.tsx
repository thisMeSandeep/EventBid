import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { GitCompare, Loader2, Sparkles } from 'lucide-react'
import { analysisQuery, briefQuery, proposalsQuery } from '#/server/briefs'
import { BriefDetailHeader } from '#/components/brief/BriefDetailHeader'
import { BriefSummaryBlock } from '#/components/brief/BriefSummaryBlock'
import { ProposalGrid } from '#/components/proposal/ProposalGrid'
import { AnalysisPanel } from '#/components/analysis/AnalysisPanel'
import { EmptyState } from '#/components/app/EmptyState'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/host/briefs/$briefId/')({
  component: BriefDetailIndex,
})

function BriefDetailIndex() {
  const { briefId } = Route.useParams()
  const navigate = useNavigate()
  const { data: brief } = useQuery(briefQuery(briefId))
  const { data: proposalsData } = useQuery(proposalsQuery(briefId))
  const { data: analysis } = useQuery(analysisQuery(briefId))
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  if (!brief) return null

  const proposals = proposalsData?.data ?? []
  const status = analysis?.status
  const hasAnalysis = status === 'complete' || status === 'stale'

  // Comparison is offered once there are at least two active proposals.
  const activeCount = proposals.filter((p) => p.status === 'active').length
  const canCompare = activeCount >= 2

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div>
      <BriefDetailHeader brief={brief} proposalCount={proposals.length} />
      <div className="mt-6 space-y-8">
        <BriefSummaryBlock brief={brief} />

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Proposals · {proposals.length} received
          </h2>

          {status === 'running' && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analysing…
            </span>
          )}

          {hasAnalysis && (
            <button
              type="button"
              onClick={() => setShowAnalysis((v) => !v)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {showAnalysis ? 'Hide AI analysis' : 'View AI analysis'}
            </button>
          )}
        </div>

        {canCompare && (
          <p className="mt-2 text-[13px] text-muted-foreground">
            Select proposals to compare them side by side.
          </p>
        )}

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
              selectable={canCompare}
              selectedIds={selected}
              onToggleSelect={toggleSelect}
            />
          )}
        </div>

        {showAnalysis && hasAnalysis && analysis && (
          <AnalysisPanel analysis={analysis} proposals={proposals} />
        )}
      </section>

      {/* Sticky compare bar — appears once 2+ proposals are selected. */}
      {selected.size >= 2 && (
        <div className="sticky bottom-4 z-10 flex justify-center">
          <Button
            onClick={() =>
              navigate({
                to: '/host/briefs/$briefId/compare',
                params: { briefId },
                search: { ids: [...selected].join(',') },
              })
            }
            className="rounded-full bg-foreground font-normal text-background shadow-lg transition-colors duration-200 ease-out hover:bg-foreground/90"
          >
            <GitCompare className="h-4 w-4" />
            Compare {selected.size} proposals
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
