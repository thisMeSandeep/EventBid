import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { apiClient } from '#/lib/api-client'
import { qk } from '#/lib/query-keys'
import { env } from '#/lib/env'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { RoleSelector } from './RoleSelector'

type Role = 'host' | 'venue_rep'

const nameSchema = z.string().min(1, 'Name is required')
const emailSchema = z.email('Enter a valid email address')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')

export function RegisterForm() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const registerMutation = useMutation({
    mutationFn: (values: { name: string; email: string; password: string; role: Role }) =>
      apiClient.post<{ user: { id: string } }>('/api/auth/register', values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.me })
      await router.invalidate()
      router.navigate({ to: '/' })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    },
  })

  const form = useForm({
    defaultValues: { name: '', email: '', password: '', role: '' as Role | '' },
    onSubmit: ({ value }) => {
      if (!value.role) return
      registerMutation.mutate(value as { name: string; email: string; password: string; role: Role })
    },
  })

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
        <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get started in less than a minute
        </p>

        {/* Form */}
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          {/* Role selector */}
          <form.Field
            name="role"
            validators={{
              onSubmit: ({ value }) =>
                value ? undefined : 'Please select how you want to use EventBid',
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label>I want to</Label>
                <RoleSelector
                  value={field.state.value}
                  onChange={(role) => field.handleChange(role)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-xs">
                    {field.state.meta.errors.filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

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
              <div className="space-y-1">
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
            className="w-full mt-6"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating account…' : 'Create account'}
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

        {/* Switch to login */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
