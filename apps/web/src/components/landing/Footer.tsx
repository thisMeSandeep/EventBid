import { Instagram, Facebook, Linkedin } from 'lucide-react'
import { Separator } from '#/components/ui/separator'
import logo from '#/assets/logo.svg'

const columns = [
  {
    title: 'Platform',
    links: ['How it works', 'Browse venues', 'Pricing', 'For venues'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Event planning guide', 'Venue checklist', 'Help center'],
  },
]

const socials = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Linkedin, label: 'LinkedIn' },
]

function FooterLink({ children }: { children: string }) {
  return (
    <a
      href="#"
      className="text-[13px] text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-foreground hover:underline"
    >
      {children}
    </a>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-background py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-4 md:gap-16">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2">
              <img src={logo} alt="EventBid" className="h-7 w-auto" />
              <span className="text-[17px] text-foreground">EventBid</span>
            </div>
            <p className="mt-4 max-w-[220px] text-[13px] leading-[1.6] text-muted-foreground">
              The smart way to find and compare event venues.
            </p>
            <div className="mt-5 flex items-center gap-4">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-medium text-foreground">{col.title}</p>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <FooterLink>{link}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Company + Legal */}
          <div>
            <p className="text-[13px] font-medium text-foreground">Company</p>
            <ul className="mt-5 space-y-3.5">
              {['About us', 'Contact us', 'Careers', 'Press'].map((link) => (
                <li key={link}>
                  <FooterLink>{link}</FooterLink>
                </li>
              ))}
            </ul>
            <p className="mt-7 text-[13px] font-medium text-foreground">Legal</p>
            <ul className="mt-5 space-y-3.5">
              {['Terms of service', 'Privacy policy', 'Cookie policy'].map((link) => (
                <li key={link}>
                  <FooterLink>{link}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mt-14 bg-border/60" />
        <p className="pt-7 text-center text-[12px] text-muted-foreground">
          © 2026 EventBid. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
