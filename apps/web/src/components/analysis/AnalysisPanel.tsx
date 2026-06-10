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
    <div className={['mt-4 rounded-xl border border-border bg-card', stale ? 'opacity-70' : ''].join(' ')}>
      <p className="border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        AI analysis · ranked by match
      </p>

      {stale && (
        <p className="border-b border-border bg-accent/40 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-foreground">
          Proposals have changed — this analysis may be out of date
        </p>
      )}

      <div>
        {entries.map(([pid, r], i) => (
          <div key={pid} className="border-b border-border px-5 py-4 last:border-0">
            <div className="flex items-center justify-between gap-3">
              <p className="flex min-w-0 items-baseline gap-2.5">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="truncate text-[15px] font-medium text-foreground">
                  {venueName(pid)}
                </span>
              </p>
              <span
                className={[
                  'shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.04em]',
                  i === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground',
                ].join(' ')}
              >
                {r.score}/100
              </span>
            </div>
            <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{r.summary}</p>
            {r.gaps.length > 0 && (
              <div className="mt-3 border-l-2 border-primary py-0.5 pl-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {r.gaps.length === 1 ? 'Gap flagged' : `${r.gaps.length} gaps flagged`}
                </p>
                <ul className="mt-1 space-y-1 text-[13px] leading-[1.6] text-foreground">
                  {r.gaps.map((g, gi) => (
                    <li key={gi}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
