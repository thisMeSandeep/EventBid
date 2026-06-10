import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface BriefWizardLayoutProps {
  step: number
  totalSteps: number
  title: string
  children: ReactNode
  onBack?: () => void
  onContinue: () => void
  continueDisabled?: boolean
  continueLabel?: string
}

export function BriefWizardLayout({
  step,
  totalSteps,
  title,
  children,
  onBack,
  onContinue,
  continueDisabled,
  continueLabel = 'Continue',
}: BriefWizardLayoutProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        to="/host/briefs"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to briefs
      </Link>

      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Step 0{step} of 0{totalSteps}
        </p>
        <h1 className="mt-3 font-serif text-[32px] font-normal tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {/* Step indicator */}
        <div className="mt-5 flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={[
                'h-1 flex-1 rounded-full transition-colors duration-200 ease-out',
                i < step ? 'bg-primary' : 'bg-border',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-full border-border font-normal transition-colors duration-200 ease-out hover:bg-muted/60"
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className="rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}
