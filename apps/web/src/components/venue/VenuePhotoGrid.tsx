import { Loader2, X } from 'lucide-react'
import type { VenuePhoto } from '@eventbid/shared'

interface VenuePhotoGridProps {
  photos: VenuePhoto[]
  onDelete: (photoId: string) => void
  deletingId?: string | null
}

export function VenuePhotoGrid({ photos, onDelete, deletingId }: VenuePhotoGridProps) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No photos yet. Add up to 6.</p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => {
        const isDeleting = deletingId === photo.id
        return (
          <div
            key={photo.id}
            className="group relative aspect-video overflow-hidden rounded-lg bg-muted"
          >
            <img
              src={photo.url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => onDelete(photo.id)}
              disabled={isDeleting}
              aria-label="Delete photo"
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm transition-opacity hover:bg-background group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
