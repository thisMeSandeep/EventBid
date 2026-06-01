import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import type { Brief } from '@eventbid/shared'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'
import {
  isStepValid,
  toCreateBriefPayload,
  useBriefForm,
  type WizardValues,
} from '#/components/brief/brief-form'
import { BriefWizardLayout } from '#/components/brief/BriefWizardLayout'
import { EventBasicsStep } from '#/components/brief/steps/EventBasicsStep'
import { LocationBudgetStep } from '#/components/brief/steps/LocationBudgetStep'
import { RequirementsStep } from '#/components/brief/steps/RequirementsStep'
import { ReviewStep } from '#/components/brief/steps/ReviewStep'

const TOTAL_STEPS = 4

const STEP_TITLES: Record<number, string> = {
  1: 'Event basics',
  2: 'Location & budget',
  3: 'Requirements',
  4: 'Review',
}

export const Route = createFileRoute('/_app/host/briefs/new')({
  validateSearch: z.object({
    step: z.coerce.number().min(1).max(4).default(1),
  }),
  component: NewBriefPage,
})

function NewBriefPage() {
  const { step } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const queryClient = useQueryClient()
  const form = useBriefForm()

  const goTo = (s: number) =>
    navigate({ search: (prev) => ({ ...prev, step: s }) })

  const createBrief = useMutation({
    mutationFn: (values: WizardValues) =>
      apiClient.post<{ brief: Brief; warnings: string[] }>(
        '/api/briefs',
        toCreateBriefPayload(values),
      ),
    onSuccess: async ({ brief, warnings }) => {
      await queryClient.invalidateQueries({ queryKey: qk.briefs.list() })
      warnings?.forEach((w) => toast.warning(w))
      navigate({ to: '/host/briefs/$briefId', params: { briefId: brief.id } })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create brief')
    },
  })

  const isLast = step === TOTAL_STEPS

  return (
    <form.Subscribe selector={(s) => s.values}>
      {(values) => {
        const canContinue = isStepValid(step, values)
        return (
          <BriefWizardLayout
            step={step}
            totalSteps={TOTAL_STEPS}
            title={STEP_TITLES[step] ?? ''}
            onBack={step > 1 ? () => goTo(step - 1) : undefined}
            onContinue={() => {
              if (!canContinue) return
              if (isLast) createBrief.mutate(values)
              else goTo(step + 1)
            }}
            continueDisabled={!canContinue || createBrief.isPending}
            continueLabel={
              isLast
                ? createBrief.isPending
                  ? 'Creating…'
                  : 'Submit brief'
                : 'Continue'
            }
          >
            {step === 1 && <EventBasicsStep form={form} />}
            {step === 2 && <LocationBudgetStep form={form} />}
            {step === 3 && <RequirementsStep form={form} />}
            {step === 4 && <ReviewStep form={form} />}
          </BriefWizardLayout>
        )
      }}
    </form.Subscribe>
  )
}
