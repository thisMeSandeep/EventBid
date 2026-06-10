import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
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

  return (
    <div className="mt-2">
      <Link
        to="/host/briefs/$briefId"
        params={{ briefId }}
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to brief
      </Link>
      <h1 className="mt-6 font-serif text-[32px] font-normal tracking-[-0.01em] text-foreground">
        Edit brief
      </h1>
      <BriefEditForm brief={brief} />
    </div>
  )
}
