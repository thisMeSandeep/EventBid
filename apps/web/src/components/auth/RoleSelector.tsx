import { CalendarDays, Building2 } from 'lucide-react'

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
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => {
        const Icon = role.icon
        const selected = value === role.value
        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={[
              'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors duration-150',
              selected
                ? 'border-primary bg-accent'
                : 'border-border bg-card hover:bg-muted/50',
            ].join(' ')}
          >
            <Icon
              className={[
                'h-5 w-5',
                selected ? 'text-accent-foreground' : 'text-muted-foreground',
              ].join(' ')}
            />
            <div>
              <p
                className={[
                  'text-sm font-medium',
                  selected ? 'text-accent-foreground' : 'text-foreground',
                ].join(' ')}
              >
                {role.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {role.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
