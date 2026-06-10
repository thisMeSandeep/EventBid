// Loading placeholder for list pages — muted pulse rows the same height as the
// real rows (design §7). Default 3 rows.
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[96px] animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}
