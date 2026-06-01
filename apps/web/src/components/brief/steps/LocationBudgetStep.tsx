import type { BriefWizardForm } from '../brief-form'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'

export function LocationBudgetStep({ form }: { form: BriefWizardForm }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="city">
          {(field) => (
            <div className="space-y-1">
              <Label htmlFor={field.name}>City</Label>
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
            <div className="space-y-1">
              <Label htmlFor={field.name}>State</Label>
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

      <div className="space-y-1">
        <Label>Budget (₹)</Label>
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
