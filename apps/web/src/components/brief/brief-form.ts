import { formOptions, useForm } from '@tanstack/react-form'
import { createBriefSchema, type Brief } from '@eventbid/shared'

export type WizardValues = {
  eventType: '' | 'wedding' | 'birthday' | 'party' | 'other'
  eventDateFrom: string
  eventDateTo: string
  timeOfDay: '' | 'morning' | 'afternoon' | 'night'
  headcount: string
  city: string
  state: string
  budgetMin: string
  budgetMax: string
  requirements: string[]
  description: string
  deadline: string
}

export const wizardDefaultValues: WizardValues = {
  eventType: '',
  eventDateFrom: '',
  eventDateTo: '',
  timeOfDay: '',
  headcount: '',
  city: '',
  state: '',
  budgetMin: '',
  budgetMax: '',
  requirements: [],
  description: '',
  deadline: '',
}

export const briefWizardOpts = formOptions({ defaultValues: wizardDefaultValues })

// Single source of the wizard form instance. Step components take `form` typed
// as the inferred return type below — avoids re-specifying useForm's generics.
// Pass `initial` (e.g. from an existing brief) to seed the edit form.
export function useBriefForm(initial?: Partial<WizardValues>) {
  return useForm({
    ...briefWizardOpts,
    defaultValues: { ...wizardDefaultValues, ...initial },
  })
}

export type BriefWizardForm = ReturnType<typeof useBriefForm>

/** Map an existing brief into wizard form values (inputs hold strings). */
export function briefToWizardValues(b: Brief): WizardValues {
  return {
    eventType: b.eventType as WizardValues['eventType'],
    eventDateFrom: b.eventDateFrom,
    eventDateTo: b.eventDateTo,
    timeOfDay: (b.timeOfDay ?? '') as WizardValues['timeOfDay'],
    headcount: String(b.headcount),
    city: b.city,
    state: b.state,
    budgetMin: String(b.budgetMin),
    budgetMax: String(b.budgetMax),
    requirements: b.requirements ?? [],
    description: b.description ?? '',
    deadline: b.deadline ? new Date(b.deadline).toISOString().slice(0, 10) : '',
  }
}

const toNum = (s: string) => (s === '' ? undefined : Number(s))

const step1Schema = createBriefSchema.pick({
  eventType: true,
  eventDateFrom: true,
  eventDateTo: true,
  headcount: true,
})

const step2Schema = createBriefSchema.pick({
  city: true,
  state: true,
  budgetMin: true,
  budgetMax: true,
})

export function isStepValid(step: number, v: WizardValues): boolean {
  if (step === 1) {
    return step1Schema.safeParse({
      eventType: v.eventType,
      eventDateFrom: v.eventDateFrom,
      eventDateTo: v.eventDateTo,
      headcount: toNum(v.headcount),
    }).success
  }
  if (step === 2) {
    return step2Schema.safeParse({
      city: v.city,
      state: v.state,
      budgetMin: toNum(v.budgetMin),
      budgetMax: toNum(v.budgetMax),
    }).success
  }
  if (step === 3) {
    return createBriefSchema
      .pick({ deadline: true })
      .safeParse({ deadline: v.deadline }).success
  }
  return true
}

/** Build the POST /briefs JSON body. Dates are sent as strings; the backend
 *  coerces them via createBriefSchema. */
export function toCreateBriefPayload(v: WizardValues) {
  return {
    eventType: v.eventType,
    eventDateFrom: v.eventDateFrom,
    eventDateTo: v.eventDateTo,
    ...(v.timeOfDay ? { timeOfDay: v.timeOfDay } : {}),
    headcount: Number(v.headcount),
    city: v.city,
    state: v.state,
    budgetMin: Number(v.budgetMin),
    budgetMax: Number(v.budgetMax),
    ...(v.requirements.length ? { requirements: v.requirements } : {}),
    ...(v.description ? { description: v.description } : {}),
    deadline: v.deadline,
  }
}
