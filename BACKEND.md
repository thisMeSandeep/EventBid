# EventBid — Backend Implementation Plan

> One step at a time. Complete each step fully before moving to the next.
> Each step has a clear goal, exact files to create/edit, and a done condition you can verify.
> Frontend is not touched until every step here is complete.

---

## Backend setup — packages to install (do this first)

Install these before starting Phase 1 so steps below work as written.

**apps/server dependencies**

- hono
- @hono/node-server
- drizzle-orm
- postgres
- zod
- dotenv
- better-auth
- @better-auth/drizzle-adapter
- @upstash/redis
- @upstash/ratelimit
- bullmq
- ioredis
- cloudinary
- ai (use Vercel AI Gateway)

**Install later (after core backend is working)**

- @sentry/node
- @sentry/profiling-node

**apps/server devDependencies**

- drizzle-kit
- tsx
- typescript
- @types/node

**packages/shared dependencies**

- zod
- drizzle-orm

**packages/email dependencies**

- react
- react-dom
- @react-email/components
- @react-email/render
- resend

---

## How to use this document

- Work through steps in order — later steps depend on earlier ones
- Each step ends with a **✅ Done when** checklist — don't move on until it passes
- The architecture doc (`eventbid-architecture.md`) is the source of truth for code details
- When a step is complete, mark it `[x]` in this doc

---

## Phase 1 — Foundation

These steps produce nothing visible but everything else builds on them. Get these right and the rest is straightforward.

---

### Step 1 — Drizzle client + env validation

**Goal:** Connect to Postgres. Validate env at startup. Server crashes with a clear message if a required variable is missing — never silently.

**Files to create:**

- `apps/server/src/lib/env.ts` — Zod-validated env object
- `apps/server/src/db/client.ts` — Drizzle client instance
- `apps/server/src/db/schema/index.ts` — empty barrel (populated in Step 2)

**What to implement:**

`lib/env.ts` — parse and validate `process.env` with Zod. Export a typed `env` object. Call `env.parse()` at module load time so the server refuses to start with missing variables.

`db/client.ts` — create a single Drizzle client using `postgres` (the `postgres` npm package, not `pg`). Export it as `db`. This is the one instance used everywhere.

**✅ Done when:**

- `pnpm dev:server` starts without errors when `.env` is populated
- `pnpm dev:server` crashes with a readable Zod error when a required variable is missing
- `db` is importable from `apps/server/src/db/client.ts`

---

### Step 2 — Drizzle schema

**Goal:** All tables defined in TypeScript. No migrations yet — just schema files.

**Files to create:**

- `apps/server/src/db/schema.ts` — single schema file (all tables + indexes)

**Note on auth tables:** Do NOT define `user`, `session`, `account`, or `verification` tables here. Better Auth's Drizzle adapter generates those. Our schema files only reference `user.id` as a foreign key string — we'll wire the actual FK after Better Auth is set up in Step 4.

**Schemas to implement (from architecture §3):**

- `venues` — including `embedding vector(1536)` via pgvector
- `venuePhotos`
- `briefs`
- `proposals`
- `briefVenueMatches`
- `aiAnalyses`
- `notifications`

All indexes from the architecture doc go in each schema file using Drizzle's `index()` helper.

**✅ Done when:**

- `apps/server/src/db/schema.ts` contains all tables with correct columns, types, and constraints
- `import { venues, briefs, proposals } from './db/schema'` works without TS errors
- No `any` types anywhere in schema

---

### Step 3 — Shared types package

**Goal:** Types inferred from Drizzle schema live in `packages/shared` and are importable by both apps.

**Files to create:**

- `packages/shared/src/types/venue.types.ts`
- `packages/shared/src/types/brief.types.ts`
- `packages/shared/src/types/proposal.types.ts`
- `packages/shared/src/types/index.ts`
- `packages/shared/src/schemas/brief.schema.ts` — Zod schema for `createBrief` + `updateBrief`
- `packages/shared/src/schemas/proposal.schema.ts` — Zod schema for `createProposal` + `reviseProposal`
- `packages/shared/src/schemas/venue.schema.ts` — Zod schema for `createVenue` + `updateVenue`
- `packages/shared/src/schemas/index.ts`
- `packages/shared/src/constants/event-types.ts`
- `packages/shared/src/constants/amenities.ts`
- `packages/shared/src/constants/index.ts`

