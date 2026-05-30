# EventBid — Architecture & System Design

> Single source of truth for all technical decisions. Every section is justified against the product's read paths, domain invariants, and long-term maintainability. Update this document when decisions change — never let it drift from the codebase.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Data Model](#3-data-model)
4. [Data Access Layer](#4-data-access-layer)
5. [Service Layer & OOP Design](#5-service-layer--oop-design)
6. [Adapter Interfaces](#6-adapter-interfaces)
7. [API Design](#7-api-design)
8. [Job Queue Design](#8-job-queue-design)
9. [Real-Time Design (SSE)](#9-real-time-design-sse)
10. [AI Integration](#10-ai-integration)
11. [Auth Design](#11-auth-design)
12. [File Storage](#12-file-storage)
13. [Email System](#13-email-system)
14. [Error Monitoring](#14-error-monitoring)
15. [Deployment & Infrastructure](#15-deployment--infrastructure)
16. [Environment Variables](#16-environment-variables)
17. [Key Engineering Decisions](#17-key-engineering-decisions)

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | TanStack Start | SSR, file-based routing, React Query built in |
| Backend framework | Hono (Node.js) | Lightweight, SSE native, TypeScript first |
| Database | PostgreSQL + Drizzle ORM | ACID, relational, type-safe, SQL-first |
| Vector search | pgvector | Soft venue matching, co-located with Postgres |
| Job queue | BullMQ | Battle-tested, retries, delayed jobs, observable |
| Cache / Queue store | Upstash Redis | Serverless Redis, BullMQ compatible |
| Auth | Better Auth | RBAC, Hono-native, Drizzle adapter, self-owned |
| AI | Vercel AI SDK + Anthropic provider | Provider-agnostic, streamText + generateObject |
| Email | Resend + React Email | Typed templates, best DX |
| File storage | Cloudflare R2 | S3-compatible, zero egress fees |
| Error monitoring | Sentry | Frontend + backend, job failure visibility |
| Deployment (backend) | Railway | Persistent processes, managed Postgres |
| Deployment (frontend) | Vercel | Edge SSR, optimal for TanStack Start |
| CDN | Cloudflare | In front of everything |

**Language & Runtime:** TypeScript everywhere — frontend, backend, shared packages, email templates. Node.js 20+ LTS. No `.js` files anywhere in the codebase.

---

## 2. Monorepo Structure

### Tooling

pnpm workspaces. No Turborepo in v1 — premature. Add when build times become a problem.

### Directory Layout

```
eventbid/
├── apps/
│   ├── web/                              # TanStack Start frontend
│   │   ├── src/
│   │   │   ├── routes/                   # File-based routes
│   │   │   │   ├── index.tsx             # Landing page
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── host/
│   │   │   │   │   └── venue/
│   │   │   │   ├── brief/
│   │   │   │   │   ├── new.tsx
│   │   │   │   │   └── $id.tsx
│   │   │   │   └── auth/
│   │   │   │       ├── login.tsx
│   │   │   │       └── register.tsx
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   └── api-client.ts         # Typed fetch wrapper
│   │   │   └── hooks/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── server/                           # Hono backend
│       ├── src/
│       │   ├── index.ts                  # Bootstrap: app, middleware, routes, workers
│       │   ├── lib/
│       │   │   ├── redis.ts              # Single Redis connection
│       │   │   ├── sentry.ts             # Sentry init + error middleware
│       │   │   └── env.ts                # Validated env (zod)
│       │   ├── db/
│       │   │   ├── schema/               # Drizzle schema — one file per entity
│       │   │   │   ├── auth.schema.ts    # Better Auth managed tables
│       │   │   │   ├── venue.schema.ts
│       │   │   │   ├── brief.schema.ts
│       │   │   │   ├── proposal.schema.ts
│       │   │   │   ├── analysis.schema.ts
│       │   │   │   ├── notification.schema.ts
│       │   │   │   └── index.ts          # Re-exports all schemas
│       │   │   ├── repositories/         # Data Access Layer — one class per entity
│       │   │   │   ├── venue.repository.ts
│       │   │   │   ├── brief.repository.ts
│       │   │   │   ├── proposal.repository.ts
│       │   │   │   ├── analysis.repository.ts
│       │   │   │   ├── notification.repository.ts
│       │   │   │   └── index.ts
│       │   │   ├── client.ts             # Drizzle client instance
│       │   │   └── migrations/
│       │   ├── services/                 # Business logic — one class per domain
│       │   │   ├── matching.service.ts
│       │   │   ├── analysis.service.ts
│       │   │   ├── deal-lock.service.ts
│       │   │   ├── notification.service.ts
│       │   │   ├── venue-embedding.service.ts  # Embedding generation on profile change
│       │   │   └── brief-ai.service.ts   # Brief quality check + improve
│       │   ├── adapters/                 # Adapter implementations
│       │   │   ├── email/
│       │   │   │   ├── email.adapter.interface.ts
│       │   │   │   └── resend.adapter.ts
│       │   │   ├── storage/
│       │   │   │   ├── storage.adapter.interface.ts
│       │   │   │   └── r2.adapter.ts
│       │   │   ├── notifier/
│       │   │   │   ├── notifier.adapter.interface.ts
│       │   │   │   └── sse.adapter.ts
│       │   │   └── queue/
│       │   │       ├── queue.adapter.interface.ts
│       │   │       └── bullmq.adapter.ts
│       │   ├── jobs/
│       │   │   ├── registry.ts           # Job registry — configuration first
│       │   │   ├── engine.ts             # Core engine — reads registry, spins workers
│       │   │   └── handlers/             # One handler function per job type
│       │   │       ├── matching.handler.ts
│       │   │       ├── ai-analysis.handler.ts
│       │   │       ├── email.handler.ts
│       │   │       ├── deadline.handler.ts
│       │   │       └── venue-embedding.handler.ts
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── brief.routes.ts
│       │   │   ├── proposal.routes.ts
│       │   │   ├── venue.routes.ts
│       │   │   ├── notification.routes.ts
│       │   │   └── sse.routes.ts
│       │   └── middleware/
│       │       ├── auth.middleware.ts
│       │       └── error.middleware.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                           # Types, schemas, constants shared across apps
│   │   ├── src/
│   │   │   ├── types/                    # Inferred from Drizzle schema + Zod
│   │   │   │   ├── venue.types.ts
│   │   │   │   ├── brief.types.ts
│   │   │   │   ├── proposal.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── schemas/                  # Zod schemas for API validation
│   │   │   │   ├── venue.schema.ts
│   │   │   │   ├── brief.schema.ts
│   │   │   │   ├── proposal.schema.ts
│   │   │   │   └── index.ts
│   │   │   └── constants/
│   │   │       ├── event-types.ts
│   │   │       ├── amenities.ts
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── email/                            # React Email templates
│       ├── src/
│       │   ├── templates/
│       │   │   ├── new-brief-match.tsx
│       │   │   ├── proposal-accepted.tsx
│       │   │   ├── brief-closed.tsx
│       │   │   ├── deadline-reminder.tsx
│       │   │   └── brief-expired.tsx
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Root package.json Scripts

```json
{
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "dev:web": "pnpm --filter web dev",
    "dev:server": "pnpm --filter server dev",
    "build": "pnpm -r build",
    "db:generate": "pnpm --filter server db:generate",
    "db:migrate": "pnpm --filter server db:migrate",
    "typecheck": "pnpm -r typecheck"
  }
}
```

---

## 3. Data Model

### Design Principles

- **Relational integrity, not deep joins.** Every primary read path requires at most one join. Entities are traceable to each other via explicit foreign keys — forward (brief → proposals) and backward (proposal → brief, proposal → venue) — but queries never chain more than two levels.
- **Typed columns, no JSONB for domain data.** Every field that needs to be queried, filtered, or displayed individually is a typed column. JSONB is reserved for AI analysis results only — genuinely unstructured data that is always fetched as a whole, never filtered by field.
- **No soft deletes.** Records in terminal states are immutable. Deletion is only permitted before any dependent records exist.
- **All IDs are UUIDs.** No sequential integer IDs exposed externally.
- **All monetary values stored in rupees as integers.**
- **All timestamps in UTC.**
- **Better Auth owns the `user` table.** Our schema references `user.id` but does not define the users table — Better Auth's Drizzle adapter generates it.

---

### Schema

#### Better Auth Tables (auto-generated via Drizzle adapter)

```
user              id, name, email, emailVerified, image, role, createdAt, updatedAt
session           id, userId, token, expiresAt, ipAddress, userAgent, createdAt, updatedAt
account           id, userId, provider, providerAccountId, ...
verification      id, identifier, value, expiresAt, createdAt, updatedAt
```

The `role` field is added to the `user` table via Better Auth's `admin` plugin — values: `'host' | 'venue_rep'`.

---

#### venues

Owned by a `venue_rep` user. One user → one venue in v1.

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
userId          uuid REFERENCES user(id) NOT NULL
name            text NOT NULL
description     text
city            text NOT NULL
state           text NOT NULL
maxCapacity     integer NOT NULL
styleTags       text[]              -- ['rustic', 'rooftop', 'garden']
amenities       text[]              -- ['catering', 'av', 'parking']
eventTypes      text[]              -- ['wedding', 'birthday', 'corporate']
phone           text
email           text
website         text
embedding       vector(1536)        -- pgvector: for soft matching score
createdAt       timestamptz DEFAULT now()
updatedAt       timestamptz DEFAULT now()
```

**Read paths this serves:**
- Venue rep profile page → single row fetch, no join
- Proposal card (host view) → `proposals JOIN venues ON proposals.venueId = venues.id` — one join, flat result with name + city + contact

---

#### venuePhotos

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
venueId         uuid REFERENCES venues(id) NOT NULL
r2Key           text NOT NULL       -- Cloudflare R2 object key
url             text NOT NULL       -- Public CDN URL
displayOrder    integer DEFAULT 0
createdAt       timestamptz DEFAULT now()
```

---

#### briefs

Owned by a `host` user.

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
hostId          uuid REFERENCES user(id) NOT NULL
eventType       text NOT NULL       -- 'wedding' | 'birthday' | 'party' | 'other'
eventDateFrom   date NOT NULL
eventDateTo     date NOT NULL
headcount       integer NOT NULL
city            text NOT NULL
state           text NOT NULL
budgetMin       integer NOT NULL
budgetMax       integer NOT NULL
requirements    text[]              -- ['indoor', 'catering', 'av', 'parking']
description     text
deadline        timestamptz NOT NULL
status          text NOT NULL DEFAULT 'open'
                                    -- 'open' | 'evaluating' | 'closed' | 'expired'
createdAt       timestamptz DEFAULT now()
updatedAt       timestamptz DEFAULT now()
```

**Read paths this serves:**
- Host brief dashboard → list by `hostId`, no join
- Venue brief feed → `briefVenueMatches JOIN briefs` — one join, flat result
- Brief detail page → single row fetch, no join

---

#### proposals

One proposal per venue per brief. Revisions are new rows (immutable versioning).

```
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
briefId               uuid REFERENCES briefs(id) NOT NULL
venueId               uuid REFERENCES venues(id) NOT NULL
version               integer NOT NULL DEFAULT 1
status                text NOT NULL DEFAULT 'active'
                                          -- 'active' | 'locked' | 'closed' | 'superseded'
totalPrice            integer NOT NULL    -- rupees
priceType             text NOT NULL       -- 'fixed' | 'starting_from'
inclusions            text[]
capacityConfirmed     boolean NOT NULL DEFAULT false
cateringType          text               -- 'included' | 'external' | 'addon'
amenities             text[]
availabilityConfirmed boolean NOT NULL DEFAULT false
notes                 text
createdAt             timestamptz DEFAULT now()
```

**Read paths this serves:**
- Proposal cards (host) → `proposals JOIN venues` — one join gives name + city + contact alongside proposal fields
- Venue proposal history → filter by `venueId`, no join
- Side-by-side comparison → filter by `briefId WHERE status = 'active'`, join venues — one join

---

#### briefVenueMatches

Denormalised join table written once by the matching worker. Powers the venue brief feed without runtime computation.

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
briefId         uuid REFERENCES briefs(id) NOT NULL
venueId         uuid REFERENCES venues(id) NOT NULL
matchScore      real NOT NULL           -- 0.0–1.0 soft score
createdAt       timestamptz DEFAULT now()
UNIQUE(briefId, venueId)
```

**Read paths this serves:**
- Venue brief feed → `briefVenueMatches JOIN briefs WHERE venueId = ?` — one join, sorted by deadline

---

#### aiAnalyses

One row per brief. Results stored as JSONB — this is the one legitimate use of JSONB in the schema because analysis results are always fetched as a whole, never filtered by individual field, and their shape varies by proposal set.

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
briefId         uuid REFERENCES briefs(id) NOT NULL UNIQUE
status          text NOT NULL DEFAULT 'not_started'
                              -- 'not_started' | 'running' | 'complete' | 'stale'
versionKey      text          -- hash of analysed proposal ids + timestamps
results         jsonb         -- { [proposalId]: { score, summary, gaps[] } }
createdAt       timestamptz DEFAULT now()
updatedAt       timestamptz DEFAULT now()
```

---

#### notifications

Fully typed columns — no JSONB payload. Every field needed to render a notification is a first-class column. Nullable FKs are honest domain logic: not every notification type involves every entity.

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
userId          uuid REFERENCES user(id) NOT NULL
type            text NOT NULL
                -- 'proposal.received' | 'analysis.ready' | 'analysis.stale'
                -- 'brief.matched' | 'proposal.accepted' | 'brief.closed'
                -- 'brief.deadline_approaching' | 'brief.expired'
briefId         uuid REFERENCES briefs(id)      -- nullable
proposalId      uuid REFERENCES proposals(id)   -- nullable
venueId         uuid REFERENCES venues(id)      -- nullable
read            boolean NOT NULL DEFAULT false
createdAt       timestamptz DEFAULT now()
```

**Read paths this serves:**
- Notification bell → filter by `userId WHERE read = false`, no join needed — `type` drives the display message, IDs drive the click-through link
- Mark all read → update by `userId`
- Brief-scoped notifications → filter by `briefId` when needed

---

### Indexes

```sql
-- Briefs
CREATE INDEX idx_briefs_host_id ON briefs(hostId);
CREATE INDEX idx_briefs_status ON briefs(status);
CREATE INDEX idx_briefs_deadline ON briefs(deadline) WHERE status = 'open';

-- Proposals
CREATE INDEX idx_proposals_brief_id ON proposals(briefId);
CREATE INDEX idx_proposals_venue_id ON proposals(venueId);
CREATE INDEX idx_proposals_brief_status ON proposals(briefId, status);

-- Brief-venue matches
CREATE INDEX idx_bvm_venue_id ON briefVenueMatches(venueId);
CREATE INDEX idx_bvm_brief_id ON briefVenueMatches(briefId);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(userId) WHERE read = false;
CREATE INDEX idx_notifications_brief_id ON notifications(briefId);

-- pgvector
CREATE INDEX idx_venues_embedding ON venues
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

### State Machines

**Brief Status**
```
open → evaluating → closed
     ↘ expired  (auto, via deadline cron when deadline passes with no accepted proposal)
```

**Proposal Status**
```
active → locked      (host accepts this proposal)
       → closed      (another proposal on the same brief was locked)
       → superseded  (venue submitted a revision — this version is archived)
```

**AI Analysis Status**
```
not_started → running → complete → stale → running → complete
```

---

### Entity Relationships (Traversal Map)

```
user ──────────────── briefs (hostId)
user ──────────────── venues (userId)
briefs ─────────────── proposals (briefId)
venues ─────────────── proposals (venueId)
briefs ─────────────── briefVenueMatches (briefId)
venues ─────────────── briefVenueMatches (venueId)
briefs ─────────────── aiAnalyses (briefId)
briefs ─────────────── notifications (briefId)
proposals ──────────── notifications (proposalId)
venues ─────────────── notifications (venueId)
venues ─────────────── venuePhotos (venueId)
```

Every relationship is a single FK hop. No entity requires traversing more than two hops to reach its display data.

---

## 4. Data Access Layer

### Principle

The DAL is the **only** layer that writes Drizzle queries. Services call the DAL. Route handlers call services. Nothing outside `db/repositories/` ever imports Drizzle operators or constructs a query.

### Structure: Repository Classes

Each repository is a class that receives the Drizzle client via constructor injection. This makes testing trivial — inject a mock client, test the business logic independently.

```typescript
// db/repositories/brief.repository.ts
import { db } from '../client'
import { briefs, proposals } from '../schema'
import { eq, and, lt } from 'drizzle-orm'
import type { Brief, CreateBriefInput } from '@eventbid/shared'

export class BriefRepository {
  constructor(private db: typeof db) {}

  async findById(id: string): Promise<Brief | null> {
    const result = await this.db
      .select()
      .from(briefs)
      .where(eq(briefs.id, id))
      .limit(1)
    return result[0] ?? null
  }

  async findByHostId(hostId: string): Promise<Brief[]> {
    return this.db
      .select()
      .from(briefs)
      .where(eq(briefs.hostId, hostId))
      .orderBy(briefs.createdAt)
  }

  async findOpenPastDeadline(): Promise<Brief[]> {
    return this.db
      .select()
      .from(briefs)
      .where(and(eq(briefs.status, 'open'), lt(briefs.deadline, new Date())))
  }

  async create(input: CreateBriefInput): Promise<Brief> {
    const result = await this.db.insert(briefs).values(input).returning()
    return result[0]
  }

  async updateStatus(id: string, status: Brief['status']): Promise<void> {
    await this.db.update(briefs).set({ status, updatedAt: new Date() }).where(eq(briefs.id, id))
  }
}
```

### Repository Index

All repositories are instantiated once and exported as a container:

```typescript
// db/repositories/index.ts
import { db } from '../client'
import { BriefRepository } from './brief.repository'
import { ProposalRepository } from './proposal.repository'
import { VenueRepository } from './venue.repository'
import { AnalysisRepository } from './analysis.repository'
import { NotificationRepository } from './notification.repository'

export const repositories = {
  briefs: new BriefRepository(db),
  proposals: new ProposalRepository(db),
  venues: new VenueRepository(db),
  analyses: new AnalysisRepository(db),
  notifications: new NotificationRepository(db),
}

export type Repositories = typeof repositories
```

Services import `repositories` — never `db` directly.

---

### Types: Single Source of Truth

Types are inferred from the Drizzle schema and exported from `packages/shared`. Frontend and backend import from the same source — no duplication, no drift.

```typescript
// packages/shared/src/types/brief.types.ts
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type { briefs } from '../../server-schema-ref' // path alias

export type Brief = InferSelectModel<typeof briefs>
export type CreateBriefInput = Omit<InferInsertModel<typeof briefs>, 'id' | 'createdAt' | 'updatedAt'>
export type BriefStatus = Brief['status']
```

Zod schemas in `packages/shared/schemas/` are used for API request validation and infer their TypeScript types — frontend uses these for form handling:

```typescript
// packages/shared/src/schemas/brief.schema.ts
import { z } from 'zod'

export const createBriefSchema = z.object({
  eventType: z.enum(['wedding', 'birthday', 'party', 'other']),
  eventDateFrom: z.string().date(),
  eventDateTo: z.string().date(),
  headcount: z.number().int().positive(),
  city: z.string().min(1),
  state: z.string().min(1),
  budgetMin: z.number().int().positive(),
  budgetMax: z.number().int().positive(),
  requirements: z.array(z.string()),
  description: z.string().optional(),
  deadline: z.string().datetime(),
})

export type CreateBriefDto = z.infer<typeof createBriefSchema>
```

---

## 5. Service Layer & OOP Design

### Principle

Services contain all business logic. They are classes that receive repositories and adapters via constructor injection. No service imports Drizzle, no service imports Resend directly — they go through the DAL and adapters respectively.

### DealLockService

The most critical service. Executes the atomic deal-lock transaction directly against the Drizzle client (the one place a service touches the DB client directly — justified because the transaction spans multiple repositories and must be atomic).

```typescript
// services/deal-lock.service.ts
export class DealLockService {
  constructor(
    private db: typeof drizzleClient,
    private repos: Repositories,
    private notifier: NotifierAdapter,
    private queue: QueueAdapter,
  ) {}

  async lockDeal(briefId: string, proposalId: string, hostId: string): Promise<void> {
    // 1. Verify ownership and state
    const brief = await this.repos.briefs.findById(briefId)
    if (!brief) throw new AppError('NOT_FOUND', 'Brief not found')
    if (brief.hostId !== hostId) throw new AppError('FORBIDDEN', 'Not your brief')
    if (brief.status === 'closed') throw new AppError('BRIEF_CLOSED', 'Brief is already closed')

    // 2. Atomic transaction
    await this.db.transaction(async (tx) => {
      // Lock accepted proposal
      await tx.update(proposals)
        .set({ status: 'locked' })
        .where(and(eq(proposals.id, proposalId), eq(proposals.status, 'active')))

      // Close all other proposals on this brief
      await tx.update(proposals)
        .set({ status: 'closed' })
        .where(and(eq(proposals.briefId, briefId), ne(proposals.id, proposalId)))

      // Close the brief
      await tx.update(briefs)
        .set({ status: 'closed', updatedAt: new Date() })
        .where(eq(briefs.id, briefId))
    })

    // 3. Enqueue notifications (outside transaction — fire and forget)
    await this.queue.enqueue('email', { type: 'proposal.accepted', briefId, proposalId })
    await this.queue.enqueue('email', { type: 'brief.closed', briefId, excludeProposalId: proposalId })

    // 4. Real-time push
    await this.notifier.emit(hostId, 'deal.locked', { briefId, proposalId })
  }
}
```

### MatchingService

```typescript
// services/matching.service.ts
export class MatchingService {
  constructor(
    private repos: Repositories,
    private queue: QueueAdapter,
  ) {}

  async matchBriefToVenues(briefId: string): Promise<void> {
    const brief = await this.repos.briefs.findById(briefId)
    if (!brief) throw new AppError('NOT_FOUND', 'Brief not found')

    // Hard filters: capacity, city, event type
    const hardMatches = await this.repos.venues.findByHardFilters({
      city: brief.city,
      minCapacity: brief.headcount,
      eventType: brief.eventType,
    })

    // Soft scoring: pgvector cosine similarity on brief embedding vs venue embedding
    const scored = await this.repos.venues.scoreByEmbedding(
      hardMatches.map(v => v.id),
      brief.requirements,
    )

    // Write matches
    await this.repos.briefVenueMatches.createBatch(
      scored.map(({ venueId, score }) => ({ briefId, venueId, matchScore: score }))
    )

    // Enqueue notifications per matched venue
    for (const { venueId } of scored) {
      await this.queue.enqueue('email', { type: 'brief.matched', briefId, venueId })
      await this.notifier.emit(venueId, 'brief.matched', { briefId })
    }
  }
}
```

### AnalysisService

```typescript
// services/analysis.service.ts
export class AnalysisService {
  constructor(
    private repos: Repositories,
    private ai: AIProvider,
    private notifier: NotifierAdapter,
  ) {}

  async runAnalysis(briefId: string): Promise<void> {
    const [brief, activeProposals] = await Promise.all([
      this.repos.briefs.findById(briefId),
      this.repos.proposals.findActiveByBriefId(briefId),
    ])

    if (!brief || activeProposals.length < 2) return

    // Version key — skip if nothing changed
    const versionKey = this.computeVersionKey(activeProposals)
    const existing = await this.repos.analyses.findByBriefId(briefId)
    if (existing?.versionKey === versionKey) {
      await this.notifier.emit(brief.hostId, 'analysis.ready', { briefId })
      return
    }

    await this.repos.analyses.upsertStatus(briefId, 'running')

    // Diff: only re-analyse proposals that changed since the last run.
    // Proposals whose id:timestamp appears in the existing versionKey are unchanged —
    // their cached result is merged back into the final output.
    const previousKeys = new Set((existing?.versionKey ?? '').split('|'))
    const changedProposals = activeProposals.filter(
      p => !previousKeys.has(`${p.id}:${p.createdAt.getTime()}`)
    )
    const unchangedIds = activeProposals
      .filter(p => previousKeys.has(`${p.id}:${p.createdAt.getTime()}`))
      .map(p => p.id)

    const cachedResults: AnalysisResult[] = unchangedIds
      .map(id => existing?.results?.[id])
      .filter(Boolean)

    const freshResults = changedProposals.length > 0
      ? await this.ai.analyseProposals(brief, changedProposals)
      : []

    const mergedResults = [...cachedResults, ...freshResults]

    await this.repos.analyses.upsertResults(briefId, {
      status: 'complete',
      versionKey,
      results: mergedResults,
    })

    await this.notifier.emit(brief.hostId, 'analysis.ready', { briefId })
  }

  private computeVersionKey(proposals: Proposal[]): string {
    return proposals
      .map(p => `${p.id}:${p.createdAt.getTime()}`)
      .sort()
      .join('|')
  }
}
```

### VenueEmbeddingService

Generates and stores a pgvector embedding for a venue whenever its profile is created or its matchable fields change. The matching engine requires a non-null embedding — this service is the prerequisite.

```typescript
// services/venue-embedding.service.ts
export class VenueEmbeddingService {
  constructor(
    private repos: Repositories,
    private ai: AIProvider,
  ) {}

  async generateAndStore(venueId: string): Promise<void> {
    const venue = await this.repos.venues.findById(venueId)
    if (!venue) throw new AppError('NOT_FOUND', 'Venue not found')

    // Concatenate the matchable fields into a single text document for embedding
    const text = [
      venue.description ?? '',
      `Style: ${venue.styleTags.join(', ')}`,
      `Amenities: ${venue.amenities.join(', ')}`,
      `Event types: ${venue.eventTypes.join(', ')}`,
    ].join('\n')

    const embedding = await this.ai.embed(text)
    await this.repos.venues.updateEmbedding(venueId, embedding)
  }
}
```

The `AIProvider` interface gains one method:

```typescript
export interface AIProvider {
  analyseProposals(brief: Brief, proposals: Proposal[]): Promise<AnalysisResult[]>
  improveBriefDescription(description: string, requirements: string[]): AsyncIterable<string>
  checkBriefQuality(brief: CreateBriefDto): Promise<{ warnings: string[] }>
  embed(text: string): Promise<number[]>   // returns a 1536-dim vector
}
```

```typescript
// In VercelAIProvider
async embed(text: string): Promise<number[]> {
  const { embedding } = await embedText({
    model: openai.embedding('text-embedding-3-small'),  // 1536 dims, matches vector(1536) column
    value: text,
  })
  return embedding
}
```

> **Note:** pgvector embeddings use OpenAI's `text-embedding-3-small` model (1536 dimensions). This is the one place the `VercelAIProvider` uses a non-Anthropic model. The provider interface keeps this detail hidden — the rest of the system only calls `ai.embed(text)`.

---

## 6. Adapter Interfaces

### Principle

All external dependencies — email, storage, queue, real-time, AI — are accessed through interfaces. Concrete implementations live in `adapters/`. Swapping a provider means writing a new adapter, not touching any service or handler.

---

### EmailAdapter

```typescript
// adapters/email/email.adapter.interface.ts
export type EmailTemplate =
  | { type: 'new-brief-match'; data: NewBriefMatchData }
  | { type: 'proposal-accepted'; data: ProposalAcceptedData }
  | { type: 'brief-closed'; data: BriefClosedData }
  | { type: 'deadline-reminder'; data: DeadlineReminderData }
  | { type: 'brief-expired'; data: BriefExpiredData }

export interface EmailAdapter {
  send(to: string, template: EmailTemplate): Promise<void>
}
```

```typescript
// adapters/email/resend.adapter.ts
export class ResendEmailAdapter implements EmailAdapter {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(to: string, template: EmailTemplate): Promise<void> {
    const { subject, html } = await renderTemplate(template)
    await this.client.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    })
  }
}
```

---

### StorageAdapter

Files are uploaded server-side through the Hono API — never directly from the browser. The adapter interface reflects this: it accepts a `Buffer` and returns the public URL.

```typescript
// adapters/storage/storage.adapter.interface.ts
export interface StorageAdapter {
  upload(key: string, buffer: Buffer, contentType: string): Promise<{ publicUrl: string }>
  deleteObject(key: string): Promise<void>
}
```

```typescript
// adapters/storage/r2.adapter.ts
export class R2StorageAdapter implements StorageAdapter {
  private client: S3Client

  constructor(config: R2Config) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<{ publicUrl: string }> {
    await this.client.send(new PutObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }))
    return { publicUrl: `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}` }
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET,
      Key: key,
    }))
  }
}
```

---

### NotifierAdapter

```typescript
// adapters/notifier/notifier.adapter.interface.ts
export interface NotifierAdapter {
  emit(userId: string, event: string, data: Record<string, unknown>): Promise<void>
  register(userId: string, stream: SSEStreamingApi): void
  unregister(userId: string): void
}
```

```typescript
// adapters/notifier/sse.adapter.ts
export class SSENotifierAdapter implements NotifierAdapter {
  private streams = new Map<string, SSEStreamingApi>()

  register(userId: string, stream: SSEStreamingApi) {
    this.streams.set(userId, stream)
  }

  unregister(userId: string) {
    this.streams.delete(userId)
  }

  async emit(userId: string, event: string, data: Record<string, unknown>) {
    const stream = this.streams.get(userId)
    if (stream) {
      stream.writeSSE({ event, data: JSON.stringify(data) })
    }
  }
}
```

---

### QueueAdapter

```typescript
// adapters/queue/queue.adapter.interface.ts
export interface JobPayload {
  type: string
  [key: string]: unknown
}

export interface QueueAdapter {
  enqueue(queueName: string, payload: JobPayload, options?: EnqueueOptions): Promise<void>
}

export interface EnqueueOptions {
  delay?: number       // ms
  attempts?: number
}
```

```typescript
// adapters/queue/bullmq.adapter.ts
export class BullMQAdapter implements QueueAdapter {
  private queues = new Map<string, Queue>()

  constructor(private connection: Redis) {}

  private getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, { connection: this.connection }))
    }
    return this.queues.get(name)!
  }

  async enqueue(queueName: string, payload: JobPayload, options?: EnqueueOptions) {
    const queue = this.getQueue(queueName)
    await queue.add(payload.type, payload, {
      attempts: options?.attempts ?? 3,
      delay: options?.delay,
      backoff: { type: 'exponential', delay: 2000 },
    })
  }
}
```

---

### AIProvider

```typescript
// adapters/ai/ai.provider.interface.ts
export interface AnalysisResult {
  proposalId: string
  score: number
  summary: string
  gaps: string[]
}

export interface AIProvider {
  analyseProposals(brief: Brief, proposals: Proposal[]): Promise<AnalysisResult[]>
  improveBriefDescription(description: string, requirements: string[]): AsyncIterable<string>
  checkBriefQuality(brief: CreateBriefDto): Promise<{ warnings: string[] }>
}
```

```typescript
// adapters/ai/vercel-ai.provider.ts
import { generateObject, streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export class VercelAIProvider implements AIProvider {
  private model = anthropic('claude-sonnet-4-20250514')

  async analyseProposals(brief: Brief, proposals: Proposal[]): Promise<AnalysisResult[]> {
    const { object } = await generateObject({
      model: this.model,
      schema: analysisResultSchema,   // zod schema
      prompt: buildAnalysisPrompt(brief, proposals),
    })
    return object.proposals
  }

  async *improveBriefDescription(description: string, requirements: string[]) {
    const { textStream } = await streamText({
      model: this.model,
      prompt: buildImprovePrompt(description, requirements),
    })
    for await (const chunk of textStream) yield chunk
  }

  async checkBriefQuality(brief: CreateBriefDto) {
    const { object } = await generateObject({
      model: this.model,
      schema: z.object({ warnings: z.array(z.string()) }),
      prompt: buildQualityCheckPrompt(brief),
    })
    return object
  }
}
```

---

## 7. API Design

### Base URL

```
https://api.eventbid.com/v1
```

### Conventions

- REST — clean, mobile-ready for v2
- All request/response bodies in JSON
- Auth via HTTP-only session cookie (Better Auth)
- Zod validation on every request body via Hono middleware
- Error shape: `{ error: { code, message } }`
- Monetary values as integers (rupees)
- Pagination via cursor for list endpoints

---

### Auth Routes

```
POST   /auth/register                    Create account — role in body ('host' | 'venue_rep')
POST   /auth/login                       Email + password
POST   /auth/logout                      Invalidate session
GET    /auth/me                          Current user + role
POST   /auth/google                      Initiate Google OAuth
GET    /auth/google/callback             Google OAuth callback
```

---

### Brief Routes

```
POST   /briefs                           Create brief (host)
GET    /briefs                           List own briefs (host, cursor paginated)
GET    /briefs/:id                       Brief detail
PATCH  /briefs/:id                       Update brief (host, only when status = 'open')
DELETE /briefs/:id                       Delete brief (host, only when status = 'open' and 0 proposals)
POST   /briefs/:id/improve               Stream AI-improved description (host)
```

**POST /briefs body**
```json
{
  "eventType": "wedding",
  "eventDateFrom": "2025-11-15",
  "eventDateTo": "2025-11-15",
  "headcount": 200,
  "city": "Hyderabad",
  "state": "Telangana",
  "budgetMin": 500000,
  "budgetMax": 800000,
  "requirements": ["indoor", "catering", "av", "parking"],
  "description": "Intimate garden wedding with live music...",
  "deadline": "2025-09-30T23:59:59Z"
}
```

---

### Proposal Routes

```
GET    /briefs/:id/proposals             All proposals on a brief (host only)
POST   /briefs/:id/proposals             Submit proposal (venue rep)
PATCH  /briefs/:id/proposals/:pid        Revise proposal (venue rep, before deadline)
POST   /briefs/:id/proposals/:pid/accept Lock the deal (host only)
GET    /venues/me/proposals              Venue rep's own proposals across all briefs
```

---

### Venue Routes

```
GET    /venues/me                        Own venue profile (venue rep)
PUT    /venues/me                        Update venue profile
GET    /venues/me/feed                   Matched briefs feed (venue rep, cursor paginated)
GET    /venues/:id                       Public venue profile (host, from proposal card)
POST   /venues/me/photos                 Upload photo — multipart/form-data, max 5 MB, JPEG/PNG/WebP
DELETE /venues/me/photos/:pid            Delete photo
```

---

### AI Analysis Routes

```
GET    /briefs/:id/analysis              Analysis results (host only)
POST   /briefs/:id/analysis/trigger      Manual re-trigger (host only)
```

---

### Notification Routes

```
GET    /notifications                    Unread notifications (cursor paginated)
PATCH  /notifications/:id/read          Mark one as read
PATCH  /notifications/read-all          Mark all as read
```

---

### SSE Route

```
GET    /sse                              Authenticated SSE stream
```

**Events emitted over SSE:**

| Event | Payload | Recipient |
|---|---|---|
| `proposal.received` | `{ briefId, proposalCount }` | Host |
| `analysis.ready` | `{ briefId }` | Host |
| `analysis.stale` | `{ briefId }` | Host |
| `brief.matched` | `{ briefId, eventType, deadline }` | Venue rep |
| `proposal.accepted` | `{ briefId, proposalId }` | Winning venue rep |
| `brief.closed` | `{ briefId }` | Losing venue reps |
| `deal.locked` | `{ briefId, proposalId }` | Host (confirmation) |

---

### Rate Limiting

Applied via Hono middleware using an Upstash Redis sliding window. Limits are per authenticated user (`userId`), not per IP.

```typescript
// middleware/rate-limit.middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({ url: env.UPSTASH_REDIS_URL })

// Factories — each call site passes its own window config
export function rateLimit(requests: number, window: `${number} ${'s' | 'm' | 'h'}`) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
  })

  return createMiddleware(async (c, next) => {
    const user = c.get('user')
    const { success } = await limiter.limit(`rl:${user.id}:${c.req.path}`)
    if (!success) return c.json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }, 429)
    await next()
  })
}
```

**Limits applied per route:**

| Route | Limit | Rationale |
|---|---|---|
| `POST /briefs/:id/analysis/trigger` | 5 / minute | Direct AI billing exposure |
| `POST /briefs/:id/improve` | 10 / minute | Streaming AI call |
| `POST /briefs` | 10 / hour | Prevents brief spam |
| `POST /briefs/:id/proposals` | 20 / hour | Prevents proposal spam |
| `POST /venues/me/photos` | 30 / hour | Upload abuse prevention |

Add the middleware directly on the route:

```typescript
briefRoutes.post('/:id/analysis/trigger',
  requireAuth,
  requireRole('host'),
  rateLimit(5, '1 m'),
  async (c) => { ... }
)
```

---

```json
{
  "error": {
    "code": "BRIEF_CLOSED",
    "message": "This brief is no longer accepting proposals."
  }
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not permitted |
| `NOT_FOUND` | 404 | Resource missing |
| `VALIDATION_ERROR` | 422 | Invalid body |
| `BRIEF_CLOSED` | 409 | Action not allowed on closed brief |
| `DEADLINE_PASSED` | 409 | Proposal deadline has passed |
| `DEAL_LOCK_FAILED` | 409 | Concurrent accept conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected error |

---

## 8. Job Queue Design

### Configuration-First Registry

Adding a new job means adding one entry to `registry.ts`. The engine reads the registry and spins up workers automatically — no changes to core infrastructure.

```typescript
// jobs/registry.ts
import type { JobRegistry } from './engine'
import { matchingHandler } from './handlers/matching.handler'
import { aiAnalysisHandler } from './handlers/ai-analysis.handler'
import { emailHandler } from './handlers/email.handler'
import { deadlineHandler } from './handlers/deadline.handler'

export const jobRegistry: JobRegistry = [
  {
    queueName: 'matching',
    concurrency: 5,
    handler: matchingHandler,
    retries: 3,
  },
  {
    queueName: 'ai-analysis',
    concurrency: 2,           // AI calls are expensive — limit parallelism
    handler: aiAnalysisHandler,
    retries: 2,
  },
  {
    queueName: 'email',
    concurrency: 10,
    handler: emailHandler,
    retries: 3,
  },
  {
    queueName: 'deadline',
    concurrency: 1,
    handler: deadlineHandler,
    retries: 1,
    cron: '*/5 * * * *',     // every 5 minutes
  },
  {
    queueName: 'venue-embedding',
    concurrency: 3,           // Anthropic embedding calls — moderate parallelism
    handler: venueEmbeddingHandler,
    retries: 3,
  },
]
```

### Engine

```typescript
// jobs/engine.ts
export interface JobConfig {
  queueName: string
  concurrency: number
  handler: (payload: JobPayload, services: ServiceContainer) => Promise<void>
  retries: number
  cron?: string
}

export type JobRegistry = JobConfig[]

export class JobEngine {
  private workers: Worker[] = []

  constructor(
    private registry: JobRegistry,
    private connection: Redis,
    private services: ServiceContainer,
  ) {}

  start(): void {
    for (const config of this.registry) {
      const worker = new Worker(
        config.queueName,
        async (job) => {
          await config.handler(job.data, this.services)
        },
        {
          connection: this.connection,
          concurrency: config.concurrency,
        }
      )

      worker.on('failed', (job, err) => {
        Sentry.captureException(err, { extra: { queueName: config.queueName, jobId: job?.id } })
      })

      if (config.cron) {
        const queue = new Queue(config.queueName, { connection: this.connection })
        queue.add('cron', {}, { repeat: { pattern: config.cron } })
      }

      this.workers.push(worker)
    }
  }

  async stop(): Promise<void> {
    await Promise.all(this.workers.map(w => w.close()))
  }
}
```

### Handlers

Each handler is a plain async function — no class, no framework coupling:

```typescript
// jobs/handlers/matching.handler.ts
export async function matchingHandler(
  payload: JobPayload,
  services: ServiceContainer,
): Promise<void> {
  await services.matching.matchBriefToVenues(payload.briefId as string)
}
```

```typescript
// jobs/handlers/venue-embedding.handler.ts
export async function venueEmbeddingHandler(
  payload: JobPayload,
  services: ServiceContainer,
): Promise<void> {
  await services.venueEmbedding.generateAndStore(payload.venueId as string)
}
```

The `venue-embedding` job is enqueued in two places:
- `POST /venues/me` (venue profile create) — after the venue row is written
- `PUT /venues/me` (venue profile update) — only when `styleTags`, `amenities`, or `eventTypes` change, since those are the fields that affect match quality

---

## 9. Real-Time Design (SSE)

### Approach

Hono native SSE via the `SSENotifierAdapter`. One persistent connection per authenticated session. No Socket.io, no third-party pub/sub.

### Connection Lifecycle

1. Browser opens `GET /sse` with session cookie
2. Middleware authenticates, extracts `userId`
3. `SSENotifierAdapter.register(userId, stream)` stores the stream in memory
4. Server sends a heartbeat every 30 seconds to keep the connection alive
5. On disconnect, `SSENotifierAdapter.unregister(userId)` cleans up

### Reconnection & Missed Events

The browser's `EventSource` API reconnects automatically after a dropped connection, but reconnection alone doesn't recover events missed during the gap (e.g. a Railway deploy restarts the server process, dropping all open SSE streams).

**Strategy: last-event-id cursor on the notifications table.**

Every SSE event that maps to a persisted notification is sent with an `id` field set to the notification's UUID:

```typescript
stream.writeSSE({
  id: notification.id,       // ← the SSE event ID
  event: notification.type,
  data: JSON.stringify({ briefId: notification.briefId, ... }),
})
```

On reconnect, the browser automatically sends `Last-Event-ID` as a request header. The SSE route reads it and replays any undelivered notifications:

```typescript
// routes/sse.routes.ts
sseRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user')
  const lastEventId = c.req.header('Last-Event-ID') ?? null

  return streamSSE(c, async (stream) => {
    services.notifier.register(user.id, stream)

    // Replay missed notifications since last-event-id
    if (lastEventId) {
      const missed = await repos.notifications.findAfter(user.id, lastEventId)
      for (const n of missed) {
        await stream.writeSSE({
          id: n.id,
          event: n.type,
          data: JSON.stringify({ briefId: n.briefId, proposalId: n.proposalId }),
        })
      }
    }

    // Heartbeat — keeps the connection alive through proxies and load balancers
    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: 'heartbeat', data: '' })
    }, 30_000)

    stream.onAbort(() => {
      clearInterval(heartbeat)
      services.notifier.unregister(user.id)
    })
  })
})
```

`NotificationRepository` gains one method:

```typescript
async findAfter(userId: string, afterId: string): Promise<Notification[]> {
  // Find the createdAt of the cursor notification, then return all newer ones
  const cursor = await this.db
    .select({ createdAt: notifications.createdAt })
    .from(notifications)
    .where(eq(notifications.id, afterId))
    .limit(1)

  if (!cursor[0]) return []

  return this.db
    .select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      gt(notifications.createdAt, cursor[0].createdAt),
    ))
    .orderBy(notifications.createdAt)
}
```

> **SSE events that are NOT persisted** (e.g. `heartbeat`, `analysis.stale`) are fire-and-forget — they are not replayed on reconnect. Only events backed by a `notifications` row are replay-eligible.

### Scale Note

The in-memory stream map works for a single server process. When scaling horizontally, replace the `SSENotifierAdapter` with a Redis pub/sub implementation — same interface, different internals. No service or route handler changes required.

---

## 10. AI Integration

### Model

`claude-sonnet-4-20250514` via `@ai-sdk/anthropic`. Provider is swappable — if you need to move to Gemini or GPT, change the model line in `VercelAIProvider`, nothing else.

### Use Cases

| Use Case | Method | Streamed |
|---|---|---|
| Proposal scoring + plain-English summary | `generateObject` | No — job result, then SSE push |
| Brief description improvement | `streamText` | Yes — chunked SSE to frontend |
| Brief quality check on submit | `generateObject` | No — sync response |

### Data Privacy

AI prompts contain brief requirements and proposal content only. No host name, host contact, or venue identity beyond what the venue voluntarily put in their profile.

### Version-Keyed Cache

```typescript
const versionKey = proposals
  .map(p => `${p.id}:${p.createdAt.getTime()}`)
  .sort()
  .join('|')
```

If `versionKey` matches the stored key on `aiAnalyses`, the cached result is returned instantly — no Claude API call made.

---

## 11. Auth Design

### Library

Better Auth with Drizzle adapter. Tables are generated by Better Auth — do not manually define `user`, `session`, `account`, or `verification` tables in the schema. The `role` field is added to `user` via the `admin` plugin.

### Roles

| Role | Permissions |
|---|---|
| `host` | Create/manage briefs, view proposals on own briefs, accept proposals |
| `venue_rep` | Manage venue profile, view matched briefs, submit/revise proposals |

### Session Strategy

HTTP-only session cookies. No JWT in localStorage. Sessions persisted in Redis via Better Auth's Redis session store.

### Middleware

```typescript
// middleware/auth.middleware.ts
export const requireAuth = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: { code: 'UNAUTHORIZED' } }, 401)
  c.set('user', session.user)
  await next()
})

