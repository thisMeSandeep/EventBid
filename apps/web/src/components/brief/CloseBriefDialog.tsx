import { useCloseBrief } from '#/hooks/use-mutations/use-close-brief'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

interface CloseBriefDialogProps {
  briefId: string
  proposalCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CloseBriefDialog({
  briefId,
  proposalCount,
  open,
  onOpenChange,
}: CloseBriefDialogProps) {
  const close = useCloseBrief(briefId)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this brief?</AlertDialogTitle>
          <AlertDialogDescription>
            This ends the brief without choosing a winner. Venues can no longer submit
            or revise proposals
            {proposalCount > 0
              ? `, and ${proposalCount} active proposal${
                  proposalCount === 1 ? '' : 's'
                } will be declined`
              : ''}
            . A closed brief can&apos;t be reopened.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={close.isPending}>Keep open</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={close.isPending}
            onClick={(e) => {
              e.preventDefault()
              close.mutate(undefined, { onSuccess: () => onOpenChange(false) })
            }}
          >
            {close.isPending ? 'Closing…' : 'Yes, close brief'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
