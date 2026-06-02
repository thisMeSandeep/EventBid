import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { makeQueryClient } from './lib/query-client'
import { RouteError } from './components/app/RouteError'
import { RouteSkeleton } from './components/app/RouteSkeleton'
import { NotFound } from './components/app/NotFound'

export function getRouter() {
  const queryClient = makeQueryClient()

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    defaultErrorComponent: RouteError,
    defaultPendingComponent: RouteSkeleton,
    defaultNotFoundComponent: NotFound,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
