# EventBid — Frontend Implementation Plan

> One step at a time. Each step is additive and leaves the app in a working state.
> Pairs with `FRONTEND-ARCHITECTURE.md` (technical) and `FRONTEND-DESIGN.md` (visual).
> Backend must be at Step 31 of `BACKEND.md` (booting cleanly) before starting Phase 2.

---

## How to use this document

- Work through steps in order — later steps depend on earlier ones.
- After every step, `pnpm --filter web dev` must boot without errors and existing routes must still render.
- Each step ends with a **✅ Done when** checklist — don't move on until it passes.
- When a step is complete, mark it `[x]` in this doc.
- The architecture doc is the source of truth for code patterns; the design doc is the source of truth for layout and component shape.

---

## Frontend setup — packages to install (do this first)

Most are already in `apps/web/package.json`. Install only what's missing.

**Likely missing (verify before installing):**

- `@tanstack/react-query` — pulled transitively by `@tanstack/react-router-ssr-query`; install explicitly only if TS complains about unresolved imports
- ~~`@tanstack/zod-form-adapter`~~ — **do not install.** The published adapter only peers with Zod v3; we use Zod v4. A thin custom adapter lives in `src/lib/zod-form-adapter.ts` (written in Step 1, ~10 lines).
- `better-auth` — auth client (server already uses it)

**Workspace logger:**

- `@eventbid/logger` — structured logging (Pino under the hood). Browser entry exposes `createLogger` for client-side use. **Replaces Sentry — no error-monitoring SaaS in v1.**

**Already installed (no action needed):**

