import type { ReactNode } from 'react'
import logo from '#/assets/logo.svg'

interface AuthLayoutProps {
  image: string
  imageAlt: string
  caption?: { status: string; title: string }
  children: ReactNode
}

export function AuthLayout({ image, imageAlt, caption, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <a href="/" className="flex items-center gap-2 self-start">
          <img src={logo} alt="EventBid" className="h-7 w-auto" />
          <span className="text-[17px] text-foreground">EventBid</span>
        </a>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm py-10">{children}</div>
        </div>

        <p className="self-start font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Venues compete · You choose
        </p>
      </div>

      {/* Image side */}
      <div className="relative hidden lg:block">
        <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
        {caption && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent p-12">
            <div className="max-w-md">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-background/80">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {caption.status}
              </p>
              <p className="mt-3 font-serif text-[34px] font-normal leading-[1.12] text-background">
                {caption.title}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
