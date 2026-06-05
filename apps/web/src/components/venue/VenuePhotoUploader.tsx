import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Images, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { VenuePhoto } from '@eventbid/shared'
import {
  deleteVenuePhoto,
  uploadVenuePhoto,
  type VenueWithPhotos,
} from '#/server/venues'
import { qk } from '#/lib/query-keys'
import { Button } from '#/components/ui/button'
import { VenuePhotoGrid } from './VenuePhotoGrid'

const MAX_PHOTOS = 6
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function VenuePhotoUploader({ photos }: { photos: VenuePhoto[] }) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const atLimit = photos.length >= MAX_PHOTOS

  const upload = useMutation({
    mutationFn: (file: File) => uploadVenuePhoto(file),
    onSuccess: () => {
      toast.success('Photo uploaded')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.venues.me })
    },
  })

  const remove = useMutation({
    mutationFn: (photoId: string) => deleteVenuePhoto(photoId),
    onMutate: async (photoId) => {
      await queryClient.cancelQueries({ queryKey: qk.venues.me })
      const previous = queryClient.getQueryData<VenueWithPhotos | null>(qk.venues.me)
      if (previous) {
        queryClient.setQueryData<VenueWithPhotos>(qk.venues.me, {
          ...previous,
          photos: previous.photos.filter((p) => p.id !== photoId),
        })
      }
      return { previous }
    },
    onError: (err, _photoId, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(qk.venues.me, ctx.previous)
      }
      toast.error(err instanceof Error ? err.message : 'Failed to delete photo')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.venues.me })
    },
  })

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image must be under 5 MB')
      return
    }
    upload.mutate(file)
  }

  return (
    <section className="rounded-xl border border-black/[0.06] bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <Images className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-medium text-foreground">Photos</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Show off your space — up to {MAX_PHOTOS} images.
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {photos.length} / {MAX_PHOTOS}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <VenuePhotoGrid
        photos={photos}
        onDelete={(id) => remove.mutate(id)}
        deletingId={remove.isPending ? (remove.variables ?? null) : null}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
        <Button
          type="button"
          variant="outline"
          disabled={atLimit || upload.isPending}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border-black/[0.06] font-normal transition-colors duration-200 ease-out hover:bg-muted/60"
        >
          {upload.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Add photo
            </>
          )}
        </Button>
        {atLimit && (
          <p className="text-xs text-muted-foreground">
            Maximum of {MAX_PHOTOS} photos reached.
          </p>
        )}
      </div>
    </section>
  )
}
