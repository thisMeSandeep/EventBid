import { Link } from '@tanstack/react-router'
import { Target, FileText, Lock, ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import ballroomImage from '#/assets/ballroomImage.webp'

const points = [
  {
    icon: Target,
    title: 'Qualified leads, not cold inquiries',
    body: 'Briefs are matched to your capacity, location and style — so every lead is a real fit.',
  },
  {
    icon: FileText,
    title: 'Present your full offering',
    body: 'Submit a structured proposal with pricing, inclusions and a pitch — no more scattered PDFs.',
  },
  {
    icon: Lock,
    title: 'Close on-platform',
    body: 'When a host accepts, the deal locks and you get their details instantly.',
  },
]

export function ForVenues() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 md:grid-cols-2 md:px-8 lg:gap-16">
        {/* Image */}
        <div className="order-last overflow-hidden rounded-2xl md:order-first">
          <img
            src={ballroomImage}
            alt="A venue ready to host an event"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        {/* Copy */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">For venues</p>
          <h2 className="mt-4 max-w-[440px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Win more bookings with less back-and-forth
          </h2>
          <p className="mt-6 max-w-[440px] text-[17px] leading-[1.7] text-muted-foreground">
            List your venue once and receive briefs from serious hosts actively planning their event.
          </p>

          <ul className="mt-10 space-y-8">
            {points.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-[17px] font-medium tracking-[-0.01em] text-foreground">
                    {title}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-[1.7] text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

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
