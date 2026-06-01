import { createFileRoute, redirect } from '@tanstack/react-router'
import { meQuery } from '#/server/auth'
import { RegisterForm } from '#/components/auth/RegisterForm'

export const Route = createFileRoute('/_public/register')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.fetchQuery(meQuery)
    if (user) throw redirect({ to: '/' })
  },
  component: RegisterPage,
})

function RegisterPage() {
  return <RegisterForm />
}
