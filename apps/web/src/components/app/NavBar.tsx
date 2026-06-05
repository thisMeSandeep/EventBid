import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import type { SessionUser } from '#/server/auth'
import { UserMenu } from './UserMenu'
import { NotificationBell } from './NotificationBell'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import logo from '#/assets/logo.svg'

interface NavLink {
  to: string
  label: string
}

function getNavLinks(role: SessionUser['role']): NavLink[] {
  if (role === 'host') {
    return [{ to: '/host/briefs', label: 'My Briefs' }]
  }
  return [
    { to: '/venue/feed', label: 'Brief Feed' },
    { to: '/venue/proposals', label: 'My Proposals' },
    { to: '/venue/profile', label: 'Profile' },
  ]
}

const linkClass =
  'rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted/60 hover:text-foreground data-[status=active]:bg-muted data-[status=active]:font-medium data-[status=active]:text-foreground'

interface NavBarProps {
  user: SessionUser
}

export function NavBar({ user }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const links = getNavLinks(user.role)
  // Keep the logo inside the app — never bounce a signed-in user to the landing page.
  const homeTo = user.role === 'host' ? '/host/briefs' : '/venue/feed'

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-black/[0.06] bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to={homeTo} className="flex items-center gap-2">
            <img src={logo} alt="EventBid" className="h-7 w-auto" />
            <span className="text-[17px] text-foreground">EventBid</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <NotificationBell user={user} />
          <UserMenu user={user} />

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <img src={logo} alt="" className="h-6 w-auto" />
                  <span className="text-[16px] font-normal text-foreground">EventBid</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[15px] text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted/60 hover:text-foreground data-[status=active]:bg-muted data-[status=active]:font-medium data-[status=active]:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