**What to implement:**

Types are `InferSelectModel` / `InferInsertModel` from Drizzle — no manual type writing. Zod schemas match the brief/proposal/venue field shapes from the architecture doc.

```typescript
// Example pattern — brief.types.ts
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { briefs } from "@eventbid/server-schema"; // path alias

export type Brief = InferSelectModel<typeof briefs>;
export type CreateBriefInput = Omit<
  InferInsertModel<typeof briefs>,
  "id" | "createdAt" | "updatedAt"
>;
export type BriefStatus = Brief["status"];
```

**✅ Done when:**

- `import type { Brief, Venue, Proposal } from '@eventbid/shared'` works in server code
- `import { createBriefSchema } from '@eventbid/shared'` works in server code
- No `any` types

---

### Step 4 — Better Auth setup + first migration

**Goal:** Auth tables created in the database. `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` all work.

**Files to create:**

- `apps/server/src/lib/auth.ts` — Better Auth instance with Drizzle adapter + admin plugin
- `apps/server/src/routes/auth.routes.ts` — mount Better Auth's Hono handler
- `apps/server/src/middleware/auth.middleware.ts` — `requireAuth` and `requireRole` middleware
- `apps/server/src/db/migrations/` — first migration generated by `drizzle-kit`

**What to implement:**

`lib/auth.ts` — configure Better Auth with:

- `database`: Drizzle adapter pointing at `db`
- `plugins`: `admin()` for role support
- `socialProviders`: Google OAuth (credentials from env)
- `session`: Redis session store via Upstash

`auth.routes.ts` — mount Better Auth's built-in Hono handler on `/auth/*`. Also add a `GET /auth/me` that reads the session and returns `{ id, email, name, role }`.

`auth.middleware.ts` — `requireAuth` extracts session from cookie, sets `c.set('user', session.user)`, returns 401 if missing. `requireRole(role)` checks `user.role`, returns 403 if mismatched.

Run `pnpm db:generate` then `pnpm db:migrate` to apply Better Auth tables + your schema tables.

**✅ Done when:**

- `pnpm db:migrate` runs without errors
- All tables exist in Postgres (verify with `\dt` in psql or any DB GUI)
- `POST /auth/register` with `{ email, password, name, role: 'host' }` creates a user
- `GET /auth/me` with a valid session cookie returns the user object
- `GET /auth/me` without a cookie returns 401
- `requireRole('venue_rep')` on a host account returns 403

---

## Phase 2 — Data Access Layer

Build every repository before touching services. Repositories are the only layer that writes Drizzle queries.

---

### [x] Step 5 — VenueRepository

**Goal:** All database operations for venues and venue photos in one class.

**File to create:** `apps/server/src/db/repositories/venue.repository.ts`

**Methods to implement:**

```
findById(id)                           → Venue | null
findByUserId(userId)                   → Venue | null
create(input)                          → Venue
update(id, input)                      → Venue
findByHardFilters({ city, minCapacity, eventType })  → Venue[]  (excludes null embeddings)
scoreByEmbedding(venueIds, requirements) → { venueId, score }[]
updateEmbedding(id, embedding)         → void

// venuePhotos
createPhoto(input)                     → VenuePhoto
deletePhoto(id, venueId)               → void
findPhotosByVenueId(venueId)           → VenuePhoto[]
```

`scoreByEmbedding` uses a raw SQL query with pgvector's `<=>` cosine distance operator. It accepts a precomputed embedding vector for the brief (generated in `MatchingService`) and orders by distance. The architecture uses `ivfflat` index — this query must use `vector_cosine_ops`.

**✅ Done when:**

- Class instantiates with `new VenueRepository(db)`
- All methods have correct return types matching `@eventbid/shared` types
- `findByHardFilters` correctly excludes venues where `embedding IS NULL`

---

### [x] Step 6 — BriefRepository

**File to create:** `apps/server/src/db/repositories/brief.repository.ts`

**Methods to implement:**

```
findById(id)                           → Brief | null
findByHostId(hostId, cursor?)          → Brief[]
findOpenPastDeadline()                 → Brief[]   (used by deadline cron)
create(input)                          → Brief
update(id, input)                      → Brief
updateStatus(id, status)               → void
```

**✅ Done when:**

