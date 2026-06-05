import { AlertTriangle, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import type { ProposalAnalysis, ProposalSubScores } from '@eventbid/shared'
import { Badge } from '#/components/ui/badge'
import { Progress } from '#/components/ui/progress'

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
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
      Regenerate
    </button>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-2.5">
        <Sparkles className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        <p className="text-[15px] font-medium text-foreground">AI analysis</p>
      </div>
      {children}
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
        <p className="mt-4 text-sm text-muted-foreground">
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
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
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
    <div className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-foreground">AI analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {onRegenerate && (
            <RegenerateButton onClick={onRegenerate} busy={isRegenerating} />
          )}
          <Badge className="rounded-full bg-foreground px-3 py-1 text-[13px] font-normal text-background">
            {score}% match
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {(Object.keys(SUB_SCORE_LABELS) as Array<keyof ProposalSubScores>).map(
          (key) => {
            const value = subScores[key] ?? 0
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">
                    {SUB_SCORE_LABELS[key]}
                  </span>
                  <span className="font-medium text-foreground">{value}%</span>
                </div>
                <Progress value={value} className="mt-2 h-1.5" />
              </div>
            )
          },
        )}
      </div>

      {analysis.summary && (
        <div className="mt-6 rounded-xl bg-muted/50 p-4">
          <p className="text-[14px] leading-[1.7] text-foreground">
            {analysis.summary}
          </p>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-3 space-y-2">
          {gaps.map((gap, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl bg-accent/40 p-4"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
                strokeWidth={1.5}
              />
              <p className="text-[13px] leading-[1.6] text-foreground">{gap}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
