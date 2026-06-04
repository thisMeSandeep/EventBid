import { Heart, MapPin, Check } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

export interface Venue {
  image: string
  name: string
  price: string
  location: string
  match: string
  inclusions: Array<string>
}

export function VenueCard({ image, name, price, location, match, inclusions }: Venue) {
  return (
    <Card className="group gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-none transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)] motion-reduce:transform-none">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="aspect-[16/10] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <button
          className="absolute right-3 top-3 text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors duration-200 ease-out hover:text-white"
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-medium tracking-[-0.01em] text-foreground">{name}</h3>
          <span className="shrink-0 text-[17px] font-medium text-foreground">{price}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> {location}
          </span>
          <Badge className="rounded-full bg-accent font-normal text-foreground">
            AI Match {match}
          </Badge>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Inclusions
        </p>
        <ul className="mt-3 space-y-2">
          {inclusions.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-[14px] text-foreground">
              <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} /> {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full px-4 text-[14px] font-normal text-foreground hover:bg-muted"
          >
            View details
          </Button>
          <Button className="rounded-full bg-foreground px-5 text-[14px] font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90">
            Request a tour
          </Button>
        </div>
      </div>
    </Card>
  )
}
