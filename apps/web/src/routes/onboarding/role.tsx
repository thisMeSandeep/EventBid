import { useState } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '#/lib/api-client'
import { authClient } from '#/lib/auth-client'
import { meQuery } from '#/server/auth'
import { qk } from '#/lib/query-keys'
import { RoleSelector } from '#/components/auth/RoleSelector'
import { Button } from '#/components/ui/button'

type Role = 'host' | 'venue_rep'

const homeFor = (role: Role) => (role === 'venue_rep' ? '/venue/feed' : '/host/briefs')

export const Route = createFileRoute('/onboarding/role')({
  // Client-only: auth depends on the browser session cookie (see _app/route.tsx).
  ssr: false,
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
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            EventBid
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-foreground">
          {firstName ? `Welcome, ${firstName}` : 'Welcome'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">How will you use EventBid?</p>

        {/* Role selector */}
        <div className="mt-6 space-y-2">
          <RoleSelector
            value={role}
            onChange={(r) => {
              setRole(r)
              setError(null)
            }}
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        {/* Continue */}
        <Button
          className="w-full mt-6"
          disabled={roleMutation.isPending}
          onClick={() => {
            if (!role) {
              setError('Please select how you want to use EventBid')
              return
            }
            roleMutation.mutate(role)
          }}
        >
          {roleMutation.isPending ? 'Setting up…' : 'Continue'}
        </Button>

        {/* Escape hatch */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not you?{' '}
          <button
            type="button"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            {signOutMutation.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </p>
      </div>
    </div>
  )
}
