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
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        to="/host/briefs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to briefs
      </Link>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">
          Step {step} of {totalSteps}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{title}</h1>
        {/* Step indicator */}
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={[
                'h-1 flex-1 rounded-full',
                i < step ? 'bg-primary' : 'bg-muted',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">{children}</div>

      <div className="mt-8 flex items-center justify-end gap-3">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="button" onClick={onContinue} disabled={continueDisabled}>
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}
