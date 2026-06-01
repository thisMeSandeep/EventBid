import { useDeleteBrief } from '#/hooks/use-mutations/use-delete-brief'
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

interface DeleteBriefDialogProps {
  briefId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteBriefDialog({ briefId, open, onOpenChange }: DeleteBriefDialogProps) {
  const del = useDeleteBrief(briefId)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this brief?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the brief. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={del.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={del.isPending}
            onClick={(e) => {
              e.preventDefault()
              del.mutate(undefined, { onSuccess: () => onOpenChange(false) })
            }}
          >
            {del.isPending ? 'Deleting…' : 'Yes, delete brief'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
