interface BriefStatusBadgeProps {
  status: string
}

const styles: Record<string, string> = {
  open: 'bg-emerald-50 text-emerald-700',
  evaluating: 'bg-accent text-primary',
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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  )
}