- `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-router-ssr-query`
- `@tanstack/react-form`, `zod`
- `sonner`, `lucide-react`, `date-fns`
- shadcn UI primitives under `src/components/ui`
- `react-hook-form` (kept for shadcn's `form.tsx` only — new feature forms use TanStack Form)

**Workspace dependencies:**

- `@eventbid/shared` — types and Zod schemas (already created by backend Phase 1, Step 3). Add it to `apps/web/package.json` as a workspace dep: `"@eventbid/shared": "workspace:*"`.
- `@eventbid/logger` — add `"@eventbid/logger": "workspace:*"` to `apps/web/package.json`. The browser conditional export resolves automatically — no explicit subpath needed.

---

## Phase 1 — Foundation

These steps produce no visible UI changes but every later step depends on them. Get them right and the rest is mechanical.

---

### Step 1 — Env validation + Zod form adapter

**Goal:** Frontend reads a typed env at startup. A custom Zod v4 form adapter replaces the incompatible published package.

**Files to create:**

- `apps/web/src/lib/env.ts` — Zod-validated env object
- `apps/web/src/lib/zod-form-adapter.ts` — thin Zod v4 adapter for TanStack Form

**What to implement:**

```ts
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),
})

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
})
```

Add `apps/web/.env.local` with `VITE_API_URL=http://localhost:3001` and `VITE_LOG_LEVEL=debug`. (Already created during setup.)

`apps/web/src/lib/zod-form-adapter.ts`:

```ts
import type { ZodSchema } from 'zod'

export function zodValidator<T>(schema: ZodSchema<T>) {
  return {
    validate: ({ value }: { value: unknown }) => {
      const result = schema.safeParse(value)
      if (result.success) return undefined
      return result.error.issues.map((i) => i.message).join(', ')
    },
  }
}
```

Usage in forms: pass `validators: { onSubmit: zodValidator(mySchema) }` to `useForm`.

**✅ Done when:**

- `pnpm --filter web dev` starts and the home page renders unchanged
- Missing `VITE_API_URL` causes a readable Zod error at startup
- `zodValidator` is importable from `#/lib/zod-form-adapter`

---

### Step 2 — Query key factory

**Goal:** One central, typed registry of cache keys.

**Files to create:**

- `apps/web/src/lib/query-keys.ts`

**What to implement:**

Export the `qk` object exactly as defined in `FRONTEND-ARCHITECTURE.md` §5.3. No queries consume it yet — this is just a scaffold.

**✅ Done when:**

- `import { qk } from '#/lib/query-keys'` resolves
- TypeScript autocomplete works for `qk.briefs.detail('id')`

---

### Step 3 — Browser API client

**Goal:** Single typed fetch wrapper for client-side calls.

**Files to create:**

- `apps/web/src/lib/api-client.ts`

**What to implement:**

Implement `apiClient` from `FRONTEND-ARCHITECTURE.md` §8 (browser variant). Export the `ApiError` class. Throw `ApiError` on non-2xx responses with the server's `code` and `message`.

**✅ Done when:**

- `apiClient.get('/health')` resolves with `{ status: 'ok' }` from the backend
- A 404 response throws an `ApiError` with `status: 404`
- `credentials: 'include'` is set on every request

---

### Step 4 — Server-side API client + server function scaffold

**Goal:** Server functions can talk to the backend with the user's session cookie forwarded.

**Files to create:**

- `apps/web/src/server/_client.ts` — `apiServer` helper

**What to implement:**

Implement `apiServer` from `FRONTEND-ARCHITECTURE.md` §8 (server variant). It accepts an optional `cookieHeader` and forwards it. Reads `API_URL_INTERNAL` first, falls back to `VITE_API_URL`.

**✅ Done when:**

- File compiles
- No call sites yet — this is wiring only

---

### Step 5 — QueryClient + SSR integration

**Goal:** One QueryClient hydrates server → browser. Devtools mounted.

**Files to create:**

- `apps/web/src/lib/query-client.ts` — `makeQueryClient()`

**Files to edit:**

- `apps/web/src/router.tsx` — register QueryClient + call `setupRouterSsrQueryIntegration`
- `apps/web/src/routes/__root.tsx` — add `<Toaster />` from sonner

**What to implement:**

`makeQueryClient` per `FRONTEND-ARCHITECTURE.md` §5.1.

In `router.tsx`:

```ts
const queryClient = makeQueryClient()
const router = createTanStackRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  context: { queryClient },
})
setupRouterSsrQueryIntegration({ router, queryClient })
return router
```

In `__root.tsx`, mount the Sonner `<Toaster />` (bottom-right per `FRONTEND-DESIGN.md` §8).

**✅ Done when:**

- App boots, `/` renders unchanged
- React Query devtools appear in the existing TanStack devtools panel
- No console errors about hydration mismatch

---

## Phase 2 — Layouts & Auth

The visible app starts here. After this phase, users can register, log in, log out, and land on an empty shell.

---

### Step 6 — Layout route groups (empty)

**Goal:** File-based layout groups exist. Children render under their group.

**Files to create:**

- `apps/web/src/routes/_public/route.tsx` — passthrough `<Outlet />`
- `apps/web/src/routes/_app/route.tsx` — placeholder `<div><Outlet /></div>` (real shell in Step 10)
- `apps/web/src/routes/_app/host/route.tsx` — passthrough
- `apps/web/src/routes/_app/venue/route.tsx` — passthrough

**Move:**

- `apps/web/src/routes/index.tsx` stays at root (public landing). No move needed.

**✅ Done when:**

- `routeTree.gen.ts` regenerates with the new layout routes
- `/` still renders the landing page

---

### Step 7 — Auth server functions

**Goal:** `meQuery` and login/register/logout server functions exist.

**Files to create:**

- `apps/web/src/server/auth.ts`

**What to implement:**

```ts
export const fetchMe = createServerFn({ method: 'GET' }).handler(async () => {
  const cookieHeader = getCookieHeader(getEvent())
  if (!cookieHeader) return null
  try {
    return await apiServer<User>('/auth/me', { cookieHeader })
  } catch {
    return null
  }
})

export const meQuery = queryOptions({
  queryKey: qk.me,
  queryFn: () => fetchMe(),
  staleTime: 60_000,
})
```

`User` type comes from `@eventbid/shared`.

**✅ Done when:**

- `meQuery` is importable
- Calling `fetchMe()` from a loader returns `null` when no cookie is present

---

### Step 8 — Login page

**Goal:** Email + password login works end-to-end against the backend.

**Files to create:**

- `apps/web/src/routes/_public/login.tsx`
- `apps/web/src/components/auth/LoginForm.tsx`

**What to implement:**

- TanStack Form with Zod validator (`{ email: z.string().email(), password: z.string().min(8) }`)
- Layout per `FRONTEND-DESIGN.md` §6 Auth Pages (`max-w-sm mx-auto`, centered)
- Login mutation hits `POST /auth/login`
- On success: `queryClient.invalidateQueries({ queryKey: qk.me })`, `router.invalidate()`, navigate to `next` search param or `/`
- Search param schema: `validateSearch: z.object({ next: z.string().optional() })`
- Google OAuth button: anchor tag to `${VITE_API_URL}/auth/google`

**✅ Done when:**

- Submitting valid credentials sets the session cookie and redirects
- Submitting invalid credentials shows the server's error message via toast
- Form validation errors render below the inputs per `FRONTEND-DESIGN.md` §7 Form Inputs

---

### Step 9 — Register page

**Goal:** New users can sign up as `host` or `venue_rep`.

**Files to create:**

- `apps/web/src/routes/_public/register.tsx`
- `apps/web/src/components/auth/RegisterForm.tsx`
- `apps/web/src/components/auth/RoleSelector.tsx`

**What to implement:**

- Role selector: two side-by-side cards per `FRONTEND-DESIGN.md` §6 ("I'm planning an event" / "I represent a venue")
- Form fields: name, email, password, role (from selector)
- POST `/auth/register`
- On success: same flow as login

**✅ Done when:**

- Registering a host lands them at `/` (will land at `/host/briefs` after Step 11)
- Registering with an existing email shows the server's error

---

### Step 10 — AppShell + NavBar + auth guard

**Goal:** Authenticated routes redirect anonymous users to `/login`. Logged-in users see the nav.

**Files to create:**

- `apps/web/src/components/app/NavBar.tsx`
- `apps/web/src/components/app/UserMenu.tsx`

**Files to edit:**

- `apps/web/src/routes/_app/route.tsx` — `beforeLoad` guard + render `<NavBar />` + `<Outlet />`

**What to implement:**

`beforeLoad` per `FRONTEND-ARCHITECTURE.md` §7:

```ts
beforeLoad: async ({ context, location }) => {
  const user = await context.queryClient.ensureQueryData(meQuery)
  if (!user) throw redirect({ to: '/login', search: { next: location.href } })
  return { user }
},
```

NavBar per `FRONTEND-DESIGN.md` §3: logo left, role-aware links center-right, bell + avatar right. Bell and notifications page are wired in Phase 5 — render a static bell icon for now. UserMenu dropdown: account link (no-op for now) + sign out (calls `POST /auth/logout`, then `queryClient.clear()`, then `router.navigate({ to: '/login' })`).

Mobile nav: hamburger drawer per `FRONTEND-DESIGN.md` §3.

**✅ Done when:**

- Visiting `/host/briefs` while logged out redirects to `/login?next=/host/briefs`
- After login, the NavBar renders with the correct links for the user's role
- Sign out clears state and lands on `/login`

---

### Step 11 — Role guards + post-login routing  [x]

**Goal:** Hosts can't reach `/venue/*` and vice versa. Login lands users on their home route.

**Files to edit:**

- `apps/web/src/routes/_app/host/route.tsx` — role guard
- `apps/web/src/routes/_app/venue/route.tsx` — role guard
- `apps/web/src/components/auth/LoginForm.tsx` — pick default `next` based on role
- `apps/web/src/components/auth/RegisterForm.tsx` — same

**What to implement:**

```ts
// _app/host/route.tsx
beforeLoad: ({ context }) => {
  if (context.user.role !== 'host') throw redirect({ to: '/venue/feed' })
},
```

Mirror for venue. After login, default `next` is `/host/briefs` for hosts and `/venue/feed` for venue reps.

**✅ Done when:**

- A host visiting `/venue/feed` is redirected to `/host/briefs`
- A venue rep visiting `/host/briefs` is redirected to `/venue/feed`

---

## Phase 3 — Host Journey

The host can now create briefs, see proposals, and accept one.

---

### Step 12 — Brief server functions  [x]

**Goal:** Server functions and query options for briefs.

**Files to create:**

- `apps/web/src/server/briefs.ts`

**What to implement:**

Per `FRONTEND-ARCHITECTURE.md` Appendix B:

- `fetchBriefsList({ cursor, status })` → list with cursor
- `fetchBrief(id)`
- `fetchProposals(briefId)` (for host view)
- `fetchAnalysis(briefId)`
- Export matching `queryOptions`: `briefsListQuery`, `briefQuery`, `proposalsQuery`, `analysisQuery`

All forward the session cookie via `apiServer`.

**✅ Done when:**

- Server functions compile and call the backend successfully (test via a temporary loader log)

---

### Step 13 — `/host/briefs` list page  [x]

**Goal:** Hosts see their own briefs, paginated, with status badges.

**Files to create:**

- `apps/web/src/routes/_app/host/briefs/index.tsx`
- `apps/web/src/components/brief/BriefListRow.tsx`
- `apps/web/src/components/brief/BriefStatusBadge.tsx`
- `apps/web/src/components/app/EmptyState.tsx` (reusable)

**What to implement:**

- `validateSearch` with `cursor`, `status`
- `loader` prefetches `briefsListQuery({ cursor, status })`
- Row layout per `FRONTEND-DESIGN.md` §6 (event type, status, date · headcount · budget, proposal count + deadline)
- `border-b border-border` between rows, no card boxes
- Empty state per design §7
- "Create Brief" button top-right linking to `/host/briefs/new`

**✅ Done when:**

- Logged-in host sees their briefs (empty state if none)
- Status filter pills update URL search params and refetch
- Clicking a row navigates to `/host/briefs/$briefId` (404 placeholder until Step 16)

---

### Step 14 — Brief creation wizard (skeleton + steps 1-2)  [x]

**Goal:** Hosts can start a brief. Step 1-2 collect data; no submission yet.

**Files to create:**

- `apps/web/src/routes/_app/host/briefs/new.tsx`
- `apps/web/src/components/brief/BriefWizardLayout.tsx`
- `apps/web/src/components/brief/steps/EventBasicsStep.tsx`
- `apps/web/src/components/brief/steps/LocationBudgetStep.tsx`

**What to implement:**

- `validateSearch: z.object({ step: z.coerce.number().min(1).max(4).default(1) })`
- Wizard layout per `FRONTEND-DESIGN.md` §6: back link, page title, step indicator, body, `Back`/`Continue` bottom-right
- TanStack Form state held at the wizard layout level — survives step navigation
- Step 1: event type (radio cards), date range, headcount
- Step 2: city, state, budget min/max
- `Continue` updates `?step=` only after the current step validates against the shared Zod schema slice

**✅ Done when:**

- Hosts can navigate steps 1 ↔ 2 via the URL
- Browser back/forward preserves form state
- `Continue` disabled when current step is invalid

---

### Step 15 — Brief wizard steps 3-4 + submission  [x]

**Goal:** Brief creation submits to the backend and lands on the new brief's detail page.

**Files to create:**

- `apps/web/src/components/brief/steps/RequirementsStep.tsx`
- `apps/web/src/components/brief/steps/ReviewStep.tsx`
- `apps/web/src/components/brief/BriefImproveStreamPanel.tsx` (placeholder — stream wired in Step 22)

**What to implement:**

- Step 3: requirement toggleable tags (`bg-accent/60` pill pattern from design §7), description textarea, "✦ Improve with AI" ghost link (no-op until Step 22)
- Step 4: read-only review, quality warnings list (warnings come from the create response — see below), `Submit brief` button
- `useCreateBrief` mutation: `POST /briefs` → returns `{ brief, warnings }`. If `warnings.length > 0` and user is not yet on step 4, route them there to confirm; otherwise submit and navigate to `/host/briefs/$briefId`
- Simpler v1: backend already returns warnings in the create response — show them on step 4 before final submit by hitting the API first with a `dryRun=true` flag if it exists, or accept that warnings are post-submit and just toast them after creation. **Pick post-submit toast for v1** to keep the contract clean.

**✅ Done when:**

- Submitting a valid brief creates a row in the backend, navigates to the detail page (404 placeholder until Step 16), and toasts any warnings
- `briefsListQuery` is invalidated so the list reflects the new brief on back-navigation
- Validation errors surface inline; submit is blocked

---

### Step 16 — Brief detail layout route  [x]

**Goal:** Loading a brief detail page prefetches brief + proposals + analysis in parallel.

**Files to create:**

- `apps/web/src/routes/_app/host/briefs/$briefId/route.tsx`
- `apps/web/src/routes/_app/host/briefs/$briefId/index.tsx`
- `apps/web/src/components/brief/BriefDetailHeader.tsx`
- `apps/web/src/components/brief/BriefSummaryBlock.tsx`

**What to implement:**

- Layout route loader does `Promise.all` on the three queries per `FRONTEND-ARCHITECTURE.md` Appendix A
- Header per `FRONTEND-DESIGN.md` §6: back link, title, contextual action ("Close Brief" — wired in Step 18), context bar (status · proposals · deadline)
- Summary block (`bg-muted/40 rounded-lg p-6`) showing what the host asked for
- The detail tab (`index.tsx`) renders the summary block and a placeholder proposals section (real cards in Step 17)

**✅ Done when:**

- Visiting `/host/briefs/$briefId` for a real brief renders the header and summary block
- Network tab shows three parallel API calls, not serial
- Refresh restores from SSR — no client-side loading flash

---

### Step 17 — Proposal cards + AI analysis (inline)  [x]

**Goal:** Host sees proposal cards (responsive grid for 3+) and can view AI analysis inline.

**Files to create:**

- `apps/web/src/components/proposal/ProposalCard.tsx`
- `apps/web/src/components/proposal/ProposalGrid.tsx`
- `apps/web/src/components/analysis/AnalysisPanel.tsx`
- `apps/web/src/lib/format.ts` — `formatRupees`, `formatDate` (Indian formatting per design §5)

**What to implement:**

- Grid logic per `FRONTEND-DESIGN.md` §6: stack ≤2, grid for 3+
- Card content: venue name, location, price (the one `text-xl` in a card), inclusions with checkmarks
- "Proposals (n)" heading with "✦ View AI Analysis" button right-aligned
- Analysis panel renders inline below proposals when toggled (not a modal). Reads from `analysisQuery` cache
- Analysis states: `not_started` → hide button; `running` → show "Analysing..." with spinner; `complete` → show panel; `stale` → dim panel + "Proposals have changed" inline message
- "View Full Proposal" button currently no-op (modal in Step 18)

**✅ Done when:**

- Cards render in the right layout for 1, 2, and 3+ proposals
- Toggling the analysis panel reveals/hides it without a network call (cache hit)
- All states (`not_started`, `running`, `complete`, `stale`) render correctly with mock data

---

### Step 18 — Accept proposal mutation + close brief  [x]

**Goal:** Host can accept a proposal and close a brief, with confirmation dialogs.

**Files to create:**

- `apps/web/src/components/proposal/AcceptProposalDialog.tsx`
- `apps/web/src/components/brief/CloseBriefDialog.tsx`
- `apps/web/src/hooks/use-mutations/use-accept-proposal.ts`
- `apps/web/src/hooks/use-mutations/use-close-brief.ts`

**What to implement:**

- Accept: shadcn `AlertDialog` per `FRONTEND-DESIGN.md` §7. Confirm button text is specific ("Yes, accept proposal")
- `useAcceptProposal`: `POST /briefs/:id/proposals/:pid/accept`. On success, invalidate `briefQuery(id)` and `proposalsQuery(id)`. On `DEAL_LOCK_FAILED` (409), toast and invalidate so UI reconciles
- Close brief mutation: `PATCH /briefs/:id` with `status: 'closed'` (or whichever the backend exposes — `DELETE` only allowed when 0 proposals; for closing with proposals use status update). Verify against backend Step 25.
- Disabled states per design §9: accept button disabled when brief is `closed`

**✅ Done when:**

- Accepting a proposal updates the page state (winning proposal shows accepted, others show closed, brief shows closed) after server confirms
- Concurrent accept: second attempt shows the conflict toast and the UI reconciles
- Confirmation dialog never bypassed

---

### Step 19 — Proposal full-view modal  [x]

**Goal:** "View Full Proposal" opens a quick-look dialog with all proposal fields.

**Files to create:**

- `apps/web/src/components/proposal/ProposalDetailDialog.tsx`

**What to implement:**

- shadcn `Dialog`
- Reads from existing cache — no extra fetch
- Shows: venue name + city link to public venue page (Step 24), full price + price type, inclusions, amenities, catering type, capacity confirmation, availability confirmation, notes
- "Accept" button inside the dialog opens the accept confirmation (Step 18)

**✅ Done when:**

- Clicking "View Full Proposal" opens the dialog with no network call
- Closing the dialog returns to the brief detail page unchanged

---

### Step 20 — `PATCH /briefs/:id` (edit brief) — open only  [x]

**Goal:** Hosts can edit a brief while it's `open` (deadline, description, requirements). Closed/evaluating: edit disabled.

**Files to create:**

- `apps/web/src/routes/_app/host/briefs/$briefId/edit.tsx`
- `apps/web/src/components/brief/BriefEditForm.tsx`

**What to implement:**

- Reuses the wizard's step components but as a single-page form (not multi-step)
- Loader prefetches the brief
- Submits `PATCH /briefs/:id`
- Hidden / disabled when `status !== 'open'`
- Edit affordance: a small "Edit" link in the brief detail header (right of title, ghost variant)

**✅ Done when:**

- Editing an open brief succeeds and the detail page reflects the change
- Edit link doesn't render for closed/evaluating/expired briefs

---

### Step 21 — Delete brief (open + 0 proposals only)  [x]

**Goal:** Host can delete an empty open brief.

**Files to edit:**

- `apps/web/src/components/brief/BriefDetailHeader.tsx` — add delete affordance under conditions

**What to implement:**

- "Delete brief" in the user menu of the header (low-priority placement)
- Visible only when `status === 'open'` AND proposals count is 0
- `AlertDialog` confirmation
- `DELETE /briefs/:id` → navigate back to `/host/briefs`

**✅ Done when:**

- Delete is invisible when the brief has any proposal
- Deleting an empty open brief removes it from the list

---

### Step 22 — Brief improve streaming  [x]

**Goal:** "✦ Improve with AI" streams improved description text into a preview panel; "Apply" copies it into the form.

**Files to create:**

- `apps/web/src/hooks/use-stream-text.ts`

**Files to edit:**

- `apps/web/src/components/brief/BriefImproveStreamPanel.tsx` — wire to the hook
- `apps/web/src/components/brief/steps/RequirementsStep.tsx` — connect the ghost link

**What to implement:**

`useStreamText` per `FRONTEND-ARCHITECTURE.md` §10. Panel renders below the textarea per `FRONTEND-DESIGN.md` §6 (Brief Creation Wizard). Apply button writes the streamed text into the form field; original text preserved until apply.

**✅ Done when:**

- Clicking "✦ Improve with AI" streams text chunk-by-chunk into the preview
- "Apply" replaces the description field; "Cancel" closes the panel and discards
- The original description is restored if the user cancels

---

## Phase 4 — Venue Journey

The venue rep can manage their profile, see matched briefs, and submit proposals.

---

### Step 23 — Venue server functions  [x]

**Files to create:**

- `apps/web/src/server/venues.ts`
- `apps/web/src/server/proposals.ts`

**What to implement:**

- `fetchVenueMe`, `fetchVenueById`, `fetchFeed({ cursor, eventType })`, `fetchMyProposals({ cursor, status })`
- Matching `queryOptions` exports
- `updateVenue`, `submitProposal`, `reviseProposal` are mutation helpers (called client-side via `apiClient`, not server functions)

**✅ Done when:**

- All compile and call the backend successfully via temporary loader logs

---

### Step 24 — Venue profile page (basic info + details)  [x]

**Files to create:**

- `apps/web/src/routes/_app/venue/profile.tsx`
- `apps/web/src/components/venue/VenueProfileForm.tsx`
- `apps/web/src/components/venue/TagPicker.tsx`

**What to implement:**

- Loader prefetches `venueMeQuery`
- Two sections per `FRONTEND-DESIGN.md` §6: Basic info, Details (capacity, event types, style tags, amenities as toggleable pills)
- `PUT /venues/me` with optimistic update on `qk.venues.me`; rollback on error
- Save button bottom-right, sticky on mobile

**✅ Done when:**

- Loading the page shows the venue's current profile
- Toggling tags + saving updates the backend and the UI persists across navigation
- Validation errors render inline

---

### Step 25 — Public venue page  [x]

**Files to create:**

- `apps/web/src/routes/_app/venue/$venueId.tsx`

**What to implement:**

- Read-only view at `/venue/$venueId` — used by hosts to view a venue from a proposal card
- Loader prefetches `venueByIdQuery`
- Shows name, city, capacity, event types, style tags, amenities, photos, contact

**✅ Done when:**

- A host visiting `/venue/$venueId` sees a read-only profile
- The "venue name" in a proposal card links here

---

### Step 26 — Photo uploader

**Files to create:**

- `apps/web/src/components/venue/VenuePhotoUploader.tsx`
- `apps/web/src/components/venue/VenuePhotoGrid.tsx`

**Files to edit:**

- `apps/web/src/routes/_app/venue/profile.tsx` — add the Photos section

**What to implement:**

- 2-column grid per `FRONTEND-DESIGN.md` §6, max 6 photos, delete on hover
- Client validation: JPEG/PNG/WebP, 5 MB max
- `apiClient.upload('/venues/me/photos', formData)`
- Optimistic delete via `DELETE /venues/me/photos/:pid`
- Invalidate `qk.venues.me` after upload/delete

**✅ Done when:**

- Uploading a JPEG appears in the grid after save
- A 6 MB upload is rejected client-side with a toast
- Delete removes the photo immediately and persists

---

### Step 27 — `/venue/feed` matched briefs

**Files to create:**

- `apps/web/src/routes/_app/venue/feed.tsx`
- `apps/web/src/components/venue/FeedRow.tsx`
- `apps/web/src/components/venue/MatchScoreDots.tsx`

**What to implement:**

- `validateSearch` with `cursor`, `eventType`
- Filter pills per design §6
- Row layout per design: title + deadline, date · headcount · budget, city · match score dots (5-dot scale, tooltip exact %)
- Empty state for no matches yet
- Clicking a row navigates to `/venue/briefs/$briefId`

**✅ Done when:**

- Feed shows matched briefs with score dots
- Filter pills update URL and refetch
- Empty state shows when no matches exist

---

### Step 28 — `/venue/briefs/$briefId` read view + propose page

**Files to create:**

- `apps/web/src/routes/_app/venue/briefs/$briefId/route.tsx`
- `apps/web/src/routes/_app/venue/briefs/$briefId/index.tsx` (read brief)
- `apps/web/src/routes/_app/venue/briefs/$briefId/propose.tsx`
- `apps/web/src/components/proposal/ProposalForm.tsx`

**What to implement:**

- Read view: brief detail (reuse `BriefSummaryBlock` from Step 16)
- Propose form per `FRONTEND-DESIGN.md` §6: grouped sections (Pricing, What's included, Availability & Capacity, Notes), submit at bottom
- Prefill from existing active proposal if any (revise mode)
- Submit calls `POST /briefs/:id/proposals` (or `PATCH .../proposals/:pid` if revising)
- On success: navigate to `/venue/proposals`, invalidate proposals queries

**✅ Done when:**

- A venue rep can submit a proposal that appears in the host's brief detail page
- Revising an existing proposal creates a new version and supersedes the old (verified via backend)
- Submitting against a `closed`/`expired` brief shows the server's error toast

---

### Step 29 — `/venue/proposals` page

**Files to create:**

- `apps/web/src/routes/_app/venue/proposals.tsx`
- `apps/web/src/components/proposal/MyProposalRow.tsx`

**What to implement:**

- Pattern per `FRONTEND-DESIGN.md` §6 "Venue Rep — My Proposals"
- Filter pills with counts: All, Active, Locked, Closed, Superseded
- Row layout with extended status badge palette
- Empty state per design

**✅ Done when:**

- All filters work and counts update with the data
- Locked proposals show "You won this brief" on the third row line
- Clicking a row navigates to the brief read view with the proposal expanded

---

## Phase 5 — Real-time + Notifications

The app becomes live. SSE drives cache invalidation and the notification bell.

---

### Step 30 — SSE manager + connect in shell

**Files to create:**

- `apps/web/src/lib/sse.ts` — `SSEManager` singleton

**Files to edit:**

- `apps/web/src/routes/_app/route.tsx` — `useEffect(() => { sse.connect(); return () => sse.disconnect() }, [])`

**What to implement:**

`SSEManager` per `FRONTEND-ARCHITECTURE.md` §9. One `EventSource` per session. Lifecycle bound to the `_app` layout — survives in-app navigation.

**✅ Done when:**

- DevTools network panel shows one open EventSource at `/sse` while authenticated
- Navigating between `/host/briefs` and `/host/briefs/$briefId` does not reopen the connection
- Sign out closes the connection

---

### Step 31 — Event-to-invalidation map

**Files to create:**

- `apps/web/src/hooks/use-sse-invalidations.ts`

**Files to edit:**

- `apps/web/src/routes/_app/route.tsx` — mount the hook

**What to implement:**

The handler map per `FRONTEND-ARCHITECTURE.md` §9. Each event subscribes to a precise invalidation:

- `proposal.received` → invalidate `qk.briefs.proposals(briefId)` + `qk.notifications.list()` + toast
- `analysis.ready` → invalidate `qk.briefs.analysis(briefId)` + toast
- `analysis.stale` → setQueryData to mark analysis stale (no toast)
- `brief.matched` → invalidate `qk.venues.feed()` + toast
- `proposal.accepted` → invalidate brief + proposals (venue) + toast
- `brief.closed` → invalidate brief detail
- `deal.locked` → invalidate brief detail

**✅ Done when:**

- Submitting a proposal as a venue rep updates the host's brief detail page in real time (with the host's tab open)
- Accepting a proposal as the host updates the venue rep's proposals list in real time
- No `invalidateQueries({})` calls anywhere (blanket invalidation)

---

### Step 32 — Notification bell + dropdown

**Files to create:**

- `apps/web/src/components/app/NotificationBell.tsx`
- `apps/web/src/components/app/NotificationDropdown.tsx`
- `apps/web/src/server/notifications.ts`
- `apps/web/src/hooks/use-mutations/use-mark-read.ts`

**Files to edit:**

- `apps/web/src/components/app/NavBar.tsx` — replace static bell with `<NotificationBell />`

**What to implement:**

- `notificationsListQuery` server function + queryOptions
- Bell shows `bg-primary` dot when any unread per design §3
- Dropdown shows last 5 notifications, `border-b` separators
- Each row is clickable — navigates to the relevant brief/proposal and marks as read
- `useMarkRead`: `PATCH /notifications/:id/read` with optimistic update (`onMutate` patches `read: true`, rolls back on error)

**✅ Done when:**

- Dot appears when an SSE notification arrives
- Clicking a notification navigates to its target and the dot clears if no more unread remain
- Notification list updates when SSE delivers a new event

---

### Step 33 — Notifications page

**Files to create:**

- `apps/web/src/routes/_app/notifications.tsx`

**What to implement:**

- Layout per `FRONTEND-DESIGN.md` §6 (`max-w-2xl`)
- Cursor-paginated full list
- "Mark all read" button (ghost variant) visible only when unread > 0
- `useMarkAllRead`: `PATCH /notifications/read-all` with optimistic update
- Unread vs read styling per design (left border `border-l-2 border-primary` for unread)

**✅ Done when:**

- Page shows all notifications, paginated
- Mark all read clears unread state for the entire list and the bell dot
- Unread / read visual treatment matches the design doc

---

## Phase 6 — Polish

---

### Step 34 — Error handling

**Files to create:**

- `apps/web/src/components/app/RouteError.tsx`
- `apps/web/src/components/app/RouteSkeleton.tsx`
- `apps/web/src/components/app/NotFound.tsx`

**Files to edit:**

- `apps/web/src/router.tsx` — `defaultErrorComponent`, `defaultPendingComponent`, `defaultNotFoundComponent`
- `apps/web/src/lib/api-client.ts` — global `UNAUTHORIZED` interceptor (event bus pattern)

**What to implement:**

- Error code → UX table per `FRONTEND-ARCHITECTURE.md` §14
- `RouteError`: 500-style message, reload button
- `NotFound`: per `FRONTEND-DESIGN.md` §8 Error Pages
- 401 interceptor: clear cache + redirect to `/login`. The interceptor publishes to a tiny event bus (`window.addEventListener('eventbid:unauthorized', ...)`) which `_app/route.tsx` subscribes to — keeps `api-client.ts` decoupled from the router.

**✅ Done when:**

- Throwing an error in any loader shows the route error component
- 404 routes show the not-found component
- A 401 from the API anywhere in the app redirects to `/login` and clears the cache

---

### Step 35 — Loading states

**Files to edit:**

- All list routes — add a list skeleton (3 muted rows)
- Brief detail — set `pendingMs: 200`, `pendingMinMs: 400`
- Define a shared `<ListSkeleton rows={3} />` component

**What to implement:**

Per `FRONTEND-DESIGN.md` §7 Loading States:

- Lists: 3 `bg-muted animate-pulse rounded h-16` rows
- Detail pages: header renders immediately from SSR; only content section pulses while loaders settle
- AI analysis: stream text directly — no skeleton

**✅ Done when:**

- Slow network simulation shows skeletons matching the real layout heights
- Detail page header is always present immediately, never replaced by a skeleton

---

### Step 36 — Logger wiring

**Goal:** A single browser logger instance, used everywhere we'd otherwise reach for `console.*`. No error-monitoring SaaS in v1 — the logger is the only sink.

**Files to create:**

- `apps/web/src/lib/logger.ts`

**Files to edit:**

- `apps/web/src/lib/api-client.ts` — log non-2xx responses at `warn`, network failures at `error`
- `apps/web/src/components/app/RouteError.tsx` — log the captured error at `error` in a `useEffect`
- `apps/web/src/hooks/use-sse-invalidations.ts` — log unknown SSE event types at `warn`
- `apps/web/src/lib/sse.ts` — log connection open/close at `debug`, reconnect attempts at `info`

**What to implement:**

```ts
// apps/web/src/lib/logger.ts
import { createLogger } from '@eventbid/logger'
import { env } from './env'

export const logger = createLogger({
  name: 'eventbid-web',
  level: env.VITE_LOG_LEVEL,
})
```

The browser conditional export in `@eventbid/logger/package.json` resolves to `src/browser.ts`, which wraps Pino's browser build (writes to `console`, structured, level-filtered). No bundler config needed beyond what Vite already does.

Usage pattern — pass an object as the first arg for structured fields, then the message:

```ts
import { logger } from '#/lib/logger'

logger.error({ err, path, status }, 'API request failed')
logger.warn({ event: e.type }, 'unknown SSE event')
```

Never `console.log` in production code. If you find yourself reaching for it, use `logger.debug` instead — it's level-filtered in production.

**✅ Done when:**

- `logger.info('boot')` appears in the browser console with the `eventbid-web` name attached
- Setting `VITE_LOG_LEVEL=warn` silences `info`/`debug` lines in dev
- All `console.*` calls in non-test code have been replaced with `logger.*` (grep `apps/web/src` to verify)
- A thrown error inside a loader produces an `error`-level log line with the stack

---

### Step 37 — End-to-end smoke test

Mirror Step 31 of `BACKEND.md` through the UI. Two browser windows / two accounts.

**Host journey:**

1. Register as host → land on `/host/briefs` (empty state)
2. Create a brief through the wizard → land on the detail page
3. See "Waiting for proposals" empty state

**Venue rep (second window):**

4. Register as venue rep → land on `/venue/feed` (empty until embedding completes)
5. Create venue profile + upload a photo
6. Wait for the matching job — brief appears in feed via SSE (`brief.matched`)
7. Click the brief, submit a proposal

**Back to host:**

8. See SSE `proposal.received` toast and the count update
9. Open a second venue rep, submit another proposal → `ai-analysis` enqueues
10. Host receives `analysis.ready` SSE → "View AI Analysis" appears
11. Host opens the analysis panel and accepts a proposal
12. Confirmation dialog → accept → brief closes, proposal locks
13. Winning venue rep sees `proposal.accepted` toast; losing venue rep sees `brief.closed`
14. Notifications page shows all events for both users

**✅ Done when:**

- All 14 steps pass without console errors
- No 500s or 401s in the network tab during the flow
- All toasts and SSE updates fire at the right moments
- The notification bell dot appears for both users at the right times

---

## What's next after this

Once Step 37 passes, the v1 frontend is complete. Open follow-ups:

- Landing page design pass (out of scope for this plan)
- Settings page (per `FRONTEND-DESIGN.md` §6 — placeholder route + content)
- Mobile QA across the host and venue journeys (drawer nav, touch targets, modal sizing)
- Performance baseline: Lighthouse on the four primary pages (`/host/briefs`, `/host/briefs/$briefId`, `/venue/feed`, `/venue/profile`)

---

*Frontend implementation plan — v1.0*
*Covers: 37 steps across 6 phases*
*Estimated granularity: each step is 1–3 hours of focused work*
