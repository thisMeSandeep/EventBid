import { ArrowRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { VenueCard } from './VenueCard'
import type { Venue } from './VenueCard'
import card1 from '#/assets/card1.webp'
import card2 from '#/assets/card2.webp'
import card3 from '#/assets/card3.webp'

const venues: Array<Venue> = [
  {
    image: card1,
    name: 'The Garden Pavilion',
    price: '$6,250',
    location: 'Melbourne, VIC',
    match: '92%',
    inclusions: [
      'Venue hire (8 hrs)',
      'Catering for 100 guests',
      'Basic AV equipment',
      'Event coordinator',
    ],
  },
  {
    image: card2,
    name: 'The Grand Ballroom',
    price: '$7,800',
    location: 'Melbourne, VIC',
    match: '88%',
    inclusions: [
      'Venue hire (10 hrs)',
      'Catering for 100 guests',
      'Premium AV & lighting',
      'Event coordinator',
    ],
  },
  {
    image: card3,
    name: 'Harbourview Terrace',
    price: '$5,950',
    location: 'Melbourne, VIC',
    match: '85%',
    inclusions: [
      'Venue hire (8 hrs)',
      'Catering for 100 guests',
      'Basic AV equipment',
      'Event support staff',
    ],
  },
]

export function ProposalCards() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto max-w-[1180px] px-6 text-center md:px-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Compare proposals
        </p>
        <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
          Review and compare real venue proposals
        </h2>

        <div className="mt-14 grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.name} {...venue} />
          ))}
        </div>

        <Button
          asChild
          variant="link"
          className="group mt-12 text-[14px] font-normal text-foreground"
        >
          <a href="#">
            View all proposals
            <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </a>
        </Button>
      </div>
    </section>
  )
}
