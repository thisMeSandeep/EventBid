import type { BriefWizardForm } from '../brief-form'
import { formatBudgetRange, formatDate } from '#/lib/format'

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—')

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  )
}

export function ReviewStep({ form }: { form: BriefWizardForm }) {
  return (
    <form.Subscribe selector={(s) => s.values}>
      {(v) => (
        <div className="divide-y divide-black/[0.06] text-sm">
          <Row label="Event" value={cap(v.eventType)} />
          <Row
            label="Dates"
            value={`${v.eventDateFrom ? formatDate(v.eventDateFrom) : '—'} – ${
              v.eventDateTo ? formatDate(v.eventDateTo) : '—'
            }`}
          />
          <Row label="Headcount" value={v.headcount || '—'} />
          <Row label="Location" value={`${v.city}, ${v.state}`} />
          <Row
            label="Budget"
            value={
              v.budgetMin && v.budgetMax
                ? formatBudgetRange(Number(v.budgetMin), Number(v.budgetMax))
                : '—'
            }
          />
          <Row
            label="Requirements"
            value={v.requirements.length ? v.requirements.map(cap).join(', ') : 'None'}
          />
          {v.description && <Row label="Description" value={v.description} />}
          <Row label="Deadline" value={v.deadline ? formatDate(v.deadline) : '—'} />
        </div>
      )}
    </form.Subscribe>
  )
}
