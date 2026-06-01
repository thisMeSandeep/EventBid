import type { BriefWizardForm } from '../brief-form'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'party', label: 'Party' },
  { value: 'other', label: 'Other' },
] as const

export function EventBasicsStep({ form }: { form: BriefWizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="eventType">
        {(field) => (
          <div className="space-y-2">
            <Label>Event type</Label>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map((t) => {
                const selected = field.state.value === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => field.handleChange(t.value)}
                    className={[
                      'rounded-lg border p-3 text-sm font-medium transition-colors duration-150',
                      selected
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'border-border bg-card text-foreground hover:bg-muted/50',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="eventDateFrom">
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor={field.name}>From</Label>
              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="eventDateTo">
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor={field.name}>To</Label>
              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                min={form.state.values.eventDateFrom || undefined}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="headcount">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor={field.name}>Headcount</Label>
            <Input
              id={field.name}
              type="number"
              min={1}
              placeholder="120"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
    </div>
  )
}
