import { Quote } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Avatar, AvatarImage } from '#/components/ui/avatar'
import { Separator } from '#/components/ui/separator'
import person1 from '#/assets/person1.webp'
import person2 from '#/assets/person2.webp'
import person3 from '#/assets/person3.webp'

const testimonials = [
  {
    quote:
      'I had five proposals side by side in two days. The AI summary spotted that one venue never confirmed my date — I would have missed it completely.',
    name: 'Priya & Arjun',
    role: 'Wedding hosts, Melbourne',
    avatar: person1,
  },
  {
    quote:
      'Every brief that reaches us is an actual fit for our space. We send one clean proposal instead of ten WhatsApp messages, and we close far more of them.',
    name: 'Daniel Brooks',
    role: 'Events Manager, The Grand Ballroom',
    avatar: person2,
  },
  {
    quote:
      'Planning my 40th felt overwhelming until everything was in one place. Comparing prices and inclusions took minutes, not weeks.',
    name: 'Sophie Tan',
    role: 'Birthday host, Sydney',
    avatar: person3,
  },
]

export function Testimonials() {
  return (
    <section className="bg-muted py-28 md:py-32">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Loved by both sides
          </p>
          <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Hosts and venues, on the same page
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, name, role, avatar }) => (
            <Card
              key={name}
              className="flex flex-col gap-0 rounded-2xl border-transparent bg-card p-8 shadow-none transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-20px_rgba(0,0,0,0.18)] motion-reduce:transform-none"
            >
              <Quote className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <blockquote className="mt-5 flex-1 font-serif text-[20px] leading-[1.5] text-foreground">
                {quote}
              </blockquote>
              <Separator className="mt-7 bg-border/60" />
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src={avatar} alt="" />
                </Avatar>
                <div>
                  <p className="text-[14px] font-medium text-foreground">{name}</p>
                  <p className="text-[13px] text-muted-foreground">{role}</p>
                </div>
              </figcaption>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
