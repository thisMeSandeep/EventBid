const stats = [
  { number: '2,000+', label: 'Briefs from hosts' },
  { number: '1,200+', label: 'Verified venues' },
  { number: '4.8 / 5', label: 'Average rating' },
]

export function Proof() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto max-w-[840px] px-6 text-center md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          From a locked brief
        </p>
        <blockquote className="mt-8 font-serif text-[clamp(26px,3.4vw,38px)] font-normal leading-[1.35] tracking-[-0.01em] text-foreground">
          “I had five proposals side by side in two days. The AI summary spotted that one venue
          never confirmed my date — <em>I would have missed it completely.</em>”
        </blockquote>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Priya &amp; Arjun · Wedding for 120 · Melbourne
        </p>
      </div>

      <div className="mx-auto mt-20 max-w-[1180px] px-6 md:px-8">
        <div className="grid border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
          {stats.map(({ number, label }) => (
            <div key={label} className="py-9 text-center">
              <p className="font-serif text-[44px] font-normal leading-none text-foreground">
                {number}
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
