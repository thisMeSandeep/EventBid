import { createFileRoute } from '@tanstack/react-router'

// Placeholder — brief creation wizard is built in Step 14.
export const Route = createFileRoute('/_app/host/briefs/new')({
  component: () => (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold text-foreground">Create Brief</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  ),
})
