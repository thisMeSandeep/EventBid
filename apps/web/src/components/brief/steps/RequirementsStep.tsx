import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { amenities } from '@eventbid/shared'
import type { BriefWizardForm } from '../brief-form'
import { BriefImproveStreamPanel } from '../BriefImproveStreamPanel'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Input } from '#/components/ui/input'

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function RequirementsStep({ form }: { form: BriefWizardForm }) {
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
              <Label>Requirements</Label>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => {
                  const on = selected.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggle(a)}
                      className={[
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                        on
                          ? 'bg-accent/60 text-accent-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70',
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
              <Label htmlFor={field.name}>Description</Label>
              <button
                type="button"
                onClick={() => setImproveOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Improve with AI
              </button>
            </div>
            <Textarea
              id={field.name}
              rows={5}
              placeholder="Describe your event, vibe, must-haves…"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <BriefImproveStreamPanel
              open={improveOpen}
              onClose={() => setImproveOpen(false)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="deadline">
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor={field.name}>Proposal deadline</Label>
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
