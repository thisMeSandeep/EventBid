import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { meQuery } from '#/server/auth'
import { redirectAuthenticatedHome } from '#/lib/auth-redirect'
import { LoginForm } from '#/components/auth/LoginForm'

const searchSchema = z.object({
  next: z.string().optional(),
  // Set by Better Auth's OAuth flow on failure, e.g. ?error=account_not_linked
  error: z.string().optional(),
})

export const Route = createFileRoute('/_public/login')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.fetchQuery(meQuery)
    redirectAuthenticatedHome(user)
  },
  component: LoginPage,
})

function LoginPage() {
  const { next, error } = Route.useSearch()
  return <LoginForm next={next} error={error} />
}
