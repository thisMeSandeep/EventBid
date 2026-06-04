import { Heart, Cake, PartyPopper, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '#/components/ui/badge'

interface EventType {
  icon: LucideIcon
  label: string
}

const types: Array<EventType> = [
  { icon: Heart, label: 'Weddings' },
  { icon: Cake, label: 'Birthdays' },
  { icon: PartyPopper, label: 'Parties' },
  { icon: Sparkles, label: 'And more' },
]

export function EventTypes() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Trusted for every kind of celebration
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {types.map(({ icon: Icon, label }) => (
            <Badge
              key={label}
              variant="outline"
              className="gap-2 rounded-full border-black/[0.06] bg-card px-4 py-2 text-[14px] font-normal text-foreground transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-black/15 motion-reduce:transform-none [&>svg]:size-4"
            >
              <Icon className="text-primary" strokeWidth={1.5} />
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
