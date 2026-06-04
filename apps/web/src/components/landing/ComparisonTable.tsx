import { Check, X } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '#/components/ui/table'

const venues = ['The Garden Pavilion', 'The Grand Ballroom', 'Harbourview Terrace']

interface Row {
  label: string
  values: Array<string | boolean>
}

const rows: Array<Row> = [
  { label: 'Total price', values: ['$6,250', '$7,800', '$5,950'] },
  { label: 'Capacity', values: ['120 guests', '150 guests', '100 guests'] },
  { label: 'Catering included', values: [true, true, true] },
  { label: 'Premium AV & lighting', values: [false, true, false] },
  { label: 'On-site parking', values: [true, true, false] },
  { label: 'Available on your date', values: [true, true, true] },
]

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
    ) : (
      <X className="mx-auto h-[18px] w-[18px] text-muted-foreground/40" strokeWidth={1.5} />
    )
  }
  return <span className="text-[15px] font-medium text-foreground">{value}</span>
}

export function ComparisonTable() {
  return (
    <section className="bg-background py-28 md:py-32">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Side by side</p>
          <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[34px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground md:text-[44px]">
            Compare every detail in one view
          </h2>
        </div>

        <div className="mt-14">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="px-5 pb-4 align-bottom" />
                {venues.map((venue, i) => (
                  <TableHead
                    key={venue}
                    className={`px-5 pb-5 pt-4 text-center align-bottom text-[15px] font-medium text-foreground ${
                      i === 0 ? 'rounded-t-2xl bg-accent/30' : ''
                    }`}
                  >
                    {i === 0 && (
                      <Badge className="mb-2 rounded-full bg-primary font-normal text-primary-foreground">
                        Best match
                      </Badge>
                    )}
                    <div>{venue}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, r) => {
                const isLast = r === rows.length - 1
                return (
                  <TableRow
                    key={row.label}
                    className={`hover:bg-transparent ${isLast ? 'border-0' : 'border-black/[0.06]'}`}
                  >
                    <TableCell className="px-5 py-4 text-[14px] text-muted-foreground">
                      {row.label}
                    </TableCell>
                    {row.values.map((value, i) => (
                      <TableCell
                        key={i}
                        className={`px-5 py-4 text-center ${
                          i === 0 ? `bg-accent/30 ${isLast ? 'rounded-b-2xl' : ''}` : ''
                        }`}
                      >
                        <Cell value={value} />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
