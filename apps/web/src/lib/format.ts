const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const dateFmt = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatRupees(amount: number): string {
  return rupees.format(amount)
}

export function formatBudgetRange(min: number, max: number): string {
  return `${formatRupees(min)} – ${formatRupees(max)}`
}

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return dateFmt.format(d)
}
