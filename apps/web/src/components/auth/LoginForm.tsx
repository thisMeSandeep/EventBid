import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { qk } from '#/lib/query-keys'
import { env } from '#/lib/env'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'

const emailSchema = z.email('Enter a valid email address')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

interface LoginFormProps {
  next?: string
}

export function LoginForm({ next }: LoginFormProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })
      if (result.error) throw new Error(result.error.message ?? 'Login failed')
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.me })
      await router.invalidate()
      if (next) {
        router.navigate({ to: next })
        return
      }
      const user = queryClient.getQueryData<{ role: string }>(qk.me)
      const home = user?.role === 'venue_rep' ? '/venue/feed' : '/host/briefs'
      router.navigate({ to: home })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    },
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: ({ value }) => loginMutation.mutate(value),
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            EventBid
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your account to continue
        </p>

        {/* Form */}
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onSubmit: ({ value }) => {
                const r = emailSchema.safeParse(value)
                return r.success ? undefined : r.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="email"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-xs mt-1">
                    {field.state.meta.errors.filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Password */}
          <form.Field
            name="password"
            validators={{
              onSubmit: ({ value }) => {
                const r = passwordSchema.safeParse(value)
                return r.success ? undefined : r.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  type="password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="current-password"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-xs mt-1">
                    {field.state.meta.errors.filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {/* Google OAuth */}
        <div className="mt-4 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <a
          href={`${env.VITE_API_URL}/api/auth/google`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted/50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
              fill="currentColor"
              opacity="0.1"
            />
            <path
              d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5c-.2 1.2-1 2.3-2 3v2.5h3.3c1.9-1.7 3-4.3 3-7.2z"
              fill="#4285F4"
            />
            <path
              d="M12 22c2.7 0 5-0.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6C4.8 19.8 8.2 22 12 22z"
              fill="#34A853"
            />
            <path
              d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3C2.4 8.7 2 10.3 2 12s.4 3.3 1 4.6L6.4 14z"
              fill="#FBBC04"
            />
            <path
              d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.2 2 4.8 4.2 3 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </a>

        {/* Switch to register */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a
            href="/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
