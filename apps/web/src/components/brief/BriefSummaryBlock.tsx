import type { ComponentType } from 'react'
import {
  CalendarClock,
  CalendarDays,
  IndianRupee,
  MapPin,
  PartyPopper,
  Users,
} from 'lucide-react'
import type { Brief } from '@eventbid/shared'
import { formatBudgetRange, formatDate } from '#/lib/format'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm text-foreground">{value}</dd>
      </div>
    </div>
  )
}

export function BriefSummaryBlock({ brief }: { brief: Brief }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-8">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field icon={PartyPopper} label="Event type" value={cap(brief.eventType)} />
        <Field
          icon={CalendarDays}
          label="Dates"
          value={`${formatDate(brief.eventDateFrom)} – ${formatDate(brief.eventDateTo)}`}
        />
        <Field icon={Users} label="Headcount" value={`${brief.headcount} guests`} />
        <Field icon={MapPin} label="Location" value={`${brief.city}, ${brief.state}`} />
        <Field
          icon={IndianRupee}
          label="Budget"
          value={formatBudgetRange(brief.budgetMin, brief.budgetMax)}
        />
        <Field icon={CalendarClock} label="Deadline" value={formatDate(brief.deadline)} />
      </dl>

      {brief.requirements && brief.requirements.length > 0 && (
        <div className="mt-8 border-t border-black/[0.06] pt-6">
          <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Requirements
          </dt>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.requirements.map((r: string) => (
              <span
                key={r}
                className="rounded-full border border-black/[0.06] bg-muted/60 px-3 py-1 text-[13px] text-foreground"
              >
                {cap(r)}
              </span>
            ))}
          </div>
        </div>
      )}

      {brief.description && (
        <div className="mt-8 border-t border-black/[0.06] pt-6">
          <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Description
          </dt>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {brief.description}
          </p>
        </div>
      )}
    </div>
  )
}
