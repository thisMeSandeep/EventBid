import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ApiError } from '#/lib/api-client'
import { Button } from '#/components/ui/button'

// Default route error boundary. FORBIDDEN gets domain copy; everything else is
// the generic 500-style message per design §8 (no technical details). Logging
// is wired in Step 36.
export function RouteError({ error, reset }: ErrorComponentProps) {
  const isForbidden = error instanceof ApiError && error.code === 'FORBIDDEN'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-base font-medium text-foreground">
        {isForbidden
          ? "You don't have access to this page."
          : 'Something went wrong on our end.'}
      </h1>
      {!isForbidden && (
        <p className="mt-1 text-sm text-muted-foreground">
          We've been notified. Please try again.
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
