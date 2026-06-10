import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import ballroomImage from '#/assets/ballroomImage.webp'

const points = [
  {
    label: 'Qualified briefs',
    body: 'Every brief you see already fits your capacity, location and style.',
  },
  {
    label: 'One structured pitch',
    body: 'Price, inclusions, availability — your offer, comparable at a glance.',
  },
  {
    label: 'Instant close',
    body: 'Acceptance locks the deal and shares the host’s details with you.',
  },
]

export function ForVenues() {
  // The `dark` class flips every token inside — venues literally see the
  // marketplace from the other side of the table.
  return (
    <section className="dark bg-background py-28 md:py-32">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 md:grid-cols-2 md:px-8 lg:gap-20">
        {/* Image */}
        <div className="order-last md:order-first">
          <div className="overflow-hidden rounded-xl">
            <img
              src={ballroomImage}
              alt="A ballroom set for an event"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            The Grand Ballroom · won 7 of its last 9 bids
          </p>
        </div>

        {/* Copy */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            For venues · The other side of the table
          </p>
          <h2 className="mt-4 max-w-[440px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Bid only where you fit
          </h2>
          <p className="mt-6 max-w-[440px] text-[17px] leading-[1.7] text-muted-foreground">
            List your venue once and receive briefs from hosts actively planning their event — no
            cold inquiries, no chasing.
          </p>

          <div className="mt-10">
            {points.map(({ label, body }) => (
              <div
                key={label}
                className="grid gap-1 border-t border-border py-5 md:grid-cols-[180px_1fr] md:gap-6"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </p>
                <p className="text-[15px] leading-[1.6] text-foreground">{body}</p>
              </div>
            ))}
          </div>

          <Button
            asChild
            size="lg"
            className="group mt-10 h-12 rounded-full bg-primary px-6 text-[15px] font-normal text-primary-foreground transition-colors duration-200 ease-out hover:bg-primary/90"
          >
            <Link to="/register">
              List your venue
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
