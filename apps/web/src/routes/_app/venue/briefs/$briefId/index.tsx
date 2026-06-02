import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { briefQuery } from '#/server/briefs'
import { BriefSummaryBlock } from '#/components/brief/BriefSummaryBlock'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/venue/briefs/$briefId/')({
  component: VenueBriefReadPage,
})

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function VenueBriefReadPage() {
  const { briefId } = Route.useParams()
  const { data: brief } = useQuery(briefQuery(briefId))

  if (!brief) return null

  const isOpen = brief.status === 'open'

  return (
    <>
      <Link
        to="/venue/feed"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Brief Feed
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <h1 className="text-xl font-semibold text-foreground">{cap(brief.eventType)}</h1>
        {isOpen && (
          <Button asChild size="sm">
            <Link to="/venue/briefs/$briefId/propose" params={{ briefId }}>
              Submit a Proposal
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-6">
        <BriefSummaryBlock brief={brief} />
      </div>

      {!isOpen && (
        <p className="mt-4 text-sm text-muted-foreground">
          This brief is no longer accepting proposals.
        </p>
      )}
    </>
  )
}
