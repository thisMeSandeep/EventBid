import { redirect } from '@tanstack/react-router'
import type { SessionUser } from '#/server/auth'

/**
 * Send an already-authenticated user away from public pages (landing, login,
 * register) to where they belong. Throws a router redirect, so call it from a
 * route's `beforeLoad`. No-op for anonymous visitors.
 */
export function redirectAuthenticatedHome(user: SessionUser | null): void {
  if (!user) return
  // Signed up but hasn't picked a role yet — finish onboarding first.
  if (!user.role) throw redirect({ to: '/onboarding/role' })
  throw redirect({ to: user.role === 'host' ? '/host/briefs' : '/venue/feed' })
}
