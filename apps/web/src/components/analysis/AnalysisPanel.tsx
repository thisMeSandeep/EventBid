import type { AiAnalysis } from '@eventbid/shared'
import type { ProposalWithVenue } from '#/server/briefs'

type AnalysisEntry = { score: number; summary: string; gaps: string[] }

interface AnalysisPanelProps {
  analysis: AiAnalysis
  proposals: ProposalWithVenue[]
}

export function AnalysisPanel({ analysis, proposals }: AnalysisPanelProps) {
  const results = (analysis.results ?? {}) as Record<string, AnalysisEntry>
  const stale = analysis.status === 'stale'
  const venueName = (id: string) =>
    proposals.find((p) => p.id === id)?.venueName ?? 'Proposal'
  const entries = Object.entries(results).sort((a, b) => b[1].score - a[1].score)

  return (
    <div
      className={[
        'mt-4 rounded-lg border border-border p-5',
        stale ? 'opacity-60' : '',
      ].join(' ')}
    >
      {stale && (
        <p className="mb-3 text-xs font-medium text-amber-700">
          Proposals have changed — this analysis may be out of date.
        </p>
      )}

      <div className="space-y-4">
        {entries.map(([pid, r]) => (
          <div key={pid} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">{venueName(pid)}</h4>
              <span className="text-sm font-semibold text-primary">{r.score}/100</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p>
            {r.gaps.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                {r.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
