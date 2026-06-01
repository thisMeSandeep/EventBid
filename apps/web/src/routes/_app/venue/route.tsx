import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/venue')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'venue_rep') {
      throw redirect({ to: '/host/briefs' })
    }
  },
  component: () => <Outlet />,
})
