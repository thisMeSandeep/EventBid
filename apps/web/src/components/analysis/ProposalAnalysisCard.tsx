import { Loader2, RefreshCw } from 'lucide-react'
import type { ProposalAnalysis, ProposalSubScores } from '@eventbid/shared'

const SUB_SCORE_LABELS: Record<keyof ProposalSubScores, string> = {
  budgetFit: 'Budget fit',
  inclusionsMatch: 'Inclusions match',
  briefAlignment: 'Brief alignment',
}

function RegenerateButton({
  onClick,
  busy,
}: {
  onClick: () => void
  busy: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
      Regenerate
    </button>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <p className="border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        AI analysis
      </p>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

interface ProposalAnalysisCardProps {
  analysis: ProposalAnalysis
  onRegenerate?: () => void
  isRegenerating?: boolean
}

export function ProposalAnalysisCard({
  analysis,
  onRegenerate,
  isRegenerating = false,
}: ProposalAnalysisCardProps) {
  if (analysis.status === 'failed') {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">
          Analysis couldn't be generated for this proposal.
        </p>
        {onRegenerate && (
          <div className="mt-3">
            <RegenerateButton onClick={onRegenerate} busy={isRegenerating} />
          </div>
        )}
      </Shell>
    )
  }

  if (analysis.status !== 'complete') {
    return (
      <Shell>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating analysis…
        </p>
      </Shell>
    )
  }

  const score = analysis.score ?? 0
  const subScores = (analysis.subScores ?? {}) as Partial<ProposalSubScores>
  const gaps = (analysis.gaps ?? []) as string[]

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          AI analysis
        </p>
        <div className="flex items-center gap-4">
          {onRegenerate && (
            <RegenerateButton onClick={onRegenerate} busy={isRegenerating} />
          )}
          <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] text-primary-foreground">
            {score}% match
          </span>
        </div>
      </div>

      <div className="space-y-5 px-5 py-6">
        {(Object.keys(SUB_SCORE_LABELS) as Array<keyof ProposalSubScores>).map(
          (key) => {
            const value = subScores[key] ?? 0
            return (
              <div key={key}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {SUB_SCORE_LABELS[key]}
                  </span>
                  <span className="text-[13px] font-medium tabular-nums text-foreground">
                    {value}%
                  </span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-border">
                  <div className="h-1 rounded-full bg-primary" style={{ width: `${value}%` }} />
                </div>
              </div>
            )
          },
        )}
      </div>

      {(analysis.summary || gaps.length > 0) && (
        <div className="px-5 pb-6">
          {analysis.summary && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-[14px] leading-[1.7] text-foreground">{analysis.summary}</p>
            </div>
          )}

          {gaps.length > 0 && (
            <div className="mt-3 border-l-2 border-primary py-1 pl-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {gaps.length === 1 ? 'Gap flagged' : `${gaps.length} gaps flagged`}
              </p>
              <ul className="mt-1 space-y-1.5 text-[13px] leading-[1.6] text-foreground">
                {gaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
