import { Check } from 'lucide-react'

const scores = [
  { label: 'Budget fit', value: 88 },
  { label: 'Inclusions match', value: 95 },
  { label: 'Brief alignment', value: 92 },
]

const features = [
  'A match score for every proposal, weighted to what your brief says matters',
  'Plain-English summaries — no spec sheets to decode',
  'Gaps flagged before you commit, not after',
]

export function Compared() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 md:grid-cols-2 md:px-8 lg:gap-20">
        {/* Copy */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            State 03 · Compared
          </p>
          <h2 className="mt-4 max-w-[440px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            The heavy reading, done for you
          </h2>
          <p className="mt-6 max-w-[440px] text-[17px] leading-[1.7] text-muted-foreground">
            When two or more proposals arrive, EventBid scores each one against your brief and
            explains the trade-offs — so the decision rests on substance, not on who wrote the
            prettier pitch.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((text) => (
              <li key={text} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-foreground" strokeWidth={1.5} />
                <span className="text-[15px] leading-[1.7] text-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Analysis panel */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-foreground">
                The Garden Pavilion
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Analysis · Rev 2
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] text-primary-foreground">
              92% match
            </span>
          </div>

          <div className="space-y-5 px-5 py-6">
            {scores.map(({ label, value }) => (
              <div key={label}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-[13px] font-medium tabular-nums text-foreground">
                    {value}%
                  </span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-border">
                  <div className="h-1 rounded-full bg-primary" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 rounded-lg bg-muted p-4">
            <p className="text-[14px] leading-[1.7] text-foreground">
              Covers everything in your brief and comes in just under budget. Catering for 120 is
              included, and the event coordinator is a strong fit for a wedding this size.
            </p>
          </div>

          <div className="mx-5 mb-6 mt-3 border-l-2 border-primary py-1 pl-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Gap flagged
            </p>
            <p className="mt-1 text-[13px] leading-[1.6] text-foreground">
              Outdoor availability for your date hasn’t been confirmed yet — ask before you lock.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
