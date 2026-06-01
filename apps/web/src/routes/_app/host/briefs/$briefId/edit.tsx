import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { briefQuery } from '#/server/briefs'
import { BriefEditForm } from '#/components/brief/BriefEditForm'

export const Route = createFileRoute('/_app/host/briefs/$briefId/edit')({
  beforeLoad: async ({ context: { queryClient }, params: { briefId } }) => {
    const brief = await queryClient.ensureQueryData(briefQuery(briefId))
    // Only open briefs are editable.
    if (brief.status !== 'open') {
      throw redirect({ to: '/host/briefs/$briefId', params: { briefId } })
    }
  },
  component: EditBriefPage,
})

function EditBriefPage() {
  const { briefId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))

  if (!brief) return null

  return <BriefEditForm brief={brief} />
}
