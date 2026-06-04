import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import logo from '#/assets/logo.svg'

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="EventBid" className="h-7 w-auto" />
          <span className="text-[18px] tracking-tight text-foreground">EventBid</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            className="rounded-full font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <Link to="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
          >
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
