import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Globe, Mail, MapPin, Phone, Users } from 'lucide-react'
import type { Venue } from '@eventbid/shared'
import { venueByIdQuery } from '#/server/venues'

export const Route = createFileRoute('/_app/venue/$venueId')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(venueByIdQuery(params.venueId)),
  component: PublicVenuePage,
})

function Pills({ items }: { items: string[] }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function DetailRow({ label, items }: { label: string; items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Pills items={items} />
    </div>
  )
}

function PublicVenuePage() {
  const { venueId } = Route.useParams()
  const { data: venue } = useQuery(venueByIdQuery(venueId))

  if (!venue) return null

  return <VenueProfile venue={venue} />
}

function VenueProfile({ venue }: { venue: Venue }) {
  const hasContact = venue.phone || venue.email || venue.website

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Basic info */}
      <section>
        <h1 className="text-2xl font-semibold text-foreground">{venue.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {venue.city}, {venue.state}
        </p>
        {venue.description && (
          <p className="mt-4 text-sm leading-relaxed text-foreground">{venue.description}</p>
        )}
      </section>

      {/* Details */}
      <section className="mt-10 space-y-5">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Users className="h-4 w-4 text-muted-foreground" />
          Up to {venue.maxCapacity.toLocaleString('en-IN')} guests
        </div>
        <DetailRow label="Event types" items={venue.eventTypes} />
        <DetailRow label="Style" items={venue.styleTags} />
        <DetailRow label="Amenities" items={venue.amenities} />
      </section>

      {/* Contact */}
      {hasContact && (
        <section className="mt-10 space-y-2">
          <h2 className="text-base font-medium text-foreground">Contact</h2>
          {venue.phone && (
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {venue.phone}
            </p>
          )}
          {venue.email && (
            <a
              href={`mailto:${venue.email}`}
              className="flex items-center gap-1.5 text-sm text-foreground hover:underline"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {venue.email}
            </a>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-foreground hover:underline"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              {venue.website}
            </a>
          )}
        </section>
      )}
    </div>
  )
}