export const requireRole = (role: 'host' | 'venue_rep') =>
  createMiddleware(async (c, next) => {
    const user = c.get('user')
    if (user.role !== role) return c.json({ error: { code: 'FORBIDDEN' } }, 403)
    await next()
  })
```

---

## 12. File Storage

### Provider

Cloudflare R2 via `R2StorageAdapter`. S3-compatible — swappable to AWS S3 by writing a new adapter.

### Upload Flow

Files are uploaded server-side through the Hono API using Hono's built-in `parseBody` for `multipart/form-data`. The browser never talks to R2 directly.

1. `POST /venues/me/photos` — `multipart/form-data` with `file` field
2. Hono parses the multipart body: `const { file } = await c.req.parseBody()`
3. Server validates file type (image/jpeg, image/png, image/webp) and size (max 5 MB)
4. Server generates a unique key: `venues/{venueId}/{photoId}.{ext}`
5. Server calls `storage.upload(key, buffer, contentType)` → R2 PutObject
6. Server writes a `venuePhotos` row with the returned `publicUrl`
7. Server returns `{ id, url }` to the frontend

```typescript
// routes/venue.routes.ts (photo upload handler)
venueRoutes.post('/me/photos', requireAuth, requireRole('venue_rep'), async (c) => {
  const user = c.get('user')
  const venue = await services.venues.getByUserId(user.id)
  if (!venue) return c.json({ error: { code: 'NOT_FOUND' } }, 404)

  const body = await c.req.parseBody()
  const file = body['file']

  if (!(file instanceof File)) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'file field required' } }, 422)
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Only JPEG, PNG, and WebP images are allowed' } }, 422)
  }
  if (file.size > MAX_SIZE_BYTES) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'File must be under 5 MB' } }, 422)
  }

  const ext = file.type.split('/')[1]
  const photoId = crypto.randomUUID()
  const key = `venues/${venue.id}/${photoId}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { publicUrl } = await services.storage.upload(key, buffer, file.type)

  await repos.venuePhotos.create({ venueId: venue.id, r2Key: key, url: publicUrl })

  return c.json({ id: photoId, url: publicUrl }, 201)
})
```

