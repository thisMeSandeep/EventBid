import { Check } from 'lucide-react'
import { cn } from '#/lib/utils.ts'

type Role = 'host' | 'venue_rep'

interface RoleSelectorProps {
  value: Role | ''
  onChange: (role: Role) => void
}

const roles = [
  {
    value: 'host' as Role,
    tag: 'Host',
    label: "I'm planning an event",
    description: 'Post a brief and let venues come to you',
  },
  {
    value: 'venue_rep' as Role,
    tag: 'Venue',
    label: 'I represent a venue',
    description: 'Receive matching briefs and send proposals',
  },
]

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      {roles.map((role) => {
        const selected = value === role.value
        return (
          <button
            key={role.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(role.value)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transform-none',
              selected ? 'border-primary bg-accent/40' : 'border-border bg-card hover:bg-muted/50',
            )}
          >
            <span
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em]',
                selected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {role.tag}
            </span>

            <div className="flex-1">
              <p className="text-[15px] font-medium text-foreground">{role.label}</p>
              <p className="mt-0.5 text-[13px] leading-[1.5] text-muted-foreground">
                {role.description}
              </p>
            </div>

            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ease-out',
                selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
              )}
            >
              {selected && <Check className="h-3 w-3" strokeWidth={2.5} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
