import type { ComponentType, ReactNode } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  CalendarCheck2,
  IndianRupee,
  NotebookPen,
  PackageCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  amenities as AMENITIES,
  type CreateProposalDto,
  type Proposal,
} from '@eventbid/shared'
import { submitProposal, reviseProposal } from '#/server/proposals'
import { qk } from '#/lib/query-keys'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  NativeSelect,
  NativeSelectOption,
} from '#/components/ui/native-select'
import { TagPicker } from '#/components/venue/TagPicker'

type FormValues = {
  totalPrice: string
  priceType: 'fixed' | 'starting_from'
  amenities: string[]
  inclusions: string
  cateringType: '' | 'included' | 'external' | 'addon'
  capacityConfirmed: boolean
  availabilityConfirmed: boolean
  notes: string
}

function toDefaults(existing: Proposal | null): FormValues {
  return {
    totalPrice: existing?.totalPrice != null ? String(existing.totalPrice) : '',
    priceType: (existing?.priceType as FormValues['priceType']) ?? 'fixed',
    amenities: existing?.amenities ?? [],
    inclusions: (existing?.inclusions ?? []).join('\n'),
    cateringType: (existing?.cateringType as FormValues['cateringType']) ?? '',
    capacityConfirmed: existing?.capacityConfirmed ?? false,
    availabilityConfirmed: existing?.availabilityConfirmed ?? false,
    notes: existing?.notes ?? '',
  }
}

function toPayload(v: FormValues): CreateProposalDto {
  const inclusions = v.inclusions
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    totalPrice: Number(v.totalPrice),
    priceType: v.priceType,
    ...(inclusions.length ? { inclusions } : {}),
    ...(v.amenities.length ? { amenities: v.amenities } : {}),
    ...(v.cateringType ? { cateringType: v.cateringType } : {}),
    capacityConfirmed: v.capacityConfirmed,
    availabilityConfirmed: v.availabilityConfirmed,
    ...(v.notes.trim() ? { notes: v.notes.trim() } : {}),
  }
}

function FieldError({ errors }: { errors: unknown[] }) {
  if (errors.length === 0) return null
  return (
    <p className="mt-1 text-xs text-destructive">{errors.filter(Boolean).join(', ')}</p>
  )
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-medium text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

interface ProposalFormProps {
  briefId: string
  existing: Proposal | null
}

export function ProposalForm({ briefId, existing }: ProposalFormProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isRevise = existing != null

  const mutation = useMutation({
    mutationFn: (payload: CreateProposalDto) =>
      isRevise
        ? reviseProposal(briefId, existing.id, payload)
        : submitProposal(briefId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues', 'proposals'] })
      queryClient.invalidateQueries({ queryKey: qk.briefs.proposals(briefId) })
      toast.success(isRevise ? 'Proposal revised' : 'Proposal submitted')
      navigate({ to: '/venue/proposals' })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to submit proposal')
    },
  })

  const form = useForm({
    defaultValues: toDefaults(existing),
    onSubmit: ({ value }) => mutation.mutate(toPayload(value)),
  })

  return (
    <form
      className="mt-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <SectionCard
        icon={IndianRupee}
        title="Pricing"
        description="What you'd charge for this event."
      >
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="totalPrice"
            validators={{
              onSubmit: ({ value }) =>
                Number(value) > 0 ? undefined : 'Enter a valid price',
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name} className="mb-2">
                  Total price (₹)
                </Label>
                <Input
                  id={field.name}
                  type="number"
                  min={1}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Field name="priceType">
            {(field) => (
              <div>
                <Label htmlFor={field.name} className="mb-2">
                  Price type
                </Label>
                <NativeSelect
                  id={field.name}
                  className="w-full"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value as FormValues['priceType'])
                  }
                >
                  <NativeSelectOption value="fixed">Fixed</NativeSelectOption>
                  <NativeSelectOption value="starting_from">
                    Starting from
                  </NativeSelectOption>
                </NativeSelect>
              </div>
            )}
          </form.Field>
        </div>
      </SectionCard>

      <SectionCard
        icon={PackageCheck}
        title="What's included"
        description="Amenities and extras that come with your offer."
      >
        <div className="space-y-6">
          <form.Field name="amenities">
            {(field) => (
              <div>
                <Label className="mb-2">Amenities</Label>
                <TagPicker
                  options={AMENITIES}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="cateringType">
            {(field) => (
              <div className="max-w-[240px]">
                <Label htmlFor={field.name} className="mb-2">
                  Catering
                </Label>
                <NativeSelect
                  id={field.name}
                  className="w-full"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value as FormValues['cateringType'])
                  }
                >
                  <NativeSelectOption value="">Not specified</NativeSelectOption>
                  <NativeSelectOption value="included">Included</NativeSelectOption>
                  <NativeSelectOption value="external">External</NativeSelectOption>
                  <NativeSelectOption value="addon">Add-on</NativeSelectOption>
                </NativeSelect>
              </div>
            )}
          </form.Field>

          <form.Field name="inclusions">
            {(field) => (
              <div>
                <Label htmlFor={field.name} className="mb-2">
                  Other inclusions
                </Label>
                <Textarea
                  id={field.name}
                  rows={3}
                  placeholder="One per line, e.g. Welcome drinks"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </div>
      </SectionCard>

      <SectionCard
        icon={CalendarCheck2}
        title="Availability & Capacity"
        description="Confirm you can host this event."
      >
        <div className="space-y-3">
          <form.Field name="availabilityConfirmed">
            {(field) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(v) => field.handleChange(v === true)}
                />
                I confirm availability for this date
              </label>
            )}
          </form.Field>
          <form.Field name="capacityConfirmed">
            {(field) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(v) => field.handleChange(v === true)}
                />
                Venue can accommodate the requested headcount
              </label>
            )}
          </form.Field>
        </div>
      </SectionCard>

      <SectionCard
        icon={NotebookPen}
        title="Additional notes"
        description="Anything else the host should know."
      >
        <form.Field name="notes">
          {(field) => (
            <Textarea
              rows={4}
              placeholder="Anything else the host should know…"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      </SectionCard>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
      >
        {mutation.isPending
          ? 'Submitting…'
          : isRevise
            ? 'Revise Proposal'
            : 'Submit Proposal'}
      </Button>
    </form>
  )
}
