import { FileText, Building2, Scale } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Separator } from '#/components/ui/separator'

interface Step {
  number: string
  icon: LucideIcon
  title: string
  body: string
}

const steps: Array<Step> = [
  {
    number: '01',
    icon: FileText,
    title: 'Post your brief',
    body: 'Tell us about your event, guest count, budget and must-haves in a few simple steps.',
  },
  {
    number: '02',
    icon: Building2,
    title: 'Venues submit proposals',
    body: 'Suitable venues send custom proposals with pricing, inclusions and availability.',
  },
  {
    number: '03',
    icon: Scale,
    title: 'Compare & decide',
    body: 'Review proposals side-by-side, compare details and select the perfect venue.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted py-28 md:py-32">
      <div className="mx-auto max-w-[1180px] px-6 text-center md:px-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">How it works</p>
        <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
          Three simple steps to your ideal venue
        </h2>

        <div className="relative mt-16 grid gap-14 md:grid-cols-3 md:gap-12">
          {/* connector line — sits behind the icons, masked by the section bg */}
          <Separator className="absolute left-0 right-0 top-[18px] hidden bg-border/60 md:block" />

          {steps.map(({ number, icon: Icon, title, body }) => (
            <div key={number} className="relative flex flex-col items-center">
              <span className="relative z-10 bg-muted px-4">
                <Icon className="h-9 w-9 text-primary" strokeWidth={1.25} />
              </span>
              <p className="mt-6 font-serif text-[20px] text-primary">{number}</p>
              <h3 className="mt-2 text-[19px] font-medium tracking-[-0.01em] text-foreground">
                {title}
              </h3>
              <p className="mt-3 max-w-[300px] text-[15px] leading-[1.7] text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
