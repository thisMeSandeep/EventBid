import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

// matchScore is a cosine similarity in [0, 1] (see matching.service.ts).
export function MatchScoreDots({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(1, score))
  const filled = Math.round(clamped * 5)
  const percent = Math.round(clamped * 100)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center gap-1 text-primary"
            aria-label={`Match score ${percent}%`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={[
                  'h-2 w-2 rounded-full',
                  i < filled ? 'bg-primary' : 'border border-primary/40',
                ].join(' ')}
              />
            ))}
          </span>
        </TooltipTrigger>
        <TooltipContent>{percent}% match</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
