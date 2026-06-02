import { useEffect } from 'react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sse } from '#/lib/sse'
import { qk } from '#/lib/query-keys'

interface SsePayload {
  briefId?: string
  proposalId?: string
  venueId?: string
}

// Each SSE event maps to a precise React Query invalidation. We never call
// invalidateQueries with no key — that would thrash every cached query.
// List-style keys use a prefix (e.g. ['venues', 'feed']) so every paginated
// variant is invalidated, not just page 1.
const handlers: Record<
  string,
  (data: SsePayload, qc: QueryClient) => void
> = {
  'proposal.received': ({ briefId }, qc) => {
    if (briefId) qc.invalidateQueries({ queryKey: qk.briefs.proposals(briefId) })
    qc.invalidateQueries({ queryKey: ['notifications'] })
    toast('New proposal received')
  },
  'analysis.ready': ({ briefId }, qc) => {
    if (briefId) qc.invalidateQueries({ queryKey: qk.briefs.analysis(briefId) })
    qc.invalidateQueries({ queryKey: ['notifications'] })
    toast('AI analysis is ready')
  },
  'analysis.stale': ({ briefId }, qc) => {
    if (!briefId) return
    qc.setQueryData(qk.briefs.analysis(briefId), (old: unknown) =>
      old ? { ...(old as object), status: 'stale' } : old,
    )
  },
  'brief.matched': (_data, qc) => {
    qc.invalidateQueries({ queryKey: ['venues', 'feed'] })
    qc.invalidateQueries({ queryKey: ['notifications'] })
    toast('A new brief matches your venue')
  },
  'proposal.accepted': ({ briefId }, qc) => {
    if (briefId) qc.invalidateQueries({ queryKey: qk.briefs.detail(briefId) })
    qc.invalidateQueries({ queryKey: ['venues', 'proposals'] })
    qc.invalidateQueries({ queryKey: ['notifications'] })
    toast('A proposal was accepted')
  },
  'brief.closed': ({ briefId }, qc) => {
    if (briefId) qc.invalidateQueries({ queryKey: qk.briefs.detail(briefId) })
    qc.invalidateQueries({ queryKey: ['notifications'] })
  },
  'deal.locked': ({ briefId }, qc) => {
    if (briefId) qc.invalidateQueries({ queryKey: qk.briefs.detail(briefId) })
    qc.invalidateQueries({ queryKey: ['notifications'] })
  },
}

function parsePayload(raw: string): SsePayload {
  try {
    return raw ? (JSON.parse(raw) as SsePayload) : {}
  } catch {
    return {}
  }
}

// Subscribes the SSE connection to React Query invalidations. Mounted once at
// the `_app` shell (Step 31). The connection itself is owned by Step 30.
export function useSseInvalidations() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribers = Object.entries(handlers).map(([event, handler]) =>
      sse.on(event, (e) => handler(parsePayload(e.data), queryClient)),
    )
    return () => unsubscribers.forEach((off) => off())
  }, [queryClient])
}
