import type { ReactNode } from 'react'
import logo from '#/assets/logo.svg'

interface AuthLayoutProps {
  image: string
  imageAlt: string
  caption?: { title: string; subtitle: string }
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
      </div>

      {/* Image side */}
      <div className="relative hidden lg:block">
        <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
        {caption && (
          <div className="absolute inset-0 flex items-end bg-foreground/15 p-12">
            <div className="max-w-sm">
              <p className="font-serif text-[30px] font-normal leading-[1.15] text-white">
                {caption.title}
              </p>
              <p className="mt-2.5 text-[14px] leading-[1.6] text-white/85">{caption.subtitle}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
