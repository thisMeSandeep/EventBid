import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/venue')({
  beforeLoad: ({ context, location }) => {
    if (context.user.role === 'venue_rep') return
    // Hosts may view an individual venue's public profile (e.g. from a proposal
    // card), but not the venue rep workspace pages.
    const isPublicVenuePage =
      /^\/venue\/[^/]+$/.test(location.pathname) &&
      !/^\/venue\/(profile|feed|proposals)$/.test(location.pathname)
    if (isPublicVenuePage) return
    throw redirect({ to: '/host/briefs' })
  },
  component: () => <Outlet />,
})
