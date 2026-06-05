import { Check, Lightbulb, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import type { BriefAnalysis } from '@eventbid/shared'

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

function Shell({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          <div>
            <p className="text-[15px] font-medium text-foreground">
              How to win this brief
            </p>
            <p className="text-[12px] text-muted-foreground">AI guidance</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

interface BriefWinGuideCardProps {
  analysis: BriefAnalysis
  onRegenerate?: () => void
  isRegenerating?: boolean
}

export function BriefWinGuideCard({
  analysis,
  onRegenerate,
  isRegenerating = false,
}: BriefWinGuideCardProps) {
  const regenerate =
    onRegenerate &&
    (() => <RegenerateButton onClick={onRegenerate} busy={isRegenerating} />)

  if (analysis.status === 'failed') {
    return (
      <Shell action={regenerate?.()}>
        <p className="mt-4 text-sm text-muted-foreground">
          Guidance couldn't be generated for this brief.
        </p>
      </Shell>
    )
  }

  if (analysis.status !== 'complete') {
    return (
      <Shell>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing guidance…
        </p>
      </Shell>
    )
  }

  const keyRequirements = (analysis.keyRequirements ?? []) as string[]
  const tips = (analysis.tips ?? []) as string[]

  return (
    <Shell action={regenerate?.()}>
      {analysis.summary && (
        <div className="mt-5 rounded-xl bg-muted/50 p-4">
          <p className="text-[14px] leading-[1.7] text-foreground">
            {analysis.summary}
          </p>
        </div>
      )}

      {keyRequirements.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Key requirements
          </p>
          <ul className="mt-3 space-y-2">
            {keyRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tips.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Tips to stand out
          </p>
          <ul className="mt-3 space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.5} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Shell>
  )
}
