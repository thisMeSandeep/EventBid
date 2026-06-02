import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { venueMeQuery } from '#/server/venues'

export const Route = createFileRoute('/_app/venue')({
  beforeLoad: async ({ context, location }) => {
    // Hosts may view an individual venue's public profile (e.g. from a proposal
    // card), but not the venue rep workspace pages.
    const isPublicVenuePage =
      /^\/venue\/[^/]+$/.test(location.pathname) &&
      !/^\/venue\/(profile|feed|proposals)$/.test(location.pathname)

    if (context.user.role !== 'venue_rep') {
      if (isPublicVenuePage) return
      throw redirect({ to: '/host/briefs' })
    }

    // A venue rep who hasn't created a profile yet can't use the feed or submit
    // proposals — funnel them to the profile page first. The profile page and
    // public venue pages are always reachable.
    if (location.pathname === '/venue/profile' || isPublicVenuePage) return

    const venue = await context.queryClient.ensureQueryData(venueMeQuery)
    if (!venue) {
      throw redirect({ to: '/venue/profile' })
    }
  },
  component: () => <Outlet />,
})
