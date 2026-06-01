import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { meQuery } from '#/server/auth'
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
