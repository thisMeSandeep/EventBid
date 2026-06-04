import { Users, Building2, CalendarDays } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import statsImage from '#/assets/stats-section-image.webp'

interface Stat {
  icon: LucideIcon
  number: string
  label: string
}

const stats: Array<Stat> = [
  { icon: Users, number: '2,000+', label: 'Happy hosts' },
  { icon: Building2, number: '1,200+', label: 'Verified venues' },
  { icon: CalendarDays, number: '4.8/5', label: 'Average rating' },
]

export function StatsBar() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 md:grid-cols-5 md:px-8 lg:gap-16">
        <div className="md:col-span-2">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl">
            <img
              src={statsImage}
              alt="Happy couple celebrating"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 md:col-span-3">
          {stats.map(({ icon: Icon, number, label }) => (
            <div key={label} className="flex flex-col items-start">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <p className="mt-4 font-serif text-[52px] font-normal leading-none text-foreground">
                {number}
              </p>
              <p className="mt-2 text-[14px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
