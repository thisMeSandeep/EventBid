import { FileCheck2, Bell, Clock, Lock, History, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '#/components/ui/card'

interface Feature {
  icon: LucideIcon
  title: string
  body: string
  /** lg span — wide tiles create the bento rhythm */
  span?: string
}

// Spans sum to a multiple of 3 so the bento tiles a 3-col grid with no gaps.
const features: Array<Feature> = [
  {
    icon: FileCheck2,
    title: 'Structured proposals',
    body: 'Every venue answers the same questions, so offers are always comparable — no decoding spec sheets or chasing missing details.',
    span: 'lg:col-span-2',
  },
  {
    icon: Bell,
    title: 'Real-time updates',
    body: 'Get notified the moment a proposal arrives or your analysis is ready.',
  },
  {
    icon: Clock,
    title: 'Deadline-enforced',
    body: 'Set a response deadline and let the process run on a fair, fixed timeline.',
  },
  {
    icon: Lock,
    title: 'Atomic deal locking',
    body: 'Accept one proposal and the rest close automatically — no loose ends, no awkward follow-ups.',
    span: 'lg:col-span-2',
  },
  {
    icon: History,
    title: 'Revision history',
    body: 'Venues can refine their offer, and you always see the latest version.',
    span: 'lg:col-span-2',
  },
  {
    icon: ShieldCheck,
    title: 'Full-service venues',
    body: 'Browse venues that handle your event end to end.',
  },
]

export function FeatureGrid() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Why EventBid</p>
          <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Everything you need to decide with confidence
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(13rem,1fr)]">
          {features.map(({ icon: Icon, title, body, span }) => (
            <Card
              key={title}
              className={`group flex h-full flex-col gap-0 border-transparent bg-muted/40 p-8 shadow-none transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted/70 motion-reduce:transform-none ${span ?? ''}`}
            >
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <div className="mt-auto pt-12">
                <h3 className="text-[19px] font-medium tracking-[-0.01em] text-foreground">
                  {title}
                </h3>
                <p className="mt-2 max-w-[42ch] text-[15px] leading-[1.7] text-muted-foreground">
                  {body}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
