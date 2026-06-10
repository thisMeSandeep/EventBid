import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { briefsListQuery } from '#/server/briefs'
import { BriefListRow } from '#/components/brief/BriefListRow'
import { EmptyState } from '#/components/app/EmptyState'
import { ListSkeleton } from '#/components/app/ListSkeleton'
import { Button } from '#/components/ui/button'

const searchSchema = z.object({
  cursor: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/_app/host/briefs/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ cursor: search.cursor }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(briefsListQuery({ cursor: deps.cursor })),
  component: HostBriefsPage,
  pendingComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-serif text-[28px] font-normal tracking-[-0.01em] text-foreground">
        My briefs
      </h1>
      <div className="mt-8">
        <ListSkeleton />
      </div>
    </div>
  ),
})

const FILTERS: { value?: string; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'evaluating', label: 'Evaluating' },
  { value: 'closed', label: 'Closed' },
  { value: 'expired', label: 'Expired' },
]

function HostBriefsPage() {
  const { cursor, status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data } = useQuery(briefsListQuery({ cursor }))

  const briefs = (data?.data ?? []).filter((b) => !status || b.status === status)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-[28px] font-normal tracking-[-0.01em] text-foreground">
          My briefs
        </h1>
        <Button
          asChild
          className="rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
        >
          <Link to="/host/briefs/new">Create brief</Link>
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = status === f.value || (!status && !f.value)
          return (
            <button
              key={f.label}
              type="button"
              onClick={() =>
                navigate({
                  search: (prev) => ({ ...prev, status: f.value, cursor: undefined }),
                })
              }
              className={[
                'rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 ease-out',
                active
                  ? 'bg-foreground text-background'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              ].join(' ')}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        {briefs.length === 0 ? (
          <EmptyState
            title="No briefs yet"
            description="Create your first brief to start receiving proposals from venues."
            action={
              <Button
                asChild
                className="rounded-full bg-foreground font-normal text-background hover:bg-foreground/90"
              >
                <Link to="/host/briefs/new">Create brief</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {briefs.map((brief) => (
              <BriefListRow key={brief.id} brief={brief} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
