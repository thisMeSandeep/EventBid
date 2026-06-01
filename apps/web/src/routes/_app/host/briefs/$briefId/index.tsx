import { createFileRoute } from '@tanstack/react-router'

// Placeholder — brief detail page is built in Step 16.
export const Route = createFileRoute('/_app/host/briefs/$briefId/')({
  component: BriefDetailPlaceholder,
})

function BriefDetailPlaceholder() {
  const { briefId } = Route.useParams()
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground">Brief detail</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Coming soon — brief <code>{briefId}</code>.
      </p>
    </div>
  )
}
