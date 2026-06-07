import {
  MessagesSquare,
  FileX,
  PhoneCall,
  Check,
  Sparkles,
  FileText,
  ArrowRight,
  X,
} from 'lucide-react'

const before = [
  { icon: MessagesSquare, text: 'Endless WhatsApp threads and phone tag with each venue' },
  { icon: FileX, text: 'Every quote arrives in a different format — impossible to compare' },
  { icon: PhoneCall, text: 'Chasing venues one by one, repeating your details every time' },
]

const after = [
  { icon: FileText, text: 'Describe your event once — matching venues come to you' },
  { icon: Check, text: 'Every proposal in one standard format, side by side' },
  { icon: Sparkles, text: 'AI scores each option so you decide with confidence' },
]

export function BeforeAfter() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            The old way vs EventBid
          </p>
          <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Stop juggling chats, PDFs and phone calls
          </h2>
        </div>

        <div className="relative mt-16 grid items-stretch gap-6 md:grid-cols-2 md:gap-0">
          {/* Before */}
          <div className="relative rounded-2xl border border-border/60 bg-muted/40 p-8 md:rounded-r-none md:border-r-0 md:p-10">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground">
                <X className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Without EventBid
              </p>
            </div>
            <ul className="space-y-5">
              {before.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background/70 text-muted-foreground">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </span>
                  <span className="text-[15px] leading-[1.65] text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connector */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>

          {/* After */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-8 shadow-[0_1px_30px_-12px] shadow-primary/25 md:rounded-l-none md:p-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
            <div className="mb-7 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">With EventBid</p>
            </div>
            <ul className="space-y-5">
              {after.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="text-[15px] leading-[1.65] text-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
