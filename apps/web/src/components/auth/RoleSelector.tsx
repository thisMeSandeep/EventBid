import { CalendarDays, Building2, Check } from 'lucide-react'
import { cn } from '#/lib/utils.ts'

type Role = 'host' | 'venue_rep'

interface RoleSelectorProps {
  value: Role | ''
  onChange: (role: Role) => void
}

const roles = [
  {
    value: 'host' as Role,
    icon: CalendarDays,
    label: "I'm planning an event",
    description: 'Find and book venues for your event',
  },
  {
    value: 'venue_rep' as Role,
    icon: Building2,
    label: 'I represent a venue',
    description: 'List your venue and receive proposals',
  },
]

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      {roles.map((role) => {
        const Icon = role.icon
        const selected = value === role.value
        return (
          <button
            key={role.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(role.value)}
            className={cn(
              'flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transform-none',
              selected
                ? 'border-primary bg-accent/40'
                : 'border-black/[0.06] bg-card hover:bg-muted/50',
            )}
          >
            <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} />

            <div className="flex-1">
              <p className="text-[15px] font-medium text-foreground">{role.label}</p>
              <p className="mt-0.5 text-[13px] leading-[1.5] text-muted-foreground">
                {role.description}
              </p>
            </div>

            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ease-out',
                selected ? 'border-primary bg-primary text-primary-foreground' : 'border-black/15',
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
