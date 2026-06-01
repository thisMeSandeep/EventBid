import type { ProposalWithVenue } from '#/server/briefs'
import { useAcceptProposal } from '#/hooks/use-mutations/use-accept-proposal'
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

interface AcceptProposalDialogProps {
  proposal: ProposalWithVenue
  briefId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AcceptProposalDialog({
  proposal,
  briefId,
  open,
  onOpenChange,
}: AcceptProposalDialogProps) {
  const accept = useAcceptProposal(briefId)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept {proposal.venueName}&apos;s proposal?</AlertDialogTitle>
          <AlertDialogDescription>
            This locks the deal with {proposal.venueName} and closes the brief. Every
            other proposal will be declined. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={accept.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={accept.isPending}
            onClick={(e) => {
              e.preventDefault()
              accept.mutate(proposal.id, { onSuccess: () => onOpenChange(false) })
            }}
          >
            {accept.isPending ? 'Accepting…' : 'Yes, accept proposal'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