### Bucket Key Convention

```
venues/{venueId}/{photoId}.{ext}
```

### Why Server-Side

- No CORS configuration required on R2
- File validation (type, size) is enforced server-side — cannot be bypassed
- No orphaned R2 objects — the file and DB row are written in the same request; if either fails, nothing is persisted
- Simpler frontend — a standard `FormData` POST, no two-step flow

---

## 13. Email System

### Stack

Resend for delivery. React Email for templates. `packages/email` contains all templates. `ResendEmailAdapter` in `apps/server` implements `EmailAdapter`.

### Templates

| Template | Trigger |
|---|---|
| `new-brief-match` | Venue matched to a brief |
| `deadline-reminder` | 24 hours before brief deadline |
| `proposal-accepted` | Winning venue — deal locked |
| `brief-closed` | Losing venues — another proposal accepted |
| `brief-expired` | All involved venues — brief auto-expired |

### Delivery Rule

No email is ever sent synchronously in a request handler. All email dispatch goes through `queue.enqueue('email', ...)`.

---

## 14. Error Monitoring

### Two Sentry Projects

`apps/web` and `apps/server` each have their own Sentry DSN. Frontend captures component errors and performance. Backend captures request errors and — critically — job worker failures, which are explicitly reported in the engine's `worker.on('failed')` handler.

