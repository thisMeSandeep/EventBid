import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { myProposalsQuery } from '#/server/proposals'
import { MyProposalRow } from '#/components/proposal/MyProposalRow'
import { EmptyState } from '#/components/app/EmptyState'

const searchSchema = z.object({
  cursor: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/_app/venue/proposals')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ cursor: search.cursor }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(myProposalsQuery({ cursor: deps.cursor })),
  component: MyProposalsPage,
})

const FILTERS: { value?: string; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'locked', label: 'Locked' },
  { value: 'closed', label: 'Closed' },
  { value: 'superseded', label: 'Superseded' },
]

function MyProposalsPage() {
  const { cursor, status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data } = useQuery(myProposalsQuery({ cursor }))

  const all = data?.data ?? []
  const counts = all.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  const proposals = all.filter((p) => !status || p.status === status)

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground">My Proposals</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Proposals you've submitted across all briefs
      </p>

      {/* Status filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = status === f.value || (!status && !f.value)
          const count = f.value ? counts[f.value] ?? 0 : all.length
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
                'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              ].join(' ')}
            >
              {f.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {proposals.length === 0 ? (
          <EmptyState
            title="No proposals yet"
            description="Browse your brief feed and submit a proposal to see it tracked here."
          />
        ) : (
          <div>
            {proposals.map((proposal) => (
              <MyProposalRow key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