- `findByHostId` supports cursor pagination (returns results where `id < cursor`, ordered by `createdAt DESC`)
- `findOpenPastDeadline` returns only briefs where `status = 'open'` AND `deadline < now()`

---

### [x] Step 7 — ProposalRepository

**File to create:** `apps/server/src/db/repositories/proposal.repository.ts`

**Methods to implement:**

```
findById(id)                                → Proposal | null
findActiveByBriefId(briefId)               → Proposal[]
findByBriefIdWithVenue(briefId)            → ProposalWithVenueRow[]   (one join, flat fields)
findByVenueId(venueId, cursor?)            → Proposal[]
findLatestByVenueAndBrief(venueId, briefId) → Proposal | null
create(input)                              → Proposal
supersedeAndCreate(venueId, briefId, input) → Proposal   (marks old version superseded, inserts new)
```

**Note on versioning:** `supersedeAndCreate` runs inside a transaction — set the current `active` proposal to `superseded`, then insert the new version with `version = previous.version + 1`.

**✅ Done when:**

- `findByBriefIdWithVenue` returns a flat object with venue name, city, and contact alongside proposal fields — no nested objects
- `supersedeAndCreate` is atomic — both the supersede and insert succeed or both fail

---

### [x] Step 8 — BriefVenueMatchRepository + AnalysisRepository + NotificationRepository

Three smaller repositories in one step — each is straightforward.

**Files to create:**

- `apps/server/src/db/repositories/briefVenueMatch.repository.ts`
- `apps/server/src/db/repositories/analysis.repository.ts`
- `apps/server/src/db/repositories/notification.repository.ts`

**BriefVenueMatchRepository methods:**

```
createBatch(matches)                       → void   (upsert — ignore conflict on UNIQUE)
findByVenueId(venueId, cursor?)            → (BriefVenueMatch & { brief: Brief })[]
findByBriefId(briefId)                     → BriefVenueMatch[]
```

**AnalysisRepository methods:**

```
findByBriefId(briefId)                     → AiAnalysis | null
upsertStatus(briefId, status)              → void
upsertResults(briefId, { status, versionKey, results }) → void
```

**NotificationRepository methods:**

```
create(input)                              → Notification
findUnreadByUserId(userId, cursor?)        → Notification[]
findAfter(userId, afterId)                 → Notification[]   (for SSE replay)
markRead(id, userId)                       → void
markAllRead(userId)                        → void
```

**✅ Done when:**

- `createBatch` uses Drizzle's `onConflictDoNothing()` — duplicate matches are silently ignored
- `findAfter` correctly returns notifications created after the cursor notification's `createdAt`
- All repositories are exported from `apps/server/src/db/repositories/index.ts` as the `repositories` container object

---

### [x] Step 9 — Repository index + wiring

**Goal:** One canonical `repositories` object, instantiated once, imported by services.

**File to create:** `apps/server/src/db/repositories/index.ts`

```typescript
export const repositories = {
  venues: new VenueRepository(db),
  briefs: new BriefRepository(db),
  proposals: new ProposalRepository(db),
  briefVenueMatches: new BriefVenueMatchRepository(db),
  analyses: new AnalysisRepository(db),
  notifications: new NotificationRepository(db),
};

export type Repositories = typeof repositories;
```

**✅ Done when:**

- `import { repositories } from './db/repositories'` works anywhere in the server
- No repository imports `db` directly — they all receive it via constructor

---

## Phase 3 — Adapters

Implement each adapter interface. Services depend on these abstractions — never on the concrete providers.

---

### Step 10 — QueueAdapter (BullMQ)

**Goal:** Enqueue jobs to Redis-backed BullMQ queues.

**Files to create:**

- `apps/server/src/lib/redis.ts` — single Upstash Redis connection
- `apps/server/src/adapters/queue/queue.adapter.interface.ts`
- `apps/server/src/adapters/queue/bullmq.adapter.ts`

`lib/redis.ts` exports a single `ioredis` connection instance configured from `env.UPSTASH_REDIS_URL`. This instance is shared by BullMQ workers and the rate limiter.

`BullMQAdapter` lazily creates `Queue` instances per queue name (using a `Map` cache). Default job options: `attempts: 3`, `backoff: { type: 'exponential', delay: 2000 }`.

**✅ Done when:**

