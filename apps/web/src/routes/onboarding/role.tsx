import { useState } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '#/lib/api-client'
import { authClient } from '#/lib/auth-client'
import { meQuery } from '#/server/auth'
import { noindexMeta } from '#/lib/seo'
import { qk } from '#/lib/query-keys'
import { RoleSelector } from '#/components/auth/RoleSelector'
import { Button } from '#/components/ui/button'
import logo from '#/assets/logo.svg'

type Role = 'host' | 'venue_rep'

const homeFor = (role: Role) => (role === 'venue_rep' ? '/venue/feed' : '/host/briefs')

export const Route = createFileRoute('/onboarding/role')({
  // Client-only: auth depends on the browser session cookie (see _app/route.tsx).
  ssr: false,
  head: () => ({ meta: noindexMeta() }),
  beforeLoad: async ({ context: { queryClient }, location }) => {
    const user = await queryClient.fetchQuery(meQuery)
    if (!user) {
      throw redirect({ to: '/login', search: { next: location.href } })
    }
    // Already onboarded → straight to the app.
    if (user.role) {
      throw redirect({ to: homeFor(user.role) })
    }
    return { user }
  },
  component: RolePage,
})

function RolePage() {
  const { user } = Route.useRouteContext()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [role, setRole] = useState<Role | ''>('')
  const [error, setError] = useState<string | null>(null)

  const roleMutation = useMutation({
    mutationFn: (value: Role) => apiClient.post('/api/auth/role', { role: value }),
    onSuccess: async (_, value) => {
      await queryClient.invalidateQueries({ queryKey: qk.me })
      await router.invalidate()
      router.navigate({ to: homeFor(value) })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.clear()
      router.navigate({ to: '/login' })
    },
    onError: () => toast.error('Failed to sign out'),
  })

  const firstName = user.name.split(' ')[0]

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <a href="/" className="mb-10 flex items-center justify-center gap-2">
          <img src={logo} alt="EventBid" className="h-7 w-auto" />
          <span className="text-[17px] text-foreground">EventBid</span>
        </a>

        {/* Heading */}
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Step 02 of 02
          </p>
          <h1 className="mt-3 font-serif text-[36px] font-normal tracking-[-0.01em] text-foreground">
            {firstName ? `Welcome, ${firstName}` : 'Welcome'}
          </h1>
          <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
            Choose your side of the table.
          </p>
        </div>

        {/* Role selector */}
        <div className="mt-10 space-y-3">
          <RoleSelector
            value={role}
            onChange={(r) => {
              setRole(r)
              setError(null)
            }}
          />
          {error && <p className="text-destructive text-[13px]">{error}</p>}
        </div>

        {/* Continue */}
        <Button
          className="mt-8 h-11 w-full rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
          disabled={roleMutation.isPending}
          onClick={() => {
            if (!role) {
              setError('Choose a role to continue')
              return
            }
            roleMutation.mutate(role)
          }}
        >
          {roleMutation.isPending ? 'Setting up…' : 'Continue'}
        </Button>

        {/* Escape hatch */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Not you?{' '}
          <button
            type="button"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {signOutMutation.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </p>
      </div>
    </div>
  )
}
