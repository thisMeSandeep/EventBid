const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

interface TagPickerProps {
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
}

export function TagPicker({ options, value, onChange }: TagPickerProps) {
  const toggle = (t: string) =>
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t])

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
              on
                ? 'bg-accent/60 text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70',
            ].join(' ')}
          >
            {cap(o)}
          </button>
        )
      })}
    </div>
  )
}
