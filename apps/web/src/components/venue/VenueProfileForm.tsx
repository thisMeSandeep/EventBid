import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { amenities, eventTypes, type UpdateVenueDto, type Venue } from '@eventbid/shared'
import { updateVenue } from '#/server/venues'
import { qk } from '#/lib/query-keys'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { TagPicker } from './TagPicker'

const STYLE_TAGS = [
  'modern',
  'rustic',
  'industrial',
  'classic',
  'outdoor',
  'luxury',
  'minimal',
  'vintage',
] as const

type VenueFormValues = {
  name: string
  description: string
  city: string
  state: string
  maxCapacity: string
  phone: string
  email: string
  website: string
  eventTypes: string[]
  styleTags: string[]
  amenities: string[]
}

function toDefaults(v: Venue | null): VenueFormValues {
  return {
    name: v?.name ?? '',
    description: v?.description ?? '',
    city: v?.city ?? '',
    state: v?.state ?? '',
    maxCapacity: v?.maxCapacity != null ? String(v.maxCapacity) : '',
    phone: v?.phone ?? '',
    email: v?.email ?? '',
    website: v?.website ?? '',
    eventTypes: v?.eventTypes ?? [],
    styleTags: v?.styleTags ?? [],
    amenities: v?.amenities ?? [],
  }
}

function toPayload(v: VenueFormValues): UpdateVenueDto {
  return {
    name: v.name,
    city: v.city,
    state: v.state,
    maxCapacity: Number(v.maxCapacity),
    eventTypes: v.eventTypes,
    styleTags: v.styleTags,
    amenities: v.amenities,
    ...(v.description ? { description: v.description } : {}),
    ...(v.phone ? { phone: v.phone } : {}),
    ...(v.email ? { email: v.email } : {}),
    ...(v.website ? { website: v.website } : {}),
  }
}

function FieldError({ errors }: { errors: unknown[] }) {
  if (errors.length === 0) return null
  return (
    <p className="mt-1 text-xs text-destructive">
      {errors.filter(Boolean).join(', ')}
    </p>
  )
}

export function VenueProfileForm({ venue }: { venue: Venue | null }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: UpdateVenueDto) => updateVenue(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: qk.venues.me })
      const previous = queryClient.getQueryData<Venue | null>(qk.venues.me)
      if (previous) {
        queryClient.setQueryData<Venue>(qk.venues.me, { ...previous, ...payload } as Venue)
      }
      return { previous }
    },
    onError: (err, _payload, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(qk.venues.me, ctx.previous)
      }
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    },
    onSuccess: (saved) => {
      // Preserve photos — the PUT /venues/me response doesn't include them.
      const existing = queryClient.getQueryData<Venue & { photos?: unknown }>(qk.venues.me)
      queryClient.setQueryData(qk.venues.me, {
        ...saved,
        photos: existing?.photos ?? [],
      })
      toast.success('Profile saved')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.venues.me })
    },
  })

  const form = useForm({
    defaultValues: toDefaults(venue),
    onSubmit: ({ value }) => mutation.mutate(toPayload(value)),
  })

  return (
    <form
      className="mx-auto max-w-2xl px-6 py-8"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <h1 className="text-xl font-semibold text-foreground">Venue profile</h1>

      {/* Basic info */}
      <section className="mt-6 space-y-4">
        <h2 className="text-base font-medium text-foreground">Basic info</h2>

        <form.Field
          name="name"
          validators={{
            onSubmit: ({ value }) => (value.trim() ? undefined : 'Name is required'),
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name}>Venue name</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="The Grand Hall"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>Description</Label>
              <Textarea
                id={field.name}
                rows={4}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Tell hosts what makes your venue special…"
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="city"
            validators={{
              onSubmit: ({ value }) => (value.trim() ? undefined : 'City is required'),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>City</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Field
            name="state"
            validators={{
              onSubmit: ({ value }) => (value.trim() ? undefined : 'State is required'),
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>State</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="email">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="phone">
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Phone</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="website">
          {(field) => (
            <div>
              <Label htmlFor={field.name}>Website</Label>
              <Input
                id={field.name}
                placeholder="https://…"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </section>

      {/* Details */}
      <section className="mt-8 space-y-4">
        <h2 className="text-base font-medium text-foreground">Details</h2>

        <form.Field
          name="maxCapacity"
          validators={{
            onSubmit: ({ value }) =>
              Number(value) > 0 ? undefined : 'Enter a valid capacity',
          }}
        >
          {(field) => (
            <div className="max-w-[200px]">
              <Label htmlFor={field.name}>Max capacity</Label>
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

        <form.Field name="eventTypes">
          {(field) => (
            <div>
              <Label>Event types</Label>
              <div className="mt-1.5">
                <TagPicker
                  options={eventTypes}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="styleTags">
          {(field) => (
            <div>
              <Label>Style</Label>
              <div className="mt-1.5">
                <TagPicker
                  options={STYLE_TAGS}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="amenities">
          {(field) => (
            <div>
              <Label>Amenities</Label>
              <div className="mt-1.5">
                <TagPicker
                  options={amenities}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            </div>
          )}
        </form.Field>
      </section>

      {/* Save — sticky on mobile */}
      <div className="sticky bottom-0 mt-8 flex justify-end border-t border-border bg-background py-4 sm:static sm:border-0 sm:py-0">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  )
}
