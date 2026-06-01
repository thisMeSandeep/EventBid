interface BriefImproveStreamPanelProps {
  open: boolean
  onClose: () => void
}

// Placeholder — AI streaming is wired in Step 22. Renders nothing for now.
export function BriefImproveStreamPanel({ open, onClose }: BriefImproveStreamPanelProps) {
  if (!open) return null
  return (
    <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
      <p>AI improvement is coming in Step 22.</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 text-foreground underline-offset-4 hover:underline"
      >
        Close
      </button>
    </div>
  )
}
