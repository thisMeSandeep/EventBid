import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { venueMeQuery } from '#/server/venues'
import { VenueProfileForm } from '#/components/venue/VenueProfileForm'
import { VenuePhotoUploader } from '#/components/venue/VenuePhotoUploader'

export const Route = createFileRoute('/_app/venue/profile')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(venueMeQuery),
  component: VenueProfilePage,
})

function VenueProfilePage() {
  const { data: venue } = useQuery(venueMeQuery)
  return (
    <>
      <VenueProfileForm venue={venue ?? null} />
      {venue && (
        <div className="mx-auto max-w-2xl px-6 pb-8">
          <VenuePhotoUploader photos={venue.photos ?? []} />
        </div>
      )}
    </>
  )
}
