import { ArrowRight, Check, Shield, Clock } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Avatar, AvatarImage, AvatarGroup } from '#/components/ui/avatar'
import heroImage from '#/assets/heroImage.webp'
import person1 from '#/assets/person1.webp'
import person2 from '#/assets/person2.webp'
import person3 from '#/assets/person3.webp'
import person4 from '#/assets/person4.webp'

const avatars = [person1, person2, person3, person4]

const trustSignals = [
  { icon: Check, label: 'Free to post' },
  { icon: Shield, label: 'No obligation' },
  { icon: Clock, label: 'Save time & money' },
]

export function HeroSection() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-28 pt-32 md:px-8 md:pt-40">
      <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-card px-3 py-1 text-[12px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The smarter way to find event venues
          </span>

          <h1 className="mt-6 font-serif text-[clamp(44px,6vw,76px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            Find your perfect venue. Compare real proposals.
          </h1>

          <p className="mt-6 max-w-[460px] text-[17px] font-normal leading-[1.7] text-muted-foreground">
            Post your event brief and receive custom proposals from top venues. Compare options,
            check inclusions and prices, and choose with confidence.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-full bg-foreground px-6 text-[15px] font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
            >
              <a href="#">
                Post your event brief
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-full px-5 text-[15px] font-normal text-foreground hover:bg-muted"
            >
              <a href="#">Browse venues</a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="text-[13px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl">
            <img
              src={heroImage}
              alt="Elegant venue interior"
              className="h-full w-full object-cover"
            />
          </div>

          <Card className="absolute -bottom-6 right-4 max-w-[260px] gap-0 border-0 p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)] md:-right-8">
            <AvatarGroup>
              {avatars.map((src, i) => (
                <Avatar key={i}>
                  <AvatarImage src={src} alt="" />
                </Avatar>
              ))}
            </AvatarGroup>
            <div className="mt-3 text-[13px] tracking-[0.15em] text-primary">★★★★★</div>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-muted-foreground">
              Trusted by 2,000+ hosts for unforgettable events
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