- `await queue.enqueue('test', { type: 'test' })` adds a job to Redis without error
- Verify with BullMQ's dashboard or by inspecting the Redis key directly

---

### Step 11 — NotifierAdapter (SSE)

**Goal:** In-memory SSE stream map. Emit events to connected users.

**Files to create:**

- `apps/server/src/adapters/notifier/notifier.adapter.interface.ts`
- `apps/server/src/adapters/notifier/sse.adapter.ts`

`SSENotifierAdapter` holds a `Map<string, SSEStreamingApi>`. `register`, `unregister`, and `emit` are the three methods. `emit` is a no-op if the user is not connected (they'll get the event via `findAfter` on next reconnect).

**✅ Done when:**

- `notifier.emit('nonexistent-user-id', 'test', {})` does not throw
- The `streams` map correctly adds and removes entries on register/unregister

---

### Step 12 — StorageAdapter (Cloudflare R2)

**Files to create:**

- `apps/server/src/adapters/storage/storage.adapter.interface.ts`
- `apps/server/src/adapters/storage/r2.adapter.ts`

`R2StorageAdapter` wraps `@aws-sdk/client-s3`. Implements `upload(key, buffer, contentType)` using `PutObjectCommand` and `deleteObject(key)` using `DeleteObjectCommand`.

**✅ Done when:**

- `await storage.upload('test/hello.txt', Buffer.from('hi'), 'text/plain')` uploads to R2
- Verify the object is visible in the R2 bucket dashboard
- `await storage.deleteObject('test/hello.txt')` removes it

---

### Step 13 — EmailAdapter (Resend)

**Files to create:**

- `apps/server/src/adapters/email/email.adapter.interface.ts`
- `apps/server/src/adapters/email/resend.adapter.ts`
- `packages/email/src/templates/new-brief-match.tsx`
- `packages/email/src/templates/proposal-accepted.tsx`
- `packages/email/src/templates/brief-closed.tsx`
- `packages/email/src/templates/deadline-reminder.tsx`
- `packages/email/src/templates/brief-expired.tsx`
- `packages/email/src/index.ts`

For each template: a React Email component that accepts typed props and renders the email HTML. Keep templates simple for now — structure and content matter more than design.

`ResendEmailAdapter.send(to, template)` calls `renderAsync()` on the React Email component, then sends via the Resend client.

**✅ Done when:**

- `await email.send('test@example.com', { type: 'new-brief-match', data: { ... } })` sends a real email
- All 5 template types render without errors
- Email arrives in the inbox (use Resend's test mode or a real address)

---

### Step 14 — AIProvider (Vercel AI SDK)

**Files to create:**

- `apps/server/src/adapters/ai/ai.provider.interface.ts`
- `apps/server/src/adapters/ai/vercel-ai.provider.ts`

**Methods to implement:**

```
analyseProposals(brief, proposals)     → AnalysisResult[]   (generateObject, Zod schema)
improveBriefDescription(desc, reqs)    → AsyncIterable<string>  (streamText)
checkBriefQuality(brief)               → { warnings: string[] }  (generateObject)
embed(text)                            → number[]   (text-embedding-3-small, 1536 dims)
```

Use `claude-sonnet-4-20250514` for all generative methods. Use `text-embedding-3-small` (OpenAI) for `embed()` — this is the only non-Anthropic model. The `embed()` discrepancy is noted in the architecture doc; it stays hidden behind the interface.

**✅ Done when:**

- `await ai.checkBriefQuality(mockBrief)` returns `{ warnings: [] }` or a list of warning strings
- `await ai.embed('test text')` returns an array of 1536 numbers
- `analyseProposals` returns typed `AnalysisResult[]` matching the Zod schema

---

## Phase 4 — Services

Services are pure business logic. They receive repositories and adapters via constructor — no direct imports of Drizzle or provider SDKs.

---

### Step 15 — VenueEmbeddingService

**File to create:** `apps/server/src/services/venue-embedding.service.ts`

Builds a text document from `styleTags`, `amenities`, `eventTypes`, and `description`. Calls `ai.embed(text)`. Calls `repos.venues.updateEmbedding(venueId, embedding)`.

This is the simplest service — good one to implement first and validate the service pattern.

**✅ Done when:**

- Calling the service with a real `venueId` populates the `embedding` column in Postgres
- Verify with `SELECT id, embedding IS NOT NULL FROM venues`

---

### Step 16 — MatchingService

**File to create:** `apps/server/src/services/matching.service.ts`

1. Load the brief
2. Hard filter venues: `repos.venues.findByHardFilters({ city, minCapacity, eventType })` — this already excludes null embeddings
3. Build a brief embedding using AI: `ai.embed(joined requirements + description)`
4. Soft score: `repos.venues.scoreByEmbedding(venueIds, briefEmbedding)`
5. Write matches: `repos.briefVenueMatches.createBatch(...)`
6. For each matched venue: enqueue `email` job + call `notifier.emit`

**✅ Done when:**

- Creates `briefVenueMatch` rows in the DB for a real brief
- Enqueues `email` jobs in BullMQ (verify in Redis)
- Handles the case where no venues match (no error, empty result)

---

### Step 17 — AnalysisService

**File to create:** `apps/server/src/services/analysis.service.ts`

Full implementation including the diff logic from the architecture doc:

1. Load brief + active proposals
2. Guard: fewer than 2 proposals → return early
3. Compute `versionKey`
4. If `versionKey` matches stored → emit `analysis.ready`, return (cache hit)
5. Set status to `running`
6. Diff: identify changed vs unchanged proposals
7. Fetch cached results for unchanged proposals
8. Call `ai.analyseProposals(brief, changedProposals)` for changed ones only
9. Merge results, upsert to DB with `complete` status
10. Emit `analysis.ready` via notifier

**✅ Done when:**

- Running the service twice with no proposal changes hits the cache (no AI call second time)
- Revising one proposal causes only that proposal to be re-analysed (verify with logs)
- Results are stored correctly in `aiAnalyses.results` JSONB

---

### Step 18 — DealLockService

**File to create:** `apps/server/src/services/deal-lock.service.ts`

The most critical service. Implement exactly as specified in the architecture doc:

1. Load brief, verify ownership, verify not already closed
2. Single Postgres transaction: lock winning proposal → close all other proposals → close brief
3. Outside transaction: enqueue `email` jobs for winner and losers
4. Emit `deal.locked` via notifier

**Note:** This is the one service that receives `db` (the Drizzle client) directly, not just `repositories` — because the transaction spans multiple tables.

**✅ Done when:**

- Two concurrent requests to lock the same brief: one succeeds, one receives `DEAL_LOCK_FAILED`
- After locking: winning proposal status is `locked`, all others are `closed`, brief status is `closed`
- Verify all three state changes happen atomically (kill the process mid-transaction — nothing partial persists)

---

### Step 19 — NotificationService

**File to create:** `apps/server/src/services/notification.service.ts`

A thin service that wraps creating a DB notification row and emitting the SSE event together. Most services emit directly to the notifier — this service is for cases where we need both the persisted row and the real-time push in one call.

```typescript
async notify(userId: string, type: NotificationType, refs: NotificationRefs): Promise<void>
// Creates notification row + emits SSE event with the row's id as the SSE event ID
```

**✅ Done when:**

- Calling `notify()` creates a row in `notifications` AND emits an SSE event
- The SSE event's `id` field equals the notification's UUID

---

### Step 20 — BriefAIService

**File to create:** `apps/server/src/services/brief-ai.service.ts`

Two methods:

- `checkQuality(brief: CreateBriefDto): Promise<{ warnings: string[] }>` — wraps `ai.checkBriefQuality()`
- `improveDescription(description: string, requirements: string[]): AsyncIterable<string>` — wraps `ai.improveBriefDescription()`

This is just a thin wrapper that lives in the service layer so route handlers don't import the AI adapter directly.

**✅ Done when:**

- `checkQuality` returns warnings for a deliberately thin brief (e.g. no description, very wide budget)
- `improveDescription` yields chunks of text that can be streamed

---

### Step 21 — Service container

**Goal:** One object that holds every instantiated service, passed to route handlers and job workers.

**File to create:** `apps/server/src/services/index.ts`

```typescript
export const services = {
  venueEmbedding: new VenueEmbeddingService(repositories, adapters.ai),
  matching: new MatchingService(
    repositories,
    adapters.ai,
    adapters.queue,
    adapters.notifier,
  ),
  analysis: new AnalysisService(repositories, adapters.ai, adapters.notifier),
  dealLock: new DealLockService(
    db,
    repositories,
    adapters.notifier,
    adapters.queue,
  ),
  notification: new NotificationService(repositories, adapters.notifier),
  briefAI: new BriefAIService(adapters.ai),
};

export type Services = typeof services;
```

Also create `apps/server/src/adapters/index.ts` as the adapters container (mirrors the repositories container pattern).

**✅ Done when:**

- `import { services } from './services'` works without circular dependency errors
- TypeScript resolves all constructor argument types without errors

---

## Phase 5 — Job Queue

---

### Step 22 — Job engine + handlers

**Files to create:**

- `apps/server/src/jobs/engine.ts`
- `apps/server/src/jobs/registry.ts`
- `apps/server/src/jobs/handlers/matching.handler.ts`
- `apps/server/src/jobs/handlers/ai-analysis.handler.ts`
- `apps/server/src/jobs/handlers/email.handler.ts`
- `apps/server/src/jobs/handlers/deadline.handler.ts`
- `apps/server/src/jobs/handlers/venue-embedding.handler.ts`

**Engine:** `JobEngine` class reads the registry and spins up one BullMQ `Worker` per entry. Wires `worker.on('failed')` to Sentry for every worker. Handles cron jobs via `queue.add('cron', {}, { repeat: { pattern } })`.

**Registry** (from architecture §8):

- `matching` — concurrency 5, retries 3
- `ai-analysis` — concurrency 2, retries 2
- `email` — concurrency 10, retries 3
- `deadline` — concurrency 1, retries 1, cron `*/5 * * * *`
- `venue-embedding` — concurrency 3, retries 3

**Handlers** are plain async functions. Each one calls the relevant service method:

- `matching.handler` → `services.matching.matchBriefToVenues(payload.briefId)`
- `ai-analysis.handler` → `services.analysis.runAnalysis(payload.briefId)`
- `email.handler` → switch on `payload.type`, call `adapters.email.send(...)` with the right template
- `deadline.handler` → query `repos.briefs.findOpenPastDeadline()`, update each to `expired`, send `brief-expired` emails
- `venue-embedding.handler` → `services.venueEmbedding.generateAndStore(payload.venueId)`

**✅ Done when:**

- `engine.start()` registers all 5 workers without error
- Manually enqueuing a `matching` job processes it and creates `briefVenueMatch` rows
- Manually enqueuing a `venue-embedding` job populates the embedding column
- `deadline` cron fires every 5 minutes (verify with logs)
- A failed job is captured in Sentry

---

## Phase 6 — Routes

Build routes in dependency order. Auth first (all other routes need it), then venues (proposals need venues), then briefs, then proposals, then notifications + SSE.

---

### Step 23 — Error handling middleware + AppError

**Files to create:**

- `apps/server/src/lib/errors.ts` — `AppError` class with `code` and `message`
- `apps/server/src/middleware/error.middleware.ts` — global Hono error handler

`AppError` maps to the error codes from architecture §7 (`NOT_FOUND`, `FORBIDDEN`, `BRIEF_CLOSED`, `DEAL_LOCK_FAILED`, etc.).

The error middleware catches `AppError` instances and returns the correct HTTP status + `{ error: { code, message } }` shape. Unknown errors return 500 and are reported to Sentry.

**✅ Done when:**

- `throw new AppError('NOT_FOUND', 'Brief not found')` in any route handler returns `{ error: { code: 'NOT_FOUND', message: 'Brief not found' } }` with status 404
- An unhandled `throw new Error('surprise')` returns status 500 and is logged to Sentry

---

### Step 24 — Venue routes

**File to create:** `apps/server/src/routes/venue.routes.ts`

**Routes to implement:**

```
GET    /venues/me                  → repos.venues.findByUserId(user.id)
PUT    /venues/me                  → repos.venues.update(...); if matchable fields changed, enqueue venue-embedding job
GET    /venues/me/feed             → repos.briefVenueMatches.findByVenueId(venueId, cursor)
GET    /venues/:id                 → repos.venues.findById(id)  [public — host views from proposal card]
POST   /venues/me/photos           → parse multipart, validate, upload to R2, write venuePhotos row
DELETE /venues/me/photos/:pid      → delete from R2, delete venuePhotos row
```

`PUT /venues/me` must check if `styleTags`, `amenities`, or `eventTypes` changed before enqueuing the embedding job — don't re-embed on a phone number update.

`POST /venues/me/photos` uses Hono's `c.req.parseBody()`. Validate: JPEG/PNG/WebP only, max 5 MB.

**✅ Done when:**

- All 6 routes return correct responses
- Photo upload with a valid JPEG creates a row in `venuePhotos` and the file appears in R2
- Photo upload with a PDF returns 422
- Photo upload over 5 MB returns 422
- Updating `styleTags` enqueues a `venue-embedding` job; updating `phone` does not

---

### Step 25 — Brief routes

**File to create:** `apps/server/src/routes/brief.routes.ts`

**Routes to implement:**

```
POST   /briefs                     → validate body, checkBriefQuality (warnings in response), create brief, enqueue matching job
GET    /briefs                     → repos.briefs.findByHostId(user.id, cursor)
GET    /briefs/:id                 → repos.briefs.findById(id) — verify ownership
PATCH  /briefs/:id                 → update fields — only allowed when status = 'open'
DELETE /briefs/:id                 → only when status = 'open' AND 0 proposals exist
POST   /briefs/:id/improve         → stream AI-improved description via SSE chunks
```

`POST /briefs` flow:

1. Validate request body against `createBriefSchema`
2. Call `services.briefAI.checkQuality(body)` — attach `warnings` to the response (don't block)
3. Create the brief via `repos.briefs.create(...)`
4. Enqueue `matching` job: `queue.enqueue('matching', { type: 'match-brief', briefId })`
5. Return `{ brief, warnings }`

`POST /briefs/:id/improve` uses `streamText` — pipe the `AsyncIterable<string>` directly to an SSE response using Hono's `streamSSE`.

Apply `rateLimit(5, '1 m')` to `/briefs/:id/analysis/trigger` and `rateLimit(10, '1 m')` to `/briefs/:id/improve`.

**✅ Done when:**

- Creating a brief enqueues a `matching` job (check Redis)
- Quality warnings are returned but don't block creation
- `GET /briefs` returns cursor-paginated results
- Patching a `closed` brief returns 409 `BRIEF_CLOSED`
- The improve endpoint streams text chunks as SSE

---

### Step 26 — Proposal routes

**File to create:** `apps/server/src/routes/proposal.routes.ts`

**Routes to implement:**

```
GET    /briefs/:id/proposals           → repos.proposals.findByBriefIdWithVenue(briefId)  [host only]
POST   /briefs/:id/proposals           → submit proposal
PATCH  /briefs/:id/proposals/:pid      → revise proposal — repos.proposals.supersedeAndCreate(...)
POST   /briefs/:id/proposals/:pid/accept → services.dealLock.lockDeal(briefId, pid, user.id)
GET    /venues/me/proposals            → repos.proposals.findByVenueId(venueId, cursor)
```

`POST /briefs/:id/proposals` flow:

1. Verify brief is `open` — reject if `evaluating`, `closed`, or `expired`
2. Verify deadline has not passed
3. Create proposal
4. Notify host: `services.notification.notify(brief.hostId, 'proposal.received', { briefId, proposalId })`
5. Enqueue `ai-analysis` job if there are now 2+ proposals on this brief

`PATCH` (revise): Call `repos.proposals.supersedeAndCreate(...)`. Mark the `aiAnalysis` for this brief as `stale` via `repos.analyses.upsertStatus(briefId, 'stale')`. Notify host of revision.

`POST .../accept`: Delegate entirely to `services.dealLock.lockDeal(...)`. Return 409 `DEAL_LOCK_FAILED` if the service throws that error code.

**✅ Done when:**

- Submitting a second proposal to a brief enqueues an `ai-analysis` job
- Revising a proposal sets the old version to `superseded` and analysis to `stale`
- Accepting a proposal: winning proposal is `locked`, all others are `closed`, brief is `closed`
- Concurrent accept requests: first wins, second gets 409

---

### Step 27 — AI Analysis routes

**File to create:** `apps/server/src/routes/analysis.routes.ts`

```
GET    /briefs/:id/analysis            → repos.analyses.findByBriefId(id)  [host only]
POST   /briefs/:id/analysis/trigger    → enqueue ai-analysis job  [host only, rate limited 5/min]
```

`GET` returns the current `aiAnalysis` row for the brief. If status is `not_started`, return it as-is — the frontend knows to show "waiting for proposals".

`POST /trigger` enqueues the job and returns `{ status: 'queued' }`. Does not wait for the result — the frontend receives the result via SSE `analysis.ready`.

**✅ Done when:**

- Triggering analysis enqueues the job (check Redis)
- Exceeding 5 triggers per minute returns 429
- `GET` returns correct status at each stage: `not_started` → `running` → `complete`

---

### Step 28 — Notification routes

**File to create:** `apps/server/src/routes/notification.routes.ts`

```
GET    /notifications                  → repos.notifications.findUnreadByUserId(user.id, cursor)
PATCH  /notifications/:id/read         → repos.notifications.markRead(id, user.id)
PATCH  /notifications/read-all         → repos.notifications.markAllRead(user.id)
```

All three require auth. No role restriction — both hosts and venue reps have notifications.

**✅ Done when:**

- Unread notifications are returned in descending `createdAt` order
- Marking one as read doesn't affect others
- `read-all` marks every unread notification for the user

---

### Step 29 — SSE route

**File to create:** `apps/server/src/routes/sse.routes.ts`

Single route: `GET /sse`

Implementation from architecture §9:

1. Authenticate the request
2. Read `Last-Event-ID` header
3. Open SSE stream via Hono's `streamSSE`
4. Register user in `SSENotifierAdapter`
5. If `Last-Event-ID` present: replay missed notifications via `repos.notifications.findAfter()`
6. Send heartbeat every 30 seconds via `setInterval`
7. On stream abort: clear interval + unregister from notifier

**✅ Done when:**

- Opening `/sse` in a browser (with valid session cookie) keeps the connection open
- Sending a notification to the user via `notifier.emit()` appears in the browser's EventSource
- Disconnecting and reconnecting with `Last-Event-ID` replays missed notifications
- Heartbeat events appear every 30 seconds in the stream

---

### Step 30 — Wire everything into `index.ts`

**Goal:** The server boots with all routes, middleware, and the job engine running.

**Update:** `apps/server/src/index.ts`

Bootstrap order:

1. Validate env (`lib/env.ts`)
2. Init Sentry (`lib/sentry.ts`)
3. Create Hono app
4. Register global middleware: Sentry error handler, CORS, request logger
5. Mount routes: `/auth`, `/briefs`, `/venues`, `/notifications`, `/sse`
6. Register global error handler middleware (from Step 23)
7. Start job engine: `engine.start()`
8. Start HTTP server

**✅ Done when:**

- `pnpm dev:server` boots with no errors
- `GET /health` returns `{ status: 'ok' }`
- All route prefixes respond (even with 401 — that means they're mounted)
- Job engine workers are running (verify with a log line per worker on startup)

---

## Phase 7 — End-to-End Verification

Run through the complete product flow manually before calling the backend done.

---

### Step 31 — Full flow smoke test

Walk through both user journeys using a REST client (Bruno, Insomnia, or curl):

**Host journey:**

1. Register as host → `POST /auth/register`
2. Create brief → `POST /briefs` — verify `matching` job enqueued
3. Check brief → `GET /briefs/:id`

**Venue journey (separate session):**

1. Register as venue rep → `POST /auth/register`
2. Create venue profile → `PUT /venues/me`
3. Upload a photo → `POST /venues/me/photos`
4. Wait for matching job to run → check `GET /venues/me/feed` — brief should appear

**Back to host:** 5. Submit proposal as venue rep → `POST /briefs/:id/proposals` 6. Submit a second proposal (second venue account) → `ai-analysis` job should enqueue 7. Wait for analysis → `GET /briefs/:id/analysis` should show `complete` 8. Accept a proposal → `POST /briefs/:id/proposals/:pid/accept` 9. Verify brief is `closed`, winning proposal is `locked`, losers are `closed` 10. Check notifications for both users

**✅ Done when:**

- All 10 steps produce the expected results
- No 500 errors anywhere in the flow
- SSE events fire at the right moments (connect a browser tab to `/sse` during the flow)

---

## What's next after this

Once Step 31 passes, the backend is complete. The next document will cover frontend implementation — TanStack Start, file-based routing, React Query integration against these exact API routes.

---

_Backend implementation plan — v1.0_
_Covers: 31 steps across 7 phases_
_Estimated granularity: each step is 1–3 hours of focused work_
