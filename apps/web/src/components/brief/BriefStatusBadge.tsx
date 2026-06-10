interface BriefStatusBadgeProps {
  status: string
}

const styles: Record<string, string> = {
  open: 'border border-border bg-card text-foreground',
  evaluating: 'bg-accent text-accent-foreground',
  closed: 'bg-muted text-muted-foreground',
  expired: 'bg-destructive/10 text-destructive',
}

const labels: Record<string, string> = {
  open: 'Open',
  evaluating: 'Evaluating',
  closed: 'Closed',
  expired: 'Expired',
}

export function BriefStatusBadge({ status }: BriefStatusBadgeProps) {
  const cls = styles[status] ?? 'bg-muted text-muted-foreground'
  const label = labels[status] ?? status
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${cls}`}
    >
      {status === 'open' && (
        <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
      )}
      {label}
    </span>
  )
}
