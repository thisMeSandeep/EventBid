import { createFileRoute } from '@tanstack/react-router'
import { meQuery } from '#/server/auth'
import { redirectAuthenticatedHome } from '#/lib/auth-redirect'
import { RegisterForm } from '#/components/auth/RegisterForm'

export const Route = createFileRoute('/_public/register')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.fetchQuery(meQuery)
    redirectAuthenticatedHome(user)
  },
  component: RegisterPage,
})

function RegisterPage() {
  return <RegisterForm />
}
