import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { amenities } from '@eventbid/shared'
import type { BriefWizardForm } from '../brief-form'
import { BriefImproveStreamPanel } from '../BriefImproveStreamPanel'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Input } from '#/components/ui/input'

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const labelClass = 'font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'

export function RequirementsStep({
  form,
  briefId,
}: {
  form: BriefWizardForm
  briefId?: string
}) {
  const [improveOpen, setImproveOpen] = useState(false)

  return (
    <div className="space-y-6">
      <form.Field name="requirements">
        {(field) => {
          const selected = field.state.value
          const toggle = (a: string) =>
            field.handleChange(
              selected.includes(a)
                ? selected.filter((x) => x !== a)
                : [...selected, a],
            )
          return (
            <div className="space-y-2">
              <Label className={labelClass}>Requirements</Label>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => {
                  const on = selected.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggle(a)}
                      className={[
                        'rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-200 ease-out',
                        on
                          ? 'bg-foreground text-background'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                      ].join(' ')}
                    >
                      {label(a)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name} className={labelClass}>
                Description
              </Label>
              {briefId && (
                <button
                  type="button"
                  onClick={() => setImproveOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Improve with AI
                </button>
              )}
            </div>
            <Textarea
              id={field.name}
              rows={5}
              placeholder="Describe your event, vibe, must-haves…"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {briefId && (
              <BriefImproveStreamPanel
                open={improveOpen}
                onClose={() => setImproveOpen(false)}
                briefId={briefId}
                description={field.state.value}
                requirements={form.state.values.requirements}
                onApply={(t) => {
                  field.handleChange(t)
                  setImproveOpen(false)
                }}
              />
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="deadline">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor={field.name} className={labelClass}>
              Proposal deadline
            </Label>
            <Input
              id={field.name}
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
    </div>
  )
}
