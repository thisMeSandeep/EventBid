import { createFileRoute, Outlet } from '@tanstack/react-router'
import { briefQuery } from '#/server/briefs'

export const Route = createFileRoute('/_app/venue/briefs/$briefId')({
  loader: ({ context: { queryClient }, params: { briefId } }) =>
    queryClient.ensureQueryData(briefQuery(briefId)),
  pendingMs: 200,
  pendingMinMs: 400,
  component: () => (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Outlet />
    </div>
  ),
})
