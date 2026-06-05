import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Globe, Mail, MapPin, Phone, Users } from 'lucide-react'
import { venueByIdQuery, type VenueWithPhotos } from '#/server/venues'
import { VenueGallery } from '#/components/venue/VenueGallery'

export const Route = createFileRoute('/_app/venue/$venueId')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(venueByIdQuery(params.venueId)),
  component: PublicVenuePage,
})

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function PillGroup({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-black/[0.06] bg-muted/60 px-3 py-1 text-[13px] text-foreground"
        >
          {cap(item)}
        </span>
      ))}
    </div>
  )
}

function DetailRow({
  label,
  items,
}: {
  label: string
  items: string[] | null | undefined
}) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-3">
        <PillGroup items={items} />
      </div>
    </div>
  )
}

function PublicVenuePage() {
  const { venueId } = Route.useParams()
  const { data: venue } = useQuery(venueByIdQuery(venueId))

  if (!venue) return null

  return <VenueProfile venue={venue} />
}

function VenueProfile({ venue }: { venue: VenueWithPhotos }) {
  const router = useRouter()
  const photos = venue.photos ?? []
  const hasContact = venue.phone || venue.email || venue.website
  const hasOfferings =
    (venue.eventTypes?.length ?? 0) > 0 ||
    (venue.styleTags?.length ?? 0) > 0 ||
    (venue.amenities?.length ?? 0) > 0

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        type="button"
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mt-6">
        <h1 className="font-serif text-[28px] font-normal tracking-[-0.01em] text-foreground">
          {venue.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {venue.city}, {venue.state}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Up to {venue.maxCapacity.toLocaleString('en-IN')} guests
          </span>
        </div>
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="mt-8">
          <VenueGallery photos={photos} />
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* About */}
        {venue.description && (
          <section className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-base font-medium text-foreground">About</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {venue.description}
            </p>
          </section>
        )}

        {/* Offerings */}
        {hasOfferings && (
          <section className="space-y-6 rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-8">
            <DetailRow label="Event types" items={venue.eventTypes} />
            <DetailRow label="Style" items={venue.styleTags} />
            <DetailRow label="Amenities" items={venue.amenities} />
          </section>
        )}

        {/* Contact */}
        {hasContact && (
          <section className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-base font-medium text-foreground">Contact</h2>
            <div className="mt-4 space-y-3">
              {venue.phone && (
                <p className="flex items-center gap-2.5 text-sm text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {venue.phone}
                </p>
              )}
              {venue.email && (
                <a
                  href={`mailto:${venue.email}`}
                  className="flex items-center gap-2.5 text-sm text-foreground transition-colors hover:text-foreground/70"
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
                  className="flex items-center gap-2.5 text-sm text-foreground transition-colors hover:text-foreground/70"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {venue.website}
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
