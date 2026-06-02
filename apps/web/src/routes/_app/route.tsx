import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { meQuery } from '#/server/auth'
import { sse } from '#/lib/sse'
import { UNAUTHORIZED_EVENT } from '#/lib/api-client'
import { useSseInvalidations } from '#/hooks/use-sse-invalidations'
import { NavBar } from '#/components/app/NavBar'

export const Route = createFileRoute('/_app')({
  // Auth is resolved from the session cookie, which only exists in the browser.
  // Render this subtree client-side so beforeLoad runs where the cookie is
  // available — otherwise a hard refresh redirects to /login.
  ssr: false,
  beforeLoad: async ({ context: { queryClient }, location }) => {
    const user = await queryClient.ensureQueryData(meQuery)
    if (!user) {
      throw redirect({ to: '/login', search: { next: location.href } })
    }
    // First-time users (email or Google) have no role yet — funnel them to
    // role selection before they can reach the app.
    if (!user.role) {
      throw redirect({ to: '/onboarding/role' })
    }
    return { user: { ...user, role: user.role } }
  },
  component: AppShell,
})

function AppShell() {
  const { user } = Route.useRouteContext()
  const queryClient = useQueryClient()
  const router = useRouter()

  // One EventSource for the whole authenticated session. Lives at the layout
  // level so it survives in-app navigation; closed on sign-out / unmount.
  useEffect(() => {
    sse.connect()
    return () => sse.disconnect()
  }, [])

  // A 401 anywhere in the app (published by the API client) clears the cache
  // and bounces to /login.
  useEffect(() => {
    function onUnauthorized() {
      queryClient.clear()
      router.navigate({ to: '/login' })
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [queryClient, router])

  // Map incoming SSE events to precise cache invalidations.
  useSseInvalidations()

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />
      {/* pt-14 offsets the fixed nav height */}
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  )
}