```typescript
// lib/sentry.ts
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
})
```

---

## 15. Deployment & Infrastructure

### Services Map

| Service | Platform |
|---|---|
| Frontend | Vercel — root dir: `apps/web` |
| Backend | Railway — root dir: `apps/server` |
| PostgreSQL | Railway managed Postgres |
| Redis | Upstash |
| File storage | Cloudflare R2 |
| Email | Resend |
| CDN | Cloudflare |

### Vercel (`apps/web`)

```json
{
  "rootDirectory": "apps/web",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install"
}
```

### Railway (`apps/server`)

```toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm build"

[deploy]
startCommand = "node dist/index.js"
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3
```

### Migration Strategy

Drizzle Kit generates migrations. Railway's deploy pipeline runs `db:migrate` before starting the new server process — zero-downtime migrations by convention (additive changes only; destructive changes in two-step deploys).

---

## 16. Environment Variables

### `apps/server`

```env
# Database
DATABASE_URL=

# Redis
UPSTASH_REDIS_URL=

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@eventbid.com

# Storage
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_PUBLIC_URL=

# Monitoring
SENTRY_DSN=

# App
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://eventbid.com
```

### `apps/web`

```env
VITE_API_URL=https://api.eventbid.com
VITE_SENTRY_DSN=
```

