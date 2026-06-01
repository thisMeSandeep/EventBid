import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { Brief } from '@eventbid/shared'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'
import { briefQuery } from '#/server/briefs'
import {
  briefToWizardValues,
  isStepValid,
  toCreateBriefPayload,
  useBriefForm,
  type WizardValues,
} from './brief-form'
import { EventBasicsStep } from './steps/EventBasicsStep'
import { LocationBudgetStep } from './steps/LocationBudgetStep'
import { RequirementsStep } from './steps/RequirementsStep'
import { Button } from '#/components/ui/button'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function BriefEditForm({ brief }: { brief: Brief }) {
  const form = useBriefForm(briefToWizardValues(brief))
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const backToDetail = () =>
    navigate({ to: '/host/briefs/$briefId', params: { briefId: brief.id } })

  const update = useMutation({
    mutationFn: (values: WizardValues) =>
      apiClient.patch<Brief>(`/api/briefs/${brief.id}`, toCreateBriefPayload(values)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: briefQuery(brief.id).queryKey }),
        queryClient.invalidateQueries({ queryKey: qk.briefs.list() }),
      ])
      toast.success('Brief updated')
      backToDetail()
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update brief')
    },
  })

  return (
    <div className="mt-6 space-y-8">
      <Section title="Event basics">
        <EventBasicsStep form={form} />
      </Section>
      <Section title="Location & budget">
        <LocationBudgetStep form={form} />
      </Section>
      <Section title="Requirements">
        <RequirementsStep form={form} briefId={brief.id} />
      </Section>

      <form.Subscribe selector={(s) => s.values}>
        {(values) => {
          const valid =
            isStepValid(1, values) && isStepValid(2, values) && isStepValid(3, values)
          return (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={backToDetail} disabled={update.isPending}>
                Cancel
              </Button>
              <Button
                disabled={!valid || update.isPending}
                onClick={() => update.mutate(values)}
              >
                {update.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          )
        }}
      </form.Subscribe>
    </div>
  )
}
