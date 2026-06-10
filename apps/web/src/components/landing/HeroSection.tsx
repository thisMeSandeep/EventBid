import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'

const proposals = [
  {
    venue: 'The Garden Pavilion',
    detail: 'Catering for 120 · coordinator included',
    price: '$6,250',
    match: '92% match',
    best: true,
    delay: 'delay-[700ms]',
  },
  {
    venue: 'Harbourview Terrace',
    detail: 'Waterfront hall · in-house bar',
    price: '$5,950',
    match: '87% match',
    best: false,
    delay: 'delay-[900ms]',
  },
  {
    venue: 'The Grand Ballroom',
    detail: 'Premium AV · valet parking',
    price: '$7,800',
    match: '81% match',
    best: false,
    delay: 'delay-[1100ms]',
  },
]

const enter =
  'animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards duration-700 motion-reduce:animate-none'

export function HeroSection() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-28 pt-24 md:px-8 md:pt-32">
      <div className="grid items-center gap-14 md:grid-cols-2 lg:gap-20">
        {/* Thesis */}
        <div className={enter}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            A reverse marketplace for event venues
          </p>

          <h1 className="mt-6 font-serif text-[clamp(46px,6.2vw,80px)] font-normal leading-[1.02] tracking-[-0.02em] text-foreground">
            Venues compete.
            <br />
            <em>You choose.</em>
          </h1>

          <p className="mt-7 max-w-[440px] text-[17px] leading-[1.7] text-muted-foreground">
            Describe your wedding, birthday, or party once. Matching venues send structured
            proposals with real prices and inclusions — compare them side by side and lock the
            one that fits.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-full bg-foreground px-6 text-[15px] font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
            >
              <Link to="/register">
                Post your brief
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-full px-5 text-[15px] font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              <Link to="/register">List your venue</Link>
            </Button>
          </div>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Free for hosts · No obligation until you accept
          </p>
        </div>

        {/* Deal room — the signature element */}
        <div
          className={`min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-lg ${enter} delay-300`}
          aria-label="Example: a brief receiving venue proposals"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:px-5">
            <span>Brief №2041</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
              Open · 4 days left
            </span>
          </div>

          <div className="px-4 py-5 sm:px-5">
            <p className="font-serif text-[24px] leading-none text-foreground">Garden wedding</p>
            <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              120 guests · Sat, Jun 14 · Under $8,000
            </p>
          </div>

          <p className="border-t border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:px-5">
            Proposals · 3 received
          </p>

          <ul>
            {proposals.map(({ venue, detail, price, match, best, delay }) => (
              <li
                key={venue}
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-4 py-4 sm:px-5 ${enter} ${delay}`}
              >
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate text-[15px] font-medium text-foreground">{venue}</p>
                  <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{detail}</p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <span className="text-[15px] font-medium tabular-nums text-foreground">
                    {price}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] ${
                      best
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {match}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p
            className={`border-t border-dashed border-border px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70 sm:px-5 ${enter} delay-[1400ms]`}
          >
            2 more venues are viewing this brief…
          </p>
        </div>
      </div>
    </section>
  )
}
