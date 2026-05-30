# EventBid — Product Scope Document

> A living document. No architecture, no code, no tech. Pure product thinking.

---

## 1. Product Thesis

EventBid brings the entire venue discovery-to-decision process into one structured, transparent platform — giving hosts a single place to receive, compare, and act on real proposals, and giving venues a professional channel to present their offering and close deals without the WhatsApp chaos.

---

## 2. The Problem

**Both sides — customers and vendors — are flying blind during the event planning process.**

- Hosts can't compare venues — every proposal arrives in a different format via a different channel
- Venues have no structured channel to present their offering — everything is WhatsApp, PDFs, and phone calls
- Nobody has built a clean, end-to-end platform: brief → proposals → comparison → decision

### What exists today

| Product | What it does | What's missing |
|---|---|---|
| The Knot / WeddingWire | Venue directories — browse and contact | Host reaches out to venues one by one. No structured proposals. |
| Thumbtack | Post a job, get quotes | Generic (not event-specific), proposals are shallow price quotes |
| HoneyBook | CRM after contact is made | Starts too late — doesn't solve discovery or comparison |

### The gaps we fill

- Structured, standardised proposal format both sides agree on
- Side-by-side proposal comparison in one place
- AI-assisted evaluation — not just display, but scoring and analysis
- Formal deal-locking with state management — brief lifecycle from open to closed
- Unified platform — brief → proposals → comparison → decision, end to end

---

## 3. Our Users

### User 1 — The Host

A real person planning a personal event (wedding, birthday, party). Not a professional planner. Doing this for the first time or once every few years. Emotionally invested. Overwhelmed by options, short on time, scared of making an expensive mistake.

**Pain:** Can't compare venues — every proposal arrives in a different format via a different channel.

**Success:** Compared real proposals side by side and made a confident, informed decision.

### User 2 — The Venue Rep

The person who manages venue inquiries — could be the owner, a manager, or a dedicated sales person. Business-minded. Handling multiple inquiries at once. Wants qualified, serious leads they can convert efficiently.

**Pain:** No structured channel to present their offering — everything is WhatsApp, PDFs, phone calls.

**Success:** Received a qualified lead, submitted a structured proposal, and closed the deal — entirely on-platform.

---

## 4. Scope Decisions (Locked)

| Decision | v1 |
|---|---|
| Customer type | Individuals planning personal events only — no corporate |
| Vendor type | Full-service venues only — no individual vendors (caterers, DJs, photographers) |
| Customer user | The host themselves — not a professional planner |
| Venue user | Whoever manages the account — owner, manager, or sales rep |
| Communication | Contact details shared — communication happens outside the platform |
| Payments | Not in scope — deal locking is a commitment, not a financial transaction |
| Platform | Web only — no mobile app |

---

## 5. Core Flow

1. Host creates a structured event brief
2. Platform notifies matching venues (hard + soft matching)
3. Venues submit structured proposals before deadline
4. Host views all proposals — cards overview, then side-by-side comparison
5. AI agent analyses proposals — scores and plain-English summaries streamed live
6. Host accepts a proposal — atomic deal lock, all parties notified, brief closed

---

## 6. Complete User Journeys

### 6.1 The Host Journey

#### Phase 1 — Registration & Setup
1. Host lands on the platform, signs up as a **Host**
2. Provides name , location (City , State ) and contact details — minimal profile, no elaborate setup
3. Lands on their **brief dashboard** — empty state with a "Create your first brief" prompt

#### Phase 2 — Creating a Brief
1. Host clicks "Create Brief"
2. Fills in the brief form:
   - Event type (wedding, birthday, party, other)
   - Event date (Start and End date)
   - Expected headcount
   - Location / city
   - Budget range (min–max)
   - Requirements checklist: indoor/outdoor preference, catering included, AV, parking, accommodation , photoshoot etc
   - Free-text description — anything extra they want venues to know
   - Proposal deadline — date by which venues must respond
3. Clicks "Publish Brief"
4. User can improve thier Free-text description using AI in the input box directly .
5. Brief goes live with status: **open**
6. Host lands on their brief detail page — sees proposal count (0), deadline countdown, brief summary

