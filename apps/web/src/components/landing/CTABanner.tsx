import { CalendarCheck, ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'

export function CTABanner() {
  return (
    <section className="bg-background px-6 py-20 md:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-8 rounded-3xl bg-foreground px-8 py-14 md:flex-row md:items-center md:px-16 md:py-16">
        <CalendarCheck className="h-8 w-8 shrink-0 text-primary" strokeWidth={1.5} />

        <div className="flex-1">
          <h2 className="font-serif text-[28px] font-normal leading-[1.1] tracking-[-0.01em] text-background md:text-[32px]">
            Ready to find your perfect venue?
          </h2>
          <p className="mt-2 max-w-[460px] text-[15px] leading-[1.6] text-background/70">
            Post your event brief for free and receive custom proposals from top venues.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="group h-12 shrink-0 rounded-full bg-background px-6 text-[15px] font-normal text-foreground transition-colors duration-200 ease-out hover:bg-background/90"
        >
          <a href="#">
            Get started — it's free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </a>
        </Button>
      </div>
    </section>
  )
}