All env variables are validated at startup using Zod in `lib/env.ts`. The server will not start if a required variable is missing.

---

## 17. Key Engineering Decisions

### Adapter Pattern Throughout

Every external dependency is accessed through an interface. The concrete implementation lives in `adapters/`. Swapping Resend for SendGrid, R2 for S3, BullMQ for another queue, or SSE for WebSockets means writing one new class — no service or route handler changes. This is not premature abstraction; it is defensive design for a product that will outlive its v1 infrastructure choices.

### OOP for Services and Repositories

Classes with constructor injection give three things: explicit dependency declaration, trivial unit testing via mock injection, and clear ownership of state (e.g. the SSE stream map lives inside `SSENotifierAdapter`, not scattered across route handlers). Plain functions are used for job handlers and utilities — OOP is applied where encapsulation of state or behaviour actually earns its keep.

### Configuration-First Job Engine

The `JobEngine` reads a registry and spins up workers. Adding a queue and worker is a registry entry and a handler function — the engine, the adapter, and the queue infrastructure are never touched. This is the same principle as route registration in any good framework.

### Relational Integrity Over Denormalization

Every primary read path is at most one join. Entities are traversable in both directions via explicit foreign keys. No nested population. The `notifications` table uses typed nullable FK columns instead of a JSONB payload — every field is queryable, type-safe, and honest about what each notification type carries. The only JSONB in the schema is `aiAnalyses.results` — genuinely unstructured data that is always fetched as a whole.

