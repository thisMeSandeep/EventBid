import { useState } from 'react'
import type { VenuePhoto } from '@eventbid/shared'

export function VenueGallery({ photos }: { photos: VenuePhoto[] }) {
  const [active, setActive] = useState(0)
  if (photos.length === 0) return null

  const hero = photos[active] ?? photos[0]

  return (
    <div className="space-y-3">
      <div className="aspect-[16/9] overflow-hidden rounded-xl border border-black/[0.06] bg-muted">
        <img src={hero.url} alt="" className="h-full w-full object-cover" />
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={[
                'aspect-square overflow-hidden rounded-lg border transition-all duration-200 ease-out',
                i === active
                  ? 'border-foreground ring-1 ring-foreground'
                  : 'border-black/[0.06] opacity-80 hover:opacity-100',
              ].join(' ')}
            >
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
