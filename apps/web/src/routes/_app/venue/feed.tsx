import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { eventTypes } from '@eventbid/shared'
import { feedQuery } from '#/server/venues'
import { FeedRow } from '#/components/venue/FeedRow'
import { EmptyState } from '#/components/app/EmptyState'
import { ListSkeleton } from '#/components/app/ListSkeleton'

const searchSchema = z.object({
  cursor: z.string().optional(),
  eventType: z.string().optional(),
})

export const Route = createFileRoute('/_app/venue/feed')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ cursor: search.cursor }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(feedQuery({ cursor: deps.cursor })),
  component: VenueFeedPage,
  pendingComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground">Brief Feed</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Events looking for venues like yours
      </p>
      <div className="mt-8">
        <ListSkeleton />
      </div>
    </div>
  ),
})

const label = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

const FILTERS: { value?: string; label: string }[] = [
  { value: undefined, label: 'All' },
  ...eventTypes.map((t) => ({ value: t, label: label(t) })),
]

function VenueFeedPage() {
  const { cursor, eventType } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data } = useQuery(feedQuery({ cursor }))

  const matches = (data?.data ?? []).filter(
    (m) => !eventType || m.brief.eventType === eventType,
  )

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground">Brief Feed</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Events looking for venues like yours
      </p>

      {/* Event type filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = eventType === f.value || (!eventType && !f.value)
          return (
            <button
              key={f.label}
              type="button"
              onClick={() =>
                navigate({
                  search: (prev) => ({ ...prev, eventType: f.value, cursor: undefined }),
                })
              }
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              ].join(' ')}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {matches.length === 0 ? (
          <EmptyState
            title="No matched briefs yet"
            description="When a host posts an event that fits your venue, it'll show up here."
          />
        ) : (
          <div>
            {matches.map((match) => (
              <FeedRow key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
