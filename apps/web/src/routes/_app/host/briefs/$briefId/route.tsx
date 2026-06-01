import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { analysisQuery, briefQuery, proposalsQuery } from '#/server/briefs'
import { BriefDetailHeader } from '#/components/brief/BriefDetailHeader'

export const Route = createFileRoute('/_app/host/briefs/$briefId')({
  loader: ({ context: { queryClient }, params: { briefId } }) =>
    // Prefetch brief + proposals + analysis in parallel.
    Promise.all([
      queryClient.ensureQueryData(briefQuery(briefId)),
      queryClient.ensureQueryData(proposalsQuery(briefId)),
      queryClient.ensureQueryData(analysisQuery(briefId)),
    ]),
  component: BriefDetailLayout,
})

function BriefDetailLayout() {
  const { briefId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))
  const { data: proposals } = useQuery(proposalsQuery(briefId))

  if (!brief) return null

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <BriefDetailHeader brief={brief} proposalCount={proposals?.data.length ?? 0} />
      <Outlet />
    </div>
  )
}
