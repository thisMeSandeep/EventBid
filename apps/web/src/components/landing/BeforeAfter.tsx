import { MessagesSquare, FileX, PhoneCall, Check, Sparkles, FileText } from 'lucide-react'
import { Card } from '#/components/ui/card'

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

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* Before */}
          <Card className="gap-0 border-transparent bg-muted/50 p-8 shadow-none md:p-10">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Without EventBid
            </p>
            <ul className="mt-7 space-y-6">
              {before.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3.5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-[15px] leading-[1.7] text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* After */}
          <Card className="gap-0 border-transparent border-l-[3px] border-l-primary bg-card p-8 shadow-none md:p-10">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">With EventBid</p>
            <ul className="mt-7 space-y-6">
              {after.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3.5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                  <span className="text-[15px] leading-[1.7] text-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  )
}