#### Phase 3 — Waiting for Proposals
1. Host's brief dashboard shows the brief as **open** with a live proposal counter
2. When a new proposal arrives, host sees a real-time notification — counter increments without page refresh
3. Host can view incoming proposals as cards at any time — even before deadline
4. When 2+ proposals arrive, AI analysis runs automatically in the background
5. Host sees an "Analysis ready" notification — clicks to view scores and summaries

#### Phase 4 — Evaluating Proposals
1. Host views all proposals as **scannable cards**:
   - Venue name, total price, key inclusions, AI match score badge, contact details
2. Host selects 2–3 proposals and opens **side-by-side comparison table**:
   - All fields aligned: price, capacity, catering, amenities, availability
   - Differences highlighted
3. Host reads **AI analysis panel**:
   - Per-proposal score (budget fit, inclusions match, brief alignment)
   - Plain-English summary: "This venue covers everything in your brief. Slightly over budget at ₹X. Catering is included but AV is not confirmed."
   - Gaps flagged: "This venue hasn't confirmed outdoor availability."
4. If new proposals arrive after analysis, host can **re-trigger analysis** — only changed proposals are re-processed
5. Host can see venue contact details on any proposal card and reach out externally if needed

#### Phase 5 — Locking the Deal
1. Host decides on a proposal and clicks **"Accept this proposal"**
2. Confirmation summary screen appears:
   - Venue name, agreed price, key inclusions, event date
   - "Confirm booking" button
3. Host confirms
4. Deal locks — brief status changes to **closed**, accepted proposal status → **locked**
5. Host sees a **locked brief summary page**:
   - Read-only view of the accepted proposal
   - Venue contact details prominently displayed
   - Event date, price, inclusions — permanent record
6. Host receives email confirmation of the booking

---

### 6.2 The Venue Rep Journey

#### Phase 1 — Registration & Setup
1. Venue rep signs up as a **Venue**
2. Fills in venue profile:
   - Venue name, description
   - Location / city (City , state)
   - Maximum capacity
   - Style tags (rustic, modern, beachside, rooftop, garden, banquet hall, etc.)
   - Amenities checklist (catering, AV, parking, accommodation, outdoor space, photography , etc.)
   - Event types handled (weddings, birthdays, corporate, all)
   - Photos of the vanues .
   - Contact details (phone, email, website)
3. Profile saved — venue is now discoverable by the matching engine
4. Lands on their **venue dashboard** — brief feed (empty), active proposals, past bookings

#### Phase 2 — Discovering Matching Briefs
1. When a brief goes live that matches the venue's profile, venue rep receives:
   - Real-time in-app notification (pushed instantly)
   - Email notification (sent async in the background)
2. Venue rep opens the brief — sees full brief details: event type, date, headcount, budget range, requirements, description
3. Venue rep decides whether to respond or ignore
4. Brief feed on dashboard shows all matched briefs — sorted by deadline proximity

