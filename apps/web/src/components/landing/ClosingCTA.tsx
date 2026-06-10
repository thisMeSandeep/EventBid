import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'

export function ClosingCTA() {
  // №2042 — the next number after the hero's example brief. The next one is yours.
  return (
    <section className="bg-background px-6 py-24 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] rounded-xl border border-border bg-card text-center shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>Brief №2042</span>
          <span>Reserved for you</span>
        </div>

        <div className="px-8 py-14">
          <h2 className="font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[40px]">
            Your event, open for proposals
          </h2>
          <p className="mx-auto mt-4 max-w-[420px] text-[15px] leading-[1.7] text-muted-foreground">
            Post your brief in a few minutes. Matching venues take it from there.
          </p>
          <Button
            asChild
            size="lg"
            className="group mt-8 h-12 rounded-full bg-foreground px-6 text-[15px] font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
          >
            <Link to="/register">
              Post your brief
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </Link>
          </Button>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Free for hosts · No obligation until you accept
          </p>
        </div>
      </div>
    </section>
  )
}
