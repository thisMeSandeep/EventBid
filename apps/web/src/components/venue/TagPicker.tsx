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
              'rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-200 ease-out',
              on
                ? 'bg-foreground text-background'
                : 'border border-black/[0.06] bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            ].join(' ')}
          >
            {cap(o)}
          </button>
        )
      })}
    </div>
  )
}
