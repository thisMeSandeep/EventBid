import { Link } from '@tanstack/react-router'

// Leaf-route 404 — design §8 Error Pages: simple centered message + back link.
export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-base font-medium text-foreground">
        This page doesn't exist.
      </h1>
      <Link
        to="/"
        className="mt-4 text-sm text-primary transition-colors duration-150 hover:underline"
      >
        Back to home
      </Link>
    </div>
  )
}
