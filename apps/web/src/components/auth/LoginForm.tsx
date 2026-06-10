import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { authClient } from '#/lib/auth-client'
import { qk } from '#/lib/query-keys'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'
import heroImage from '#/assets/heroImage.webp'
import googleIcon from '#/assets/google.svg'

const emailSchema = z.email('Enter a valid email address')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

interface LoginFormProps {
  next?: string
  error?: string
}

// Maps Better Auth OAuth error codes (?error=...) to user-facing messages.
function oauthErrorMessage(code: string): string {
  switch (code) {
    case 'account_not_linked':
      return 'An account with this email already exists. Sign in with your email and password instead.'
    default:
      return 'Could not sign in with Google. Please try again.'
  }
}

export function LoginForm({ next, error }: LoginFormProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Surface OAuth failures redirected back here by Better Auth (errorCallbackURL).
  useEffect(() => {
    if (error) toast.error(oauthErrorMessage(error))
  }, [error])

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
    <AuthLayout
      image={heroImage}
      imageAlt="Elegant event venue interior"
      caption={{
        status: 'Brief №2041 · 3 proposals in',
        title: 'Pick up where you left off.',
      }}
    >
      {/* Heading */}
      <h1 className="font-serif text-[36px] font-normal tracking-[-0.01em] text-foreground">
        Welcome back
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
        Sign in to pick up your briefs and proposals.
      </p>

      {/* Form */}
      <form
        className="mt-8 space-y-4"
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
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Email
              </Label>
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
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Password
              </Label>
              <PasswordInput
                id={field.name}
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
          className="mt-6 h-11 w-full rounded-full bg-foreground font-normal text-background transition-colors duration-200 ease-out hover:bg-foreground/90"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Google OAuth */}
      <div className="mt-6 flex items-center gap-3">
        <Separator className="flex-1 bg-border/60" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          or
        </span>
        <Separator className="flex-1 bg-border/60" />
      </div>
      <button
        type="button"
        onClick={() =>
          authClient.signIn.social({
            provider: 'google',
            callbackURL: next ?? '/',
            errorCallbackURL: '/login',
          })
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-normal text-foreground transition-colors duration-200 ease-out hover:bg-muted/60"
      >
        <img src={googleIcon} alt="" className="h-4 w-4" />
        Continue with Google
      </button>

      {/* Switch to register */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a
          href="/register"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Sign up
        </a>
      </p>
    </AuthLayout>
  )
}
