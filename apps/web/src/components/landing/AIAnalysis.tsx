import { Sparkles, AlertTriangle, Check } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Progress } from '#/components/ui/progress'

const scores = [
  { label: 'Budget fit', value: 88 },
  { label: 'Inclusions match', value: 95 },
  { label: 'Brief alignment', value: 92 },
]

const features = [
  'A match score for every proposal, weighted to your brief',
  'Plain-English summaries — no spec sheets to decode',
  'Gaps flagged automatically, so nothing slips through',
]

export function AIAnalysis() {
  return (
    <section className="bg-muted py-28 md:py-32">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 md:grid-cols-2 md:px-8 lg:gap-16">
        {/* Left — copy */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            AI-assisted evaluation
          </p>
          <h2 className="mt-4 max-w-[440px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Let AI do the heavy reading for you
          </h2>
          <p className="mt-6 max-w-[440px] text-[17px] leading-[1.7] text-muted-foreground">
            When two or more proposals arrive, EventBid scores each one against your brief and
            explains the trade-offs in plain language — so you compare on substance, not formatting.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((text) => (
              <li key={text} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                <span className="text-[15px] leading-[1.7] text-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — mock analysis panel */}
        <Card className="gap-0 rounded-2xl border-0 bg-card p-7 shadow-none transition-shadow duration-200 ease-out hover:shadow-[0_16px_50px_-20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-[15px] font-medium text-foreground">The Garden Pavilion</p>
                <p className="text-[12px] text-muted-foreground">AI analysis</p>
              </div>
            </div>
            <Badge className="rounded-full bg-primary px-3 py-1 text-[13px] font-normal text-primary-foreground">
              92% match
            </Badge>
          </div>

          <div className="mt-7 space-y-4">
            {scores.map(({ label, value }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}%</span>
                </div>
                <Progress value={value} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-xl bg-muted/50 p-4">
            <p className="text-[14px] leading-[1.7] text-foreground">
              Covers everything in your brief and comes in just under budget. Catering for 100 is
              included, and the event coordinator is a strong fit for a wedding this size.
            </p>
          </div>

          <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-accent/40 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
            <p className="text-[13px] leading-[1.6] text-foreground">
              Outdoor availability for your date hasn't been confirmed yet.
            </p>
          </div>
        </Card>
      </div>
    </section>
  )
}