#### Phase 3 — Submitting a Proposal
1. Venue rep clicks "Submit Proposal" on a brief
2. Fills in structured proposal form:
   - Total price (fixed or starting from)
   - Inclusions checklist (what's included in the price)
   - Capacity confirmation (confirming they can host the headcount)
   - Catering details (included / external / optional add-on)
   - Amenities being offered for this event
   - Availability confirmation for the event date
   - Free-text pitch section: "Here's why our venue is perfect for your event..."
3. Submits proposal — status: **pending**
4. Venue rep lands on their proposal detail page — can see their submitted proposal

#### Phase 4 — Managing & Revising
1. Venue rep can revise their proposal any time before the brief deadline
2. Each revision creates a new **immutable version** — previous versions preserved
3. Host always sees the latest version
4. Venue rep's dashboard shows proposal status in real time:
   - **Pending** — brief is still open, waiting for host decision
   - **Locked** — their proposal was accepted
   - **Closed** — brief closed, another venue was selected

#### Phase 5 — Outcome
**If selected:**
1. Venue rep receives real-time in-app notification: "Your proposal has been accepted!"
2. Email sent with full booking details — host name, event date, agreed terms, host contact details
3. Proposal status on dashboard → **Locked**
4. Brief is closed — no further changes possible

**If not selected:**
1. Venue rep receives in-app notification + email: "This brief has been closed."
2. Generic message — no details about who was selected or why
3. Proposal status → **Closed**
4. Brief removed from active feed, moved to past briefs

---

## 7. System States

### 7.1 Brief States

```
draft → open → evaluating → closed
```

| State | Meaning | Triggered by |
|---|---|---|
| `draft` | Host started but hasn't published | Brief created but not submitted |
| `open` | Live — venues can see and respond | Host publishes brief |
| `evaluating` | Deadline passed — no new proposals accepted | Cron job fires on deadline |
| `closed` | Deal locked or brief expired with no selection | Host accepts a proposal OR brief expires with no action |

**Rules:**
- A brief in `closed` state is permanently immutable — no edits, no new proposals
- A brief can go from `open` directly to `closed` if host accepts before deadline
- A brief in `evaluating` can still be closed by host accepting a proposal
- If deadline passes and host never acts — brief auto-closes after a grace period (configurable)

---

### 7.2 Proposal States

```
pending → locked
       → closed
```

| State | Meaning | Triggered by |
|---|---|---|
| `pending` | Submitted, waiting for host decision | Venue submits proposal |
| `locked` | Accepted by host — deal confirmed | Host accepts this proposal (atomic transaction) |
| `closed` | Brief closed, this proposal not selected | Host accepted a different proposal OR brief expired |

**Rules:**
- Only one proposal per brief can ever be in `locked` state
- When one proposal moves to `locked`, all others atomically move to `closed`
- A `pending` proposal can be revised (new version created) until brief deadline
- A `locked` or `closed` proposal is immutable

---

### 7.3 Proposal Version States

```
active → superseded
```

| State | Meaning | Triggered by |
|---|---|---|
| `active` | The current version the host sees | New revision submitted |
| `superseded` | An older version — preserved but not shown by default | Venue submits a revision |

**Rules:**
- Only one version per proposal can be `active` at a time
- Superseded versions are preserved — host can access revision history
- When a brief closes, the `active` version at that moment is the canonical record

---

### 7.4 AI Analysis States

```
not_started → running → complete → stale → running → complete
```

| State | Meaning | Triggered by |
|---|---|---|
| `not_started` | Fewer than 2 proposals, no analysis yet | Default |
| `running` | Background job is executing | 2+ proposals arrive OR host manually triggers |
| `complete` | Analysis ready — scores and summaries available | Job completes successfully |
| `stale` | A proposal was revised since last analysis | New proposal version submitted |

**Rules:**
- Analysis only runs when 2+ proposals exist for a brief
- Analysis is version-keyed — if no proposals changed, re-trigger returns cached result instantly
- Only proposals that changed since last run are re-processed on re-trigger
- Analysis becomes `stale` automatically when any proposal is revised

---

### 7.5 Notification States

| Notification | Recipient | Trigger | Channel |
|---|---|---|---|
| New matching brief | Venue rep | Brief goes live | In-app (real-time) + Email (async) |
| New proposal received | Host | Venue submits proposal | In-app (real-time) |
| AI analysis ready | Host | Analysis job completes | In-app (real-time) |
| Proposal revised | Host | Venue submits revision | In-app (real-time) |
| Brief deadline approaching | Venue rep | 24hrs before deadline | Email (async) |
| Proposal accepted | Winning venue rep | Host locks deal | In-app (real-time) + Email (async) |
| Brief closed | Losing venue reps | Host locks deal | In-app (real-time) + Email (async) |
| Brief expired | All involved venues | Brief auto-closes | Email (async) |

---

## 8. Data Boundaries — What Belongs to Whom

### 8.1 What the Host can see

| Data | Visible? | Notes |
|---|---|---|
| Their own briefs (all states) | ✅ Yes | Full access |
| Proposals on their briefs | ✅ Yes | Latest version only by default, revision history accessible |
| AI analysis and scores | ✅ Yes | Only for their own briefs |
| Venue profile (name, description, amenities, contact) | ✅ Yes | Visible on proposal cards |
| Other hosts' briefs | ❌ No | Fully private |
| What competing venues proposed | ❌ No | Each venue's proposal is only visible to the host, not to other venues |
| Venue's other bookings or history | ❌ No | Not in v1 |

### 8.2 What the Venue Rep can see

| Data | Visible? | Notes |
|---|---|---|
| Briefs matched to their venue | ✅ Yes | Brief details — event type, date, headcount, budget range, requirements, description |
| Their own proposals (all versions) | ✅ Yes | Full history |
| Their proposal status | ✅ Yes | Pending / locked / closed |
| Other venues' proposals | ❌ No | Competing proposals are never visible to other venues |
| Host contact details | ✅ Yes | After proposal is submitted — visible on the brief |
| How many other venues responded | ❌ No | Proposal count not shown to venues — prevents gaming |
| Why their proposal wasn't selected | ❌ No | Generic closure notification only |

### 8.3 What the AI can access

| Data | Access | Notes |
|---|---|---|
| Brief details | ✅ Full | Needed to score proposals against requirements |
| All proposals for a brief | ✅ Full | Needed for comparative analysis |
| Proposal version history | ✅ Full | For version-aware caching |
| Host identity | ❌ No | Analysis is anonymous — no personal data used |
| Venue identity beyond profile | ❌ No | Scores based on proposal content, not who the venue is |

---

## 9. Feature Scope

### Core — Must Ship

**Auth & Onboarding**
- Role-based registration (Host vs Venue Rep)
- Venue profile setup (capacity, location, style tags, amenities, event types, contact)
- Host profile — minimal (name, contact only)

**Brief Management**
- Brief creation with all fields + free-text description + proposal deadline
- AI brief quality check on submit — warns if incomplete, doesn't block
- Brief lifecycle state management: draft → open → evaluating → closed
- Host brief dashboard — all briefs, status, proposal count, deadline countdown

**Matching & Notifications**
- Two-layer matching engine: hard filters (capacity, location, date) + soft scoring (style tags, amenities, event types)
- In-app real-time notification when matched brief goes live
- Email notification sent async on match
- Venue brief feed — all matched briefs sorted by deadline

**Proposals**
- Structured proposal submission (fixed fields + free-text pitch)
- Proposal versioning — each revision is a new immutable record
- Proposal deadline enforcement — cron job closes brief to new proposals on deadline
- Venue proposal dashboard — all proposals, status, revision history

**Comparison & AI Analysis**
- Proposal card overview — scannable, all key info visible
- Side-by-side comparison for 2–3 selected proposals
- AI analysis: match score + plain-English summary per proposal + gap flagging
- Auto-runs as background job when 2+ proposals arrive
- Host can manually re-trigger — version-aware cache prevents redundant processing
- Analysis streams live to host via SSE

**Deal Locking**
- Accept flow with confirmation summary screen
- Atomic DB transaction — one proposal locked, all others closed, brief closed
- Post-lock notifications — winning venue (full details) + losing venues (generic closure)
- Locked brief summary page — permanent read-only record

---

### to Have 

- Venue photo gallery on profile and proposal cards
- Social login (Google)
- Brief templates for common event types (In version 2)
- Venue ratings and reviews from past bookings
- Post-event review system
- PDF booking summary export
- AI factors in venue reputation when scoring

---

### Explicitly Out of Scope — v1

| Feature | Reason |
|---|---|
| In-app messaging | Communication happens outside the platform via contact details. In-app chat is a product in itself. |
| Payments & deposits | Payment infra, compliance, refund logic — entirely separate product layer |
| Individual vendor coordination | Multiplies data model complexity 5x |
| Corporate event planning | Different user, different journey, different data model |
| Admin / moderation panel | Operational tooling — not core to demonstrating the product concept |
| Mobile app | Web-only in v1 |

---

## 10. What the System Does and Does Not Do

### The system DOES:
- Let a host describe their event once and receive structured proposals from multiple venues
- Match briefs to relevant venues automatically — no manual searching
- Give venues a professional, standardised channel to present their full offering
- Show the host all proposals in a consistent, comparable format
- Analyse proposals with AI and surface a score and plain-English summary per venue
- Enforce a fair, time-bound process — deadlines, state transitions, immutable records
- Lock a deal atomically — one transaction, no partial states, full consistency
- Keep all parties informed in real time throughout the process

### The system DOES NOT:
- Move money — no payments, deposits, or financial transactions
- Facilitate communication — contact details are shared, conversations happen outside
- Coordinate multiple vendors — one full-service venue per event, that's it
- Guarantee venue quality — no verification, no fraud detection in v1
- Replace the host's decision — AI informs, never decides
- Show competing proposals to venues — full information asymmetry maintained

---

*Next step: Architecture & system design — data model, API design, job queue, SSE design, caching strategy.*
