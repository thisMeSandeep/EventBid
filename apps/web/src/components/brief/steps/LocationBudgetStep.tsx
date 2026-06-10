import type { BriefWizardForm } from '../brief-form'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'

const labelClass = 'font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'

export function LocationBudgetStep({ form }: { form: BriefWizardForm }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="city">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className={labelClass}>
                City
              </Label>
              <Input
                id={field.name}
                placeholder="Bengaluru"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
        <form.Field name="state">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className={labelClass}>
                State
              </Label>
              <Input
                id={field.name}
                placeholder="Karnataka"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass}>Budget (₹)</Label>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="budgetMin">
            {(field) => (
              <Input
                type="number"
                min={1}
                placeholder="Min"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <form.Field name="budgetMax">
            {(field) => (
              <Input
                type="number"
                min={1}
                placeholder="Max"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </div>
      </div>
    </div>
  )
}
