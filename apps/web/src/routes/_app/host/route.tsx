import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/host')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'host') {
      throw redirect({ to: '/venue/feed' })
    }
  },
  component: () => <Outlet />,
})
