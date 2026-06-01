import type { ZodSchema } from 'zod'

export function zodValidator<T>(schema: ZodSchema<T>) {
  return {
    validate: ({ value }: { value: unknown }) => {
      const result = schema.safeParse(value)
      if (result.success) return undefined
      return result.error.issues.map((i) => i.message).join(', ')
    },
  }
}
