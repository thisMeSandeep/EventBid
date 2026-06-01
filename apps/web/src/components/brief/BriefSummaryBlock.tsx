import type { Brief } from '@eventbid/shared'
import { formatBudgetRange, formatDate } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  )
}

export function BriefSummaryBlock({ brief }: { brief: Brief }) {
  return (
    <div className="rounded-lg bg-muted/40 p-6">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Field label="Event type" value={cap(brief.eventType)} />
        <Field
          label="Dates"
          value={`${formatDate(brief.eventDateFrom)} – ${formatDate(brief.eventDateTo)}`}
        />
        <Field label="Headcount" value={`${brief.headcount} guests`} />
        <Field label="Location" value={`${brief.city}, ${brief.state}`} />
        <Field label="Budget" value={formatBudgetRange(brief.budgetMin, brief.budgetMax)} />
        <Field label="Deadline" value={formatDate(brief.deadline)} />
      </dl>

      {brief.requirements && brief.requirements.length > 0 && (
        <div className="mt-4">
          <dt className="text-xs text-muted-foreground">Requirements</dt>
          <div className="mt-1 flex flex-wrap gap-2">
            {brief.requirements.map((r) => (
              <span
                key={r}
                className="rounded-full bg-accent/60 px-2.5 py-0.5 text-xs text-accent-foreground"
              >
                {cap(r)}
              </span>
            ))}
          </div>
        </div>
      )}

      {brief.description && (
        <div className="mt-4">
          <dt className="text-xs text-muted-foreground">Description</dt>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {brief.description}
          </p>
        </div>
      )}
    </div>
  )
}
