import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiClient } from '#/lib/api-client'
import { authClient } from '#/lib/auth-client'
import { qk } from '#/lib/query-keys'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'
import ballroomImage from '#/assets/ballroomImage.webp'
import googleIcon from '#/assets/google.svg'

const nameSchema = z.string().min(1, 'Name is required')
const emailSchema = z.email('Enter a valid email address')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export function RegisterForm() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const registerMutation = useMutation({
    mutationFn: (values: { name: string; email: string; password: string }) =>
      apiClient.post<{ user: { id: string } }>('/api/auth/register', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.me })
      await router.invalidate()
      // Account created — next step is choosing a role.
      router.navigate({ to: '/onboarding/role' })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    },
  })

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: ({ value }) => {
      registerMutation.mutate(value)
    },
  })

  return (
    <AuthLayout
      image={ballroomImage}
      imageAlt="A venue ready to host an event"
      caption={{
        title: 'Your perfect venue is one brief away.',
        subtitle: 'Post your event and let top venues come to you.',
      }}
    >
      {/* Heading */}
      <h1 className="font-serif text-[32px] font-normal tracking-[-0.01em] text-foreground">
        Create your account
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Get started in less than a minute
      </p>

      {/* Form */}
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        {/* Name */}
        <form.Field
          name="name"
          validators={{
            onSubmit: ({ value }) => {
              const r = nameSchema.safeParse(value)
              return r.success ? undefined : r.error.issues[0]?.message
            },
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Full name</Label>
              <Input
                id={field.name}
                type="text"
                placeholder="Alex Johnson"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="name"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-xs mt-1">
                  {field.state.meta.errors.filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

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
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Password</Label>
              <PasswordInput
                id={field.name}
                placeholder="••••••••"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="new-password"
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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {/* Google OAuth */}
      <div className="mt-6 flex items-center gap-3">
        <Separator className="flex-1 bg-border/60" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1 bg-border/60" />
      </div>
      <button
        type="button"
        onClick={() =>
          authClient.signIn.social({ provider: 'google', callbackURL: '/onboarding/role' })
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-black/[0.06] bg-card px-4 py-2.5 text-sm font-normal text-foreground transition-colors duration-200 ease-out hover:bg-muted/60"
      >
        <img src={googleIcon} alt="" className="h-4 w-4" />
        Continue with Google
      </button>

      {/* Switch to login */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Sign in
        </a>
      </p>
    </AuthLayout>
  )
}
