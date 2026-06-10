interface Stage {
  state: string
  title: string
  body: string
  artifact: string
  /** The final state gets the primary fill — the brief's journey ends in amber. */
  done?: boolean
}

// These are the actual states a brief moves through on the platform —
// the numbering is the product's own sequence, not decoration.
const stages: Array<Stage> = [
  {
    state: '01 · Published',
    title: 'Publish once, never repeat yourself.',
    body: 'Set the date, guest count, budget and must-haves, plus a response deadline. EventBid notifies every venue that fits your brief — you never search, and the timeline is fixed and fair for everyone bidding.',
    artifact: 'Response deadline · Jun 18, 6:00 pm',
  },
  {
    state: '02 · Proposals in',
    title: 'Venues answer the same questions.',
    body: 'Each proposal arrives in one structure — total price, inclusions, availability — so offers are comparable instead of a pile of PDFs and phone calls. Venues can revise until your deadline, and you always see the latest version.',
    artifact: 'Rev 2 · price updated to $6,250',
  },
  {
    state: '03 · Compared',
    title: 'Trade-offs in plain language.',
    body: 'Every proposal is scored against your brief. Gaps are flagged before you commit, and the differences are explained in plain English — you compare on substance, not formatting.',
    artifact: '92% match · 1 gap flagged',
  },
  {
    state: '04 · Locked',
    title: 'Accept one, the rest close themselves.',
    body: 'Locking a deal is atomic: your venue’s contact details are shared with you, every other proposal closes automatically, and the brief is sealed as a permanent read-only record.',
    artifact: 'Deal locked · contacts shared',
    done: true,
  },
]

export function Lifecycle() {
  return (
    <section className="bg-muted py-28 md:py-32">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          The lifecycle of a brief
        </p>
        <h2 className="mt-4 max-w-[560px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
          What happens after you post
        </h2>

        <div className="mt-14">
          {stages.map(({ state, title, body, artifact, done }) => (
            <div
              key={state}
              className="grid gap-4 border-t border-border py-10 md:grid-cols-[220px_1fr] md:gap-8"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                {state}
              </p>
              <div>
                <h3 className="font-serif text-[26px] font-normal leading-[1.15] text-foreground">
                  {title}
                </h3>
                <p className="mt-3 max-w-[560px] text-[15px] leading-[1.7] text-muted-foreground">
                  {body}
                </p>
                <span
                  className={`mt-5 inline-block rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] ${
                    done
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-muted-foreground'
                  }`}
                >
                  {artifact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
