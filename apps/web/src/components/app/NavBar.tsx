import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, Menu } from 'lucide-react'
import type { SessionUser } from '#/server/auth'
import { UserMenu } from './UserMenu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'

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
  ]
}

interface NavBarProps {
  user: SessionUser
}

export function NavBar({ user }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const links = getNavLinks(user.role)

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-border bg-card">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-base font-semibold text-foreground tracking-tight"
        >
          EventBid
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
              activeProps={{ className: 'text-primary font-medium' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell — wired in Step 32 */}
          <button
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <UserMenu user={user} />

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left text-base font-semibold text-foreground">
                  EventBid
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col">
                {links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="py-4 text-lg text-muted-foreground transition-colors duration-150 hover:text-foreground border-b border-border"
                    activeProps={{ className: 'text-primary font-medium' }}
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