### Types Flow One Direction

Drizzle schema → `InferSelectModel` / `InferInsertModel` → `packages/shared/types`. Zod schemas → `z.infer` → `packages/shared/schemas`. Frontend and backend import from `@eventbid/shared`. No type duplication exists in the codebase.

### Better Auth Owns the User Table

We do not fight Better Auth's schema. Our tables reference `user.id` as a foreign key. Role management goes through Better Auth's admin plugin. This avoids the common mistake of building a parallel auth system next to a library that already handles it.

### REST Over tRPC

The API is a clean REST contract so the backend can serve a mobile client in v2 without rework. tRPC couples transport to framework — acceptable for a web-only product, a liability for anything beyond it.

### Deal Lock Atomicity

One PostgreSQL transaction. If any step fails — locking the winning proposal, closing the others, closing the brief — everything rolls back. The second concurrent accept attempt sees a closed brief and returns `DEAL_LOCK_FAILED`. No partial states are possible.

### Server-Side File Upload

Photos are uploaded through the Hono API server, not directly to R2 from the browser. This eliminates the two-step presign/confirm flow, removes the orphaned-object problem, enforces file validation server-side (type, size), and requires no CORS configuration on R2. The tradeoff is that large files pass through the server's memory — 5 MB per photo, capped at one file per request, is acceptable for v1.

