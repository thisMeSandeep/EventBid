import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useStreamText } from '#/hooks/use-stream-text'
import { Button } from '#/components/ui/button'

interface BriefImproveStreamPanelProps {
  open: boolean
  onClose: () => void
  briefId: string
  description: string
  requirements: string[]
  onApply: (text: string) => void
}

export function BriefImproveStreamPanel({
  open,
  onClose,
  briefId,
  description,
  requirements,
  onApply,
}: BriefImproveStreamPanelProps) {
  const { text, isStreaming, start, stop, reset } = useStreamText()

  // Begin streaming when the panel opens; abort if it closes/unmounts.
  useEffect(() => {
    if (!open) return
    void start(`/api/briefs/${briefId}/improve`, { description, requirements })
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const handleClose = () => {
    stop()
    reset()
    onClose()
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {isStreaming && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isStreaming ? 'Improving…' : 'Suggested description'}
      </div>

      <p className="mt-2 min-h-12 whitespace-pre-wrap text-sm text-foreground">
        {text}
      </p>

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button size="sm" disabled={isStreaming || !text} onClick={() => onApply(text)}>
          Apply
        </Button>
      </div>
    </div>
  )
}
