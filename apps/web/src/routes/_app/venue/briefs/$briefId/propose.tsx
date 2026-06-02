import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { briefQuery } from '#/server/briefs'
import { myProposalsQuery } from '#/server/proposals'
import { ProposalForm } from '#/components/proposal/ProposalForm'
import { formatDate } from '#/lib/format'

export const Route = createFileRoute('/_app/venue/briefs/$briefId/propose')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(myProposalsQuery()),
  component: ProposePage,
})

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function ProposePage() {
  const { briefId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))
  const { data: proposals } = useQuery(myProposalsQuery())

  const existing =
    proposals?.data.find((p) => p.briefId === briefId && p.status === 'active') ??
    null

  if (!brief) return null

  return (
    <>
      <Link
        to="/venue/briefs/$briefId"
        params={{ briefId }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to brief
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-foreground">
        {existing ? 'Revise your Proposal' : 'Submit a Proposal'}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {cap(brief.eventType)} · {formatDate(brief.eventDateFrom)} · {brief.headcount}{' '}
        guests
      </p>

      <ProposalForm briefId={briefId} existing={existing} />
    </>
  )
}
