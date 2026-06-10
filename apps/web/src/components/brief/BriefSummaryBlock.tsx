import type { Brief } from '@eventbid/shared'
import { formatBudgetRange, formatDate } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 truncate text-[15px] text-foreground">{value}</dd>
    </div>
  )
}

export function BriefSummaryBlock({ brief }: { brief: Brief }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <p className="border-b border-border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Brief summary
      </p>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-6 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
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
        <div className="border-t border-border px-6 py-5 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Requirements
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.requirements.map((r: string) => (
              <span
                key={r}
                className="rounded-full border border-border bg-muted/60 px-3 py-1 text-[13px] text-foreground"
              >
                {cap(r)}
              </span>
            ))}
          </div>
        </div>
      )}

      {brief.description && (
        <div className="border-t border-border px-6 py-5 sm:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Description
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {brief.description}
          </p>
        </div>
      )}
    </div>
  )
}
