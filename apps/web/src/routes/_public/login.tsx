import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { meQuery } from '#/server/auth'
import { LoginForm } from '#/components/auth/LoginForm'

const searchSchema = z.object({
  next: z.string().optional(),
})

export const Route = createFileRoute('/_public/login')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.fetchQuery(meQuery)
    if (user) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const { next } = Route.useSearch()
  return <LoginForm next={next} />
}
