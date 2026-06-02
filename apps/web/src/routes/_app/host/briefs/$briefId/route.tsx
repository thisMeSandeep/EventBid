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
  // Delay the pending state so quick loads don't flash, and hold it briefly
  // once shown. The header renders from SSR/cache on refresh, so the skeleton
  // only appears on slow client-side navigation.
  pendingMs: 200,
  pendingMinMs: 400,
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
