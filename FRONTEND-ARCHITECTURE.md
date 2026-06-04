# EventBid — Frontend Architecture & Implementation Guide

> Single source of truth for the web frontend. Pairs with `eventbid-architecture.md` (backend) and `BACKEND.md` (backend plan).
> This document is **architecture only** — design (colors, fonts, spacing) is intentionally out of scope.
> Stack assumptions: TanStack Start + TanStack Router + TanStack Query (SSR) + TanStack Form + Zod + React 19 + shadcn/ui + Tailwind v4.

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Stack & Why](#2-stack--why)
3. [Folder Structure](#3-folder-structure)
4. [Rendering Strategy (SSR vs CSR per page)](#4-rendering-strategy-ssr-vs-csr-per-page)
5. [Data Layer — Loaders, Query Client, Server Functions](#5-data-layer--loaders-query-client-server-functions)
6. [Route Map](#6-route-map)
7. [Auth Flow](#7-auth-flow)
8. [API Client](#8-api-client)
9. [Real-Time (SSE) Integration](#9-real-time-sse-integration)
10. [Streaming AI Responses](#10-streaming-ai-responses)
11. [Mutations & Cache Invalidation](#11-mutations--cache-invalidation)
12. [Forms](#12-forms)
13. [File Uploads](#13-file-uploads)
14. [Error Handling & Boundaries](#14-error-handling--boundaries)
15. [Performance Budget & Tactics](#15-performance-budget--tactics)
16. [State Inventory (what lives where)](#16-state-inventory-what-lives-where)
17. [Implementation Order](#17-implementation-order)

---

## 1. Goals & Non-Goals

**Goals**

- Sub-200ms TTFB on every authenticated page (Vercel edge SSR + server-side data prefetch).
- Zero hydration waterfall — every above-the-fold list/detail is rendered with data on the server, never with a spinner.
- One canonical source of truth per resource — `@tanstack/react-query` cache. No duplicate state in components.
- Type-safe end to end — types and Zod schemas imported from `@eventbid/shared`, never re-declared in the web app.
- Real-time updates (SSE) and optimistic mutations layered on top of the cache without page reloads.

**Non-Goals**

- No design tokens, color systems, or component library theming decisions here.
- No multi-tenant routing, i18n, or feature flagging in v1.
- No service worker, PWA install, or offline mode in v1.

---

## 2. Stack & Why

| Layer | Choice | Why |
|---|---|---|
| Framework | TanStack Start | SSR + file-based routing + streaming, ships with `@tanstack/react-router-ssr-query` |
| Routing | TanStack Router | Type-safe, route loaders, search-param validation, intent-based preloading |
| Server data | TanStack Query (via `react-router-ssr-query`) | One cache shared SSR ↔ CSR, dehydrate/hydrate built in, mutations + invalidation primitives |
| Server logic | TanStack Start **server functions** (`createServerFn`) | RPC from any client component, runs on the Nitro server, can read cookies/secrets safely |
| Forms | TanStack Form + Zod resolvers | Field-granular re-renders, schemas reused from `@eventbid/shared` |
| Validation | Zod (shared package) | Single source of truth for body shapes |
| UI primitives | shadcn/ui (already scaffolded under `src/components/ui`) | Headless components — fits Tailwind v4 |
| Toasts | sonner | Already installed, used for mutation success/error |
| Icons | lucide-react | Already installed |
| Date | date-fns | Already installed |
| State (transient UI) | React local state + `useReducer` | Server state belongs in React Query, not Zustand |
| Auth client | Better Auth `react` client | Mirrors the backend; reads the session cookie |

> Note on TanStack Form vs react-hook-form: both are installed in `package.json`. **Pick TanStack Form** for new code — it integrates with the router's typed search params and avoids the `Controller` boilerplate around shadcn. Leave `react-hook-form` for shadcn's generated `form.tsx` primitives if convenient, but write new feature forms with TanStack Form.

---

## 3. Folder Structure

```
apps/web/src/
├── routes/                          # File-based routes (TanStack Router)
│   ├── __root.tsx                   # Root: HeadContent, Scripts, QueryClientProvider, Toaster
│   ├── index.tsx                    # Public landing
│   ├── _public/                     # Layout group: unauthenticated pages
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── _app/                        # Layout group: authenticated app shell
│   │   ├── route.tsx                # beforeLoad guard + AppShell (nav, bell, SSE provider)
│   │   ├── host/                    # Host-only routes (role guard in beforeLoad)
│   │   │   ├── route.tsx
│   │   │   ├── briefs/
│   │   │   │   ├── index.tsx        # GET /briefs (list)
│   │   │   │   ├── new.tsx          # POST /briefs (wizard form)
│   │   │   │   └── $briefId/
│   │   │   │       ├── route.tsx    # shared layout — prefetches brief + proposals + analysis
│   │   │   │       ├── index.tsx    # Brief detail + proposal cards
│   │   │   │       ├── compare.tsx  # Side-by-side comparison
│   │   │   │       └── analysis.tsx # AI analysis tab
│   │   └── venue/                   # Venue-rep-only routes
│   │       ├── route.tsx
│   │       ├── profile.tsx          # GET/PUT /venues/me + photos
│   │       ├── feed.tsx             # GET /venues/me/feed (matched briefs)
│   │       ├── proposals.tsx        # GET /venues/me/proposals
│   │       └── briefs/$briefId/
│   │           ├── index.tsx        # Read brief
│   │           └── propose.tsx      # POST/PATCH proposal
├── server/
│   ├── auth.ts                      # createServerFn: getCurrentUser, login, logout, register
│   ├── briefs.ts                    # createServerFn: fetchBriefs, fetchBrief, createBrief, ...
│   ├── proposals.ts
│   ├── venues.ts
│   ├── notifications.ts
│   └── _client.ts                   # fetch wrapper used INSIDE server functions only
├── lib/
│   ├── query-client.ts              # makeQueryClient() — same instance used in SSR + browser
│   ├── api-client.ts                # Typed fetch wrapper (client-side mutations + SSE)
│   ├── query-keys.ts                # Centralized key factory
│   ├── sse.ts                       # SSE manager (single connection)
│   ├── env.ts                       # import.meta.env.VITE_API_URL etc, parsed with Zod
│   └── utils.ts                     # cn() etc (already present)
├── hooks/
│   ├── use-session.ts               # wraps router context user
│   ├── use-sse.ts                   # subscribe to SSE events with auto-invalidation
│   ├── use-stream-text.ts           # consumes Hono streamSSE chunked responses
│   ├── use-debounced.ts
│   └── use-mobile.ts                # already present
├── components/
│   ├── ui/                          # shadcn primitives (already scaffolded)
│   ├── app/                         # App-specific composites (NavBar, NotificationBell, …)
│   ├── brief/                       # BriefCard, BriefStatusPill, BriefForm, BriefImproveStreamPanel
│   ├── proposal/                    # ProposalCard, ProposalCompareGrid, AcceptProposalButton
│   ├── venue/                       # VenueProfileForm, VenuePhotoUploader, FeedCard
│   └── analysis/                    # AnalysisPanel, AnalysisStatusBadge
├── router.tsx                       # createRouter() — registers QueryClient + dehydration
├── styles.css
└── routeTree.gen.ts                 # auto-generated, gitignored after first commit
```

### Why this shape

- **Layout route groups (`_public`, `_app`)** — auth and role guards live at the group level, so per-leaf routes don't repeat redirect logic. The `_app` layout is also where the SSE connection mounts (one per session, not per page).
- **`server/`** — every `createServerFn` lives in one place, importable from loaders and components. Treat these like backend route handlers: they're the only place fetch happens for first-party API calls. Client-only paths (uploads, SSE) use `lib/api-client.ts`.
- **`brief/$briefId/route.tsx`** — TanStack Router layout route. Its `loader` prefetches brief + proposals + analysis in parallel; the three leaf tabs (`index`, `compare`, `analysis`) read from cache and never refetch on tab switch.

---

## 4. Rendering Strategy (SSR vs CSR per page)

> Default: **every route SSRs its initial payload via a router `loader`.** CSR-only is the exception — used when the page has no SEO value AND its data is user-specific AND the loader would slow the navigation.

| Route | Mode | Loader prefetches | Notes |
|---|---|---|---|
| `/` (landing) | SSR, static-friendly | nothing | Pure marketing — cache `Cache-Control: public, s-maxage=300` |
| `/login`, `/register` | SSR | nothing | Forms hydrate, redirect on success |
| `/_app/*` (shell) | SSR | `auth.me` | Guard at `beforeLoad`; redirect to `/login` if 401 |
| `/host/briefs` | SSR | `briefs.list` (page 1) | Cursor pagination — subsequent pages CSR-only |
| `/host/briefs/new` | SSR shell, CSR form | nothing | Form is interactive, no data to prefetch |
| `/host/briefs/$briefId` | SSR | `brief`, `proposals`, `analysis` (parallel) | Layout route — siblings re-use cache |
| `/host/briefs/$briefId/compare` | SSR | same cache | No extra fetch |
| `/host/briefs/$briefId/analysis` | SSR | same cache | If `status='running'`, hook listens for `analysis.ready` over SSE |
| `/venue/profile` | SSR | `venues.me` | Photo list inline |
| `/venue/feed` | SSR | `feed.list` (page 1) | SSE event `brief.matched` → invalidate page 1 |
| `/venue/briefs/$briefId/propose` | SSR | `brief`, `proposals.mine?` | Proposal form prefilled if revising |
| `/venue/proposals` | SSR | `proposals.mine` | Cursor-paginated |

**Streaming SSR**: TanStack Start streams the HTML shell first, then resolves loader-deferred promises. Use `defer()` for non-critical data (e.g. analysis when status is `running`) so the page paints immediately and the panel fills in.

**`defaultPreload: 'intent'`** is already set in `router.tsx` — hovering a link prefetches the loader. Keep `defaultPreloadStaleTime: 0` so prefetched data is treated as fresh and not refetched on click.

---

## 5. Data Layer — Loaders, Query Client, Server Functions

### 5.1 One QueryClient, hydrated end-to-end

```ts
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,           // 30s — most reads are tolerant
        gcTime: 5 * 60_000,          // 5m
        retry: (failureCount, err: any) => err?.status >= 500 && failureCount < 2,
        refetchOnWindowFocus: false, // SSE drives freshness; window focus would over-fetch
      },
      mutations: {
        retry: false,                // user-initiated — surface failure immediately
      },
    },
  })
}
```

```ts
// router.tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { makeQueryClient } from './lib/query-client'

export function getRouter() {
  const queryClient = makeQueryClient()
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    defaultPendingComponent: () => <RouteSkeleton />,
    defaultErrorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
  })
  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}
```

`setupRouterSsrQueryIntegration` dehydrates the QueryClient on the server and rehydrates in the browser. Any `queryClient.ensureQueryData` you call in a loader is automatically transferred — **no manual `dehydrate` calls** in routes.

### 5.2 Loader pattern

Every loader does three things and nothing more: (1) guard, (2) prefetch via `ensureQueryData`, (3) return nothing (or only what's not in cache).

```ts
// routes/_app/host/briefs/$briefId/route.tsx
export const Route = createFileRoute('/_app/host/briefs/$briefId')({
  loader: async ({ context: { queryClient }, params: { briefId } }) => {
    await Promise.all([
      queryClient.ensureQueryData(briefQuery(briefId)),
      queryClient.ensureQueryData(proposalsQuery(briefId)),
      queryClient.ensureQueryData(analysisQuery(briefId)),
    ])
  },
  component: BriefLayout,
  pendingMs: 200,                    // wait 200ms before showing pendingComponent
  pendingMinMs: 400,                 // and show it for at least 400ms once shown
})
```

The component reads from cache:

```ts
function BriefLayout() {
  const { briefId } = Route.useParams()
  const { data: brief } = useSuspenseQuery(briefQuery(briefId))
  // ...
}
```

### 5.3 Query factory (typed, central)

```ts
// lib/query-keys.ts
export const qk = {
  me: ['me'] as const,
  briefs: {
    list: (cursor?: string) => ['briefs', 'list', cursor ?? null] as const,
    detail: (id: string) => ['briefs', id] as const,
    analysis: (id: string) => ['briefs', id, 'analysis'] as const,
    proposals: (id: string) => ['briefs', id, 'proposals'] as const,
  },
  venues: {
    me: ['venues', 'me'] as const,
    feed: (cursor?: string) => ['venues', 'feed', cursor ?? null] as const,
    proposals: (cursor?: string) => ['venues', 'proposals', cursor ?? null] as const,
    byId: (id: string) => ['venues', id] as const,
  },
  notifications: {
    list: (cursor?: string) => ['notifications', cursor ?? null] as const,
  },
} as const
```

```ts
// server/briefs.ts
import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { getEvent, getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'
import type { Brief } from '@eventbid/shared'
import { apiServer } from './_client'

export const fetchBrief = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    return apiServer<Brief>(`/briefs/${data.id}`, { cookieHeader: getCookie(getEvent(), 'auth') })
  })

export const briefQuery = (id: string) =>
  queryOptions({
    queryKey: qk.briefs.detail(id),
    queryFn: () => fetchBrief({ data: { id } }),
  })
```

### 5.4 Server functions vs direct fetch

| Scenario | Use |
|---|---|
| Authenticated read in a loader | **Server function** — forwards the session cookie server-side, avoids CORS, avoids leaking the API URL to the client for SSR |
| Client-only mutation (button click) | Direct `fetch` via `lib/api-client.ts` — browser already has the session cookie |
| Multipart upload | Direct `fetch` (FormData can't cross the server-function boundary cleanly) |
| SSE subscription | Direct `EventSource` from the browser — server functions are request/response only |
| Streaming AI response | Direct `fetch` with a `ReadableStream` reader |

**Server functions are for data the loader needs.** Mutations almost always run client-side because they react to user gestures and need optimistic updates.

---

## 6. Route Map

> Routes are organized to mirror the API. Every authenticated route lives under `_app`; role gating is added at `_app/host/route.tsx` and `_app/venue/route.tsx`.

```
/                                              Landing (public, SSG-style)
/login                                         Email+password login + Google OAuth button
/register                                      Role selector (host | venue_rep) + signup

/_app                                          Authenticated shell — NavBar + NotificationBell + SSE provider
├── /host                                      Role guard: user.role === 'host'
│   ├── /briefs                                List own briefs
│   ├── /briefs/new                            Brief creation wizard
│   └── /briefs/$briefId                       Layout — shared loader
│       ├── /                                  Detail + proposal cards (default tab)
│       ├── /compare                           Side-by-side comparison
│       └── /analysis                          AI analysis panel
└── /venue                                     Role guard: user.role === 'venue_rep'
    ├── /profile                               Venue profile + photo manager
    ├── /feed                                  Matched briefs feed
    ├── /proposals                             Own proposals across briefs
    └── /briefs/$briefId
        ├── /                                  Read-only brief view
        └── /propose                           Submit/revise proposal
```

### Layout grouping for SSE & shell

The `_app/route.tsx` layout mounts:

1. The `<NavBar>` (links by role)
2. The `<NotificationBell>` (queries `/notifications`, listens for SSE events)
3. The `<SSEProvider>` (one `EventSource` for the whole authenticated session)

Because layout routes don't unmount on child navigation, the SSE connection survives every in-app navigation.

### Search params (typed)

Use `Route.validateSearch` with Zod for every list page:

```ts
// /host/briefs
const searchSchema = z.object({
  cursor: z.string().optional(),
  status: z.enum(['open', 'evaluating', 'closed', 'expired']).optional(),
})
export const Route = createFileRoute('/_app/host/briefs/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ cursor: search.cursor, status: search.status }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(briefsListQuery(deps)),
  component: BriefsListPage,
})
```

`loaderDeps` makes the loader re-run when filters change — without re-running on unrelated nav.

---

## 7. Auth Flow

### Source of truth

- **Session lives in an HTTP-only cookie** set by Better Auth on the backend.
- The cookie is sent automatically with every same-site request (web → api on same root domain) or with `credentials: 'include'` cross-site.

### Loader guard (one place)

```ts
// routes/_app/route.tsx
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData(meQuery)
    if (!user) {
      throw redirect({ to: '/login', search: { next: location.href } })
    }
    return { user }
  },
  component: AppShell,
})
```

`beforeLoad` runs on SSR and on every client navigation. The `meQuery` is cached, so subsequent route loads are free.

### Role guard (per-segment)

```ts
// routes/_app/host/route.tsx
export const Route = createFileRoute('/_app/host')({
  beforeLoad: ({ context }) => {
    if (context.user.role !== 'host') throw redirect({ to: '/venue/feed' })
  },
})
```

### Login mutation

```ts
const loginMutation = useMutation({
  mutationFn: (input) => apiClient.post('/auth/login', input),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: qk.me })
    await router.invalidate()                  // re-runs all loaders with the new session
    const { next } = Route.useSearch()
    router.navigate({ to: next ?? '/host/briefs' })
  },
})
```

### Logout

Hits `POST /auth/logout`, then `queryClient.clear()` to discard the entire cache, then `router.navigate({ to: '/login' })`. Clearing is correct here — the cache contains another user's data otherwise.

---

## 8. API Client

A single typed fetch wrapper. Two variants:

```ts
// lib/api-client.ts (browser)
import { env } from './env'
import type { ApiError } from '@eventbid/shared'

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.error?.code ?? 'UNKNOWN', body?.error?.message ?? res.statusText)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

export const apiClient = {
  get:    <T>(p: string)            => request<T>(p),
  post:   <T>(p: string, body: any) => request<T>(p, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(p: string, body: any) => request<T>(p, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    <T>(p: string, body: any) => request<T>(p, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(p: string)            => request<T>(p, { method: 'DELETE' }),
  upload: <T>(p: string, form: FormData) => fetch(`${env.VITE_API_URL}${p}`, {
    method: 'POST', body: form, credentials: 'include',
  }).then(r => r.json() as Promise<T>),
}
```

```ts
// server/_client.ts (used only inside createServerFn handlers)
export async function apiServer<T>(path: string, opts: { cookieHeader?: string } = {}): Promise<T> {
  const res = await fetch(`${process.env.API_URL_INTERNAL ?? process.env.VITE_API_URL}${path}`, {
    headers: opts.cookieHeader ? { cookie: opts.cookieHeader } : {},
  })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json() as Promise<T>
}
```

Two-URL trick: in production, the frontend SSR talks to the API over internal networking (`API_URL_INTERNAL`), while the browser uses the public URL (`VITE_API_URL`). Vercel ↔ Railway can be set up so SSR uses Railway's private network endpoint when available.

---

## 9. Real-Time (SSE) Integration

### One connection, many subscribers

```ts
// lib/sse.ts
type Listener = (event: MessageEvent) => void

class SSEManager {
  private es?: EventSource
  private listeners = new Map<string, Set<Listener>>()
  private lastEventId?: string

  connect() {
    if (this.es) return
    const url = new URL('/sse', env.VITE_API_URL)
    this.es = new EventSource(url.toString(), { withCredentials: true })
    for (const [event, handlers] of this.listeners) {
      this.es.addEventListener(event, (e) => {
        this.lastEventId = (e as MessageEvent).lastEventId
        handlers.forEach((fn) => fn(e as MessageEvent))
      })
    }
  }

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    this.es?.addEventListener(event, fn)
    return () => {
      this.listeners.get(event)?.delete(fn)
      this.es?.removeEventListener(event, fn)
    }
  }

  disconnect() {
    this.es?.close()
    this.es = undefined
  }
}

export const sse = new SSEManager()
```

> **Last-Event-ID is handled by the browser automatically** on EventSource reconnect — the manager doesn't need to send it manually. The backend reads it from the request header and replays missed notifications.

### Mounted once in the app shell

```ts
// routes/_app/route.tsx
function AppShell() {
  useEffect(() => { sse.connect(); return () => sse.disconnect() }, [])
  return <Outlet />
}
```

### Event → invalidation table

Each event maps to a precise React Query invalidation. **Never `invalidateQueries({})` with no key** — that thrashes every cached query.

```ts
// hooks/use-sse-invalidations.ts (mounted at _app shell)
const map: Record<string, (data: any, qc: QueryClient) => void> = {
  'proposal.received': ({ briefId }, qc) => {
    qc.invalidateQueries({ queryKey: qk.briefs.proposals(briefId) })
    qc.invalidateQueries({ queryKey: qk.notifications.list() })
  },
  'analysis.ready':    ({ briefId }, qc) => qc.invalidateQueries({ queryKey: qk.briefs.analysis(briefId) }),
  'analysis.stale':    ({ briefId }, qc) => qc.setQueryData(qk.briefs.analysis(briefId), (old: any) => old ? { ...old, status: 'stale' } : old),
  'brief.matched':     (_, qc)            => qc.invalidateQueries({ queryKey: qk.venues.feed() }),
  'proposal.accepted': ({ briefId }, qc) => { qc.invalidateQueries({ queryKey: qk.briefs.detail(briefId) }); qc.invalidateQueries({ queryKey: qk.venues.proposals() }) },
  'brief.closed':      ({ briefId }, qc) => qc.invalidateQueries({ queryKey: qk.briefs.detail(briefId) }),
  'deal.locked':       ({ briefId }, qc) => qc.invalidateQueries({ queryKey: qk.briefs.detail(briefId) }),
}
```

### Notification bell

A single `useQuery(qk.notifications.list())` populates the bell badge. SSE events invalidate it. Mark-as-read mutations use `onMutate` for optimistic update.

---

## 10. Streaming AI Responses

For `POST /briefs/:id/improve` — Hono `streamSSE`. The browser consumes it with `fetch` + a reader, not `EventSource` (because we need to POST a body).

```ts
// hooks/use-stream-text.ts
export function useStreamText() {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef = useRef<AbortController>()

  const start = useCallback(async (path: string, body: unknown) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setText(''); setStreaming(true)
    try {
      const res = await fetch(`${env.VITE_API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
        signal: abortRef.current.signal,
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        // Parse SSE `data: ...` frames
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) setText((t) => t + line.slice(6))
        }
      }
    } finally { setStreaming(false) }
  }, [])

  return { text, streaming, start, cancel: () => abortRef.current?.abort() }
}
```

`BriefImproveStreamPanel` uses this hook; the user clicks "Improve description", text streams into a `<Textarea>`, and an "Apply" button copies the streamed text into the form's description field.

---

## 11. Mutations & Cache Invalidation

### Pattern

```ts
function useCreateBrief() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (input: CreateBriefDto) => apiClient.post<{ brief: Brief; warnings: string[] }>('/briefs', input),
    onSuccess: ({ brief }) => {
      qc.invalidateQueries({ queryKey: qk.briefs.list() })
      router.navigate({ to: '/host/briefs/$briefId', params: { briefId: brief.id } })
    },
    onError: (err: ApiError) => toast.error(err.message),
  })
}
```

### Optimistic patterns

| Mutation | Optimistic? | How |
|---|---|---|
| Mark notification read | Yes | `onMutate`: patch list with `read: true`, return rollback context |
| Mark-all read | Yes | `onMutate`: zero unread count |
| Submit proposal | No | Wait for server — needs new ID, status, version |
| Revise proposal | No | Server creates new row, supersedes old |
| Accept proposal | No | The whole brief state transitions; let server confirm to avoid showing the wrong winner |
| Update venue profile | Yes | `onMutate`: patch `qk.venues.me`; rollback on error |
| Delete photo | Yes | `onMutate`: filter from list |

### Invalidation cheat sheet

| Mutation | Invalidates |
|---|---|
| `createBrief` | `briefs.list`, navigate to detail |
| `updateBrief` | `briefs.detail(id)`, `briefs.list` |
| `deleteBrief` | `briefs.list` |
| `submitProposal` | `briefs.proposals(briefId)`, `venues.proposals()` |
| `reviseProposal` | `briefs.proposals(briefId)`, `briefs.analysis(briefId)`, `venues.proposals()` |
| `acceptProposal` | `briefs.detail(briefId)`, `briefs.proposals(briefId)`, `notifications.list()` |
| `triggerAnalysis` | optimistic: set `analysis.status = 'queued'`; real result via SSE |
| `updateVenue` | `venues.me` |
| `uploadPhoto` | `venues.me` (photos are part of the profile payload) |
| `markRead` | `notifications.list()` |

---

## 12. Forms

TanStack Form + Zod resolver, schemas imported from `@eventbid/shared`.

```ts
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createBriefSchema } from '@eventbid/shared'

function BriefForm() {
  const create = useCreateBrief()
  const form = useForm({
    defaultValues: { eventType: 'wedding', headcount: 50, /* ... */ } as CreateBriefDto,
    validatorAdapter: zodValidator(),
    validators: { onSubmit: createBriefSchema },
    onSubmit: ({ value }) => create.mutate(value),
  })
  // ...
}
```

Use `form.Field` for field-level subscriptions to avoid re-rendering the whole form on every keystroke.

### Brief wizard (multi-step)

`/host/briefs/new` is a multi-step form: (1) event basics, (2) location & budget, (3) requirements & description, (4) review + warnings. Steps live in **search params** (`?step=2`) — back/forward buttons preserve progress, and on submit of step 3 the form fires `briefAI.checkQuality` to surface warnings on step 4.

---

## 13. File Uploads

`POST /venues/me/photos` — `multipart/form-data`. Client-side validation mirrors the server (JPEG/PNG/WebP, 5 MB).

```ts
function VenuePhotoUploader() {
  const qc = useQueryClient()
  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Unsupported format')
      if (file.size > 5 * 1024 * 1024) throw new Error('Max 5 MB')
      const fd = new FormData()
      fd.append('file', file)
      return apiClient.upload<{ id: string; url: string }>('/venues/me/photos', fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.venues.me }),
  })
  // <input type="file" onChange={(e) => upload.mutate(e.target.files![0])} />
}
```

No client-side resize in v1 — the 5 MB limit and server validation are sufficient.

---

## 14. Error Handling & Boundaries

### Router-level

`__root.tsx` provides `defaultErrorComponent` → generic "Something went wrong" with a reload button.
Each route can override `errorComponent` for domain-specific copy (e.g. `BRIEF_CLOSED`).

### Error code → UX

| Code | UX |
|---|---|
| `UNAUTHORIZED` | Intercept globally in `apiClient`: clear cache, redirect `/login` |
| `FORBIDDEN` | Route error component: "You don't have access to this page" |
| `NOT_FOUND` | `notFoundComponent` on the leaf route |
| `VALIDATION_ERROR` | Surface on the form field (TanStack Form `serverErrors`) |
| `BRIEF_CLOSED` / `DEADLINE_PASSED` / `DEAL_LOCK_FAILED` | `toast.error` with the server's `message` field, then invalidate the brief so the UI reconciles |
| `RATE_LIMITED` | `toast.warning('Slow down — try again in a minute')` |
| `INTERNAL_ERROR` | Generic toast + `logger.error` with the original error |

A global error interceptor lives in `apiClient.request` — it inspects the response and, for `UNAUTHORIZED`, calls a `useAuthRedirect()` event bus (the API client can't import the router directly without a cycle).

### Logging (no SaaS error monitoring)

`@eventbid/logger` (workspace package, Pino under the hood). The browser conditional export resolves to a browser-safe build automatically — import as `import { createLogger } from '@eventbid/logger'`.

A single instance lives in `lib/logger.ts` and is the only sink for diagnostics in the web app:

```ts
// lib/logger.ts
import { createLogger } from '@eventbid/logger'
import { env } from './env'

export const logger = createLogger({ name: 'eventbid-web', level: env.VITE_LOG_LEVEL })
```

Where it's used:

- `apiClient` — `logger.warn` for non-2xx responses, `logger.error` for network failures
- `RouteError` / `defaultErrorComponent` — `logger.error({ err })` in a `useEffect` so route errors are captured at the top of the tree
- `SSEManager` — `logger.debug` for lifecycle, `logger.warn` for unknown event types
- Mutations — log `logger.error` in `onError` before showing the toast

**No `console.*` in production code.** Use `logger.debug` for anything you'd otherwise `console.log`. The level is environment-driven (`VITE_LOG_LEVEL`), so production builds are quiet by default.

> If error aggregation is needed later, the logger is the single seam to add it — wrap the `createLogger` output once, ship to whatever backend, no call-site changes.

---

## 15. Performance Budget & Tactics

| Tactic | Why |
|---|---|
| `defaultPreload: 'intent'` (already set) | Hover preloads the next route's loader — perceived nav latency ≈ 0 |
| `Promise.all` in layout loaders | Brief detail loads brief + proposals + analysis in parallel, not serial |
| `defer()` slow loaders | Stream the shell, fill panels late (e.g. analysis when `running`) |
| One QueryClient SSR↔CSR | Zero re-fetch on hydration |
| `staleTime: 30s` | Cuts duplicate fetches across rapid tab switches |
| Cursor pagination, not offset | O(1) DB cost, infinite-scroll friendly |
| React 19 + `react-compiler` (already in devDeps) | Auto-memo expensive lists (proposal grid, brief feed) |
| Code-split heavy panels | `recharts` only in `/analysis` — dynamic import |
| Image CDN | `<img>` `srcset` with Cloudflare/Cloudinary transforms; `loading="lazy"` on every photo not above the fold |
| SSE invalidation, not polling | Saves a request per minute per tab |
| Local component state for UI-only | Don't put modal open/close in React Query |

### Anti-patterns to avoid

- Calling `queryClient.invalidateQueries()` with no key.
- Using `useEffect` to fetch data — fetch in loaders or `useQuery`.
- Storing the user object in React Context — it's already in the QueryClient as `qk.me`; access via `useSuspenseQuery(meQuery)` or the route's `beforeLoad` context.
- Two `EventSource` connections (one per tab is fine, but never two per tab).
- Polling `/notifications` on an interval — SSE handles it.

---

## 16. State Inventory (what lives where)

| State | Lives in |
|---|---|
| Current user / role | React Query (`qk.me`) — single source |
| Briefs, proposals, venues, analyses | React Query |
| Notifications | React Query, mutated by SSE |
| Form drafts | TanStack Form local state |
| Wizard step | URL search params |
| Filters / cursor on lists | URL search params (typed via `validateSearch`) |
| Modal open/closed | Local component state |
| SSE connection | `lib/sse.ts` singleton, mounted in `_app` layout |
| Toasts | sonner |
| Theme | `next-themes` (already installed) — local storage |

If you find yourself reaching for Zustand or React Context for server data, stop — it belongs in React Query.

---

## 17. Implementation Order

> Same shape as `BACKEND.md`: small steps with a verifiable done condition.

### Phase 1 — Foundation

1. **Wire QueryClient + SSR integration** in `router.tsx`. Add `lib/query-client.ts`, `lib/api-client.ts`, `lib/env.ts`, `lib/query-keys.ts`. ✅ when `/` SSRs and devtools show the cache hydrating in the browser without refetch.
2. **Route layout groups**: create `_public/route.tsx`, `_app/route.tsx`, `_app/host/route.tsx`, `_app/venue/route.tsx`. Empty `<Outlet />` components for now.
3. **AppShell + NavBar** in `_app/route.tsx`. Role-aware links. Hard-coded user for now.

### Phase 2 — Auth

4. **`/login`, `/register`** pages with TanStack Form. `loginMutation`, `registerMutation` hitting `/auth/*`.
5. **`meQuery` + `beforeLoad` guard** on `_app`. Verify: visiting `/host/briefs` while logged out redirects to `/login?next=…`.
6. **Logout** action in NavBar. `queryClient.clear()` + redirect.
7. **Google OAuth button** — link to `/auth/google`; callback redirects back into the app via the backend.

### Phase 3 — Host journey

8. **`/host/briefs` list** — loader + `useSuspenseQuery`, cursor pagination via search params.
9. **`/host/briefs/new` wizard** — multi-step via `?step=`, Zod validation, quality warnings panel on review step.
10. **`/host/briefs/$briefId` layout route** — parallel prefetch (brief, proposals, analysis). Tabs: detail / compare / analysis.
11. **Proposal cards** — read from `qk.briefs.proposals(briefId)`. Accept button → `acceptProposalMutation`.
12. **Analysis tab** — render `analysis.results`; show running/stale states; SSE-driven refresh.
13. **Brief improve stream** — `useStreamText` + "Apply" button writes to form state.

### Phase 4 — Venue journey

14. **`/venue/profile`** — `useSuspenseQuery(qk.venues.me)`. Form + photo uploader.
15. **`/venue/feed`** — paginated matched briefs.
16. **`/venue/briefs/$briefId/propose`** — submit + revise. Prefills the active proposal if one exists.
17. **`/venue/proposals`** — own proposals across briefs.

### Phase 5 — Real-time + notifications

18. **`SSEManager` + connect in `_app` shell**. Verify `EventSource` opens once and survives in-app navigation.
19. **Event → invalidation map** wired via `useEffect` in shell. Verify: submitting a proposal as venue invalidates host's proposals list in real time.
20. **`<NotificationBell>`** — query, mark-read mutations with optimistic updates, click-through routing.

### Phase 6 — Polish

21. **Error boundaries** — per-route `errorComponent`, global `apiClient` 401 interceptor.
22. **Logger wiring** — instantiate `@eventbid/logger` once in `lib/logger.ts`, replace any `console.*` in app code with structured `logger.*` calls.
23. **Skeletons & pending UI** — every loader has a skeleton matched to its final layout.
24. **End-to-end manual smoke test** — mirror Step 31 in `BACKEND.md` through the UI.

---

## Appendix A — Worked example: `/host/briefs/$briefId/route.tsx`

```ts
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { briefQuery, proposalsQuery, analysisQuery } from '#/server/briefs'
import { qk } from '#/lib/query-keys'
import { BriefHeader } from '#/components/brief/BriefHeader'
import { BriefTabs } from '#/components/brief/BriefTabs'

export const Route = createFileRoute('/_app/host/briefs/$briefId')({
  loader: async ({ context: { queryClient }, params: { briefId } }) => {
    // Parallel prefetch — no waterfall
    await Promise.all([
      queryClient.ensureQueryData(briefQuery(briefId)),
      queryClient.ensureQueryData(proposalsQuery(briefId)),
      queryClient.ensureQueryData(analysisQuery(briefId)),
    ])
  },
  component: BriefDetailLayout,
})

function BriefDetailLayout() {
  const { briefId } = Route.useParams()
  const { data: brief } = useSuspenseQuery(briefQuery(briefId))
  return (
    <div>
      <BriefHeader brief={brief} />
      <BriefTabs briefId={briefId} />
      <Outlet />
    </div>
  )
}
```

---

## Appendix B — Server function template

```ts
// server/briefs.ts
import { createServerFn } from '@tanstack/react-start'
import { getEvent, getCookie } from '@tanstack/react-start/server'
import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { qk } from '#/lib/query-keys'
import { apiServer } from './_client'
import type { Brief, Proposal, AiAnalysis } from '@eventbid/shared'

const idSchema = z.object({ id: z.string().uuid() })

export const fetchBrief = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(({ data }) => apiServer<Brief>(`/briefs/${data.id}`, { cookieHeader: getCookie(getEvent(), 'auth') }))

export const fetchProposals = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(({ data }) => apiServer<Proposal[]>(`/briefs/${data.id}/proposals`, { cookieHeader: getCookie(getEvent(), 'auth') }))

export const fetchAnalysis = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(({ data }) => apiServer<AiAnalysis | null>(`/briefs/${data.id}/analysis`, { cookieHeader: getCookie(getEvent(), 'auth') }))

export const briefQuery     = (id: string) => queryOptions({ queryKey: qk.briefs.detail(id),    queryFn: () => fetchBrief({ data: { id } }) })
export const proposalsQuery = (id: string) => queryOptions({ queryKey: qk.briefs.proposals(id), queryFn: () => fetchProposals({ data: { id } }) })
export const analysisQuery  = (id: string) => queryOptions({ queryKey: qk.briefs.analysis(id),  queryFn: () => fetchAnalysis({ data: { id } }) })
```

---

*Frontend architecture — v1.0*
*Pairs with backend v2.1*
*Next: a step-by-step `FRONTEND.md` implementation plan (mirroring `BACKEND.md`).*
