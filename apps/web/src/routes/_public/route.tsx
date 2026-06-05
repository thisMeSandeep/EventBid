import { createFileRoute, Outlet } from '@tanstack/react-router'
import { noindexMeta } from '#/lib/seo'

export const Route = createFileRoute('/_public')({
  // Auth pages (login, register) carry no SEO value — keep them out of the index.
  head: () => ({ meta: noindexMeta() }),
  component: () => <Outlet />,
})
