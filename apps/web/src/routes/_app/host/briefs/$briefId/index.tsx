import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { briefQuery } from '#/server/briefs'
import { BriefSummaryBlock } from '#/components/brief/BriefSummaryBlock'

export const Route = createFileRoute('/_app/host/briefs/$briefId/')({
  component: BriefDetailIndex,
})

function BriefDetailIndex() {
  const { briefId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))

  if (!brief) return null

  return (
    <div className="mt-6 space-y-8">
      <BriefSummaryBlock brief={brief} />

      <section>
        <h2 className="text-base font-medium text-foreground">Proposals</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Proposal cards arrive in Step 17.
        </p>
      </section>
    </div>
  )
}