### Venue Embedding Generation as a Background Job

Venue embeddings are generated asynchronously after profile create/update via the `venue-embedding` queue. This keeps the profile save response fast and decouples the embedding model dependency from the request path. The matching engine guards against venues with null embeddings by skipping them in the hard filter query — a venue without an embedding is not yet discoverable.

### Analysis Diffing

`AnalysisService` computes a version key from active proposal IDs and timestamps. On re-run, only proposals whose key segment changed since the last run are sent to the AI — unchanged proposals reuse their cached `AnalysisResult`. This makes re-triggering after a single revision cheap regardless of how many proposals exist.

### SSE Reconnection via Last-Event-ID

Every SSE event backed by a persisted notification is sent with the notification UUID as the SSE event ID. On reconnect, the browser sends `Last-Event-ID` and the server replays missed notifications from the `notifications` table. Fire-and-forget events (heartbeat, analysis.stale) are not replayed. This makes the real-time layer resilient to server restarts without requiring a message broker.

### Rate Limiting on AI and Write Endpoints

AI trigger routes are rate-limited per authenticated user via Upstash Redis sliding windows. This prevents billing abuse on the analysis trigger and brief improve endpoints. All write endpoints (brief creation, proposal submission, photo upload) have conservative hourly limits to prevent spam without affecting legitimate use.

---

*Last updated: v2.1 — gap fixes: SSE reconnection, venue embeddings, analysis diffing, rate limiting, server-side file upload, R2 orphan elimination*
*Next: Drizzle schema implementation → repository layer → service layer → routes*
