// Default route pending component. A few muted pulse rows that roughly match
// the list/detail layouts. Per-route skeletons are refined in Step 35.
export function RouteSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}
