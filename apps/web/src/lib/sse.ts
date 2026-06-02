import { env } from './env'

type Listener = (event: MessageEvent) => void

// One EventSource per authenticated session. Subscribers register handlers via
// `on()`; the connection itself is opened/closed once from the `_app` shell so
// it survives in-app navigation (Step 30). The event→invalidation wiring lives
// in `use-sse-invalidations.ts` (Step 31).
class SSEManager {
  private es?: EventSource
  private listeners = new Map<string, Set<Listener>>()
  // The wrapper actually bound to the EventSource for each listener, so it can
  // be detached again on unsubscribe.
  private wrappers = new Map<Listener, Listener>()
  private lastEventId?: string

  connect() {
    if (this.es) return
    // The API is served under `/api`; SSE lives at `/api/sse`.
    const url = new URL('/api/sse', env.VITE_API_URL)
    this.es = new EventSource(url.toString(), { withCredentials: true })

    // Bind any handlers registered before the connection opened.
    for (const [event, handlers] of this.listeners) {
      for (const fn of handlers) {
        this.es.addEventListener(event, this.wrapperFor(fn))
      }
    }
  }

  on(event: string, fn: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    this.es?.addEventListener(event, this.wrapperFor(fn))

    return () => {
      this.listeners.get(event)?.delete(fn)
      const wrapped = this.wrappers.get(fn)
      if (wrapped) {
        this.es?.removeEventListener(event, wrapped)
        this.wrappers.delete(fn)
      }
    }
  }

  disconnect() {
    this.es?.close()
    this.es = undefined
  }

  // Returns a stable wrapper for a listener, recording the latest event id
  // before delegating. Reused across connect/on so unsubscribe can detach it.
  private wrapperFor(fn: Listener): Listener {
    let wrapped = this.wrappers.get(fn)
    if (!wrapped) {
      wrapped = (e) => {
        this.lastEventId = e.lastEventId
        fn(e)
      }
      this.wrappers.set(fn, wrapped)
    }
    return wrapped
  }
}

export const sse = new SSEManager()
