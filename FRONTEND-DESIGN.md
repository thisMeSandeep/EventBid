# EventBid — Frontend Design Guide

> This guide covers layout, spacing, typography, component patterns, and interaction design for EventBid's inner pages. It is not about the theme (already locked in). It is about how the interface feels and behaves — specifically how to keep it calm, readable, and approachable for users who are not power users.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Layout System](#2-layout-system)
3. [Navigation](#3-navigation)
4. [Spacing Principles](#4-spacing-principles)
5. [Typography Usage](#5-typography-usage)
6. [Page Patterns](#6-page-patterns)
7. [Component Patterns](#7-component-patterns)
8. [States & Feedback](#8-states--feedback)
9. [Interaction Design](#9-interaction-design)
10. [Role-Specific UX Notes](#10-role-specific-ux-notes)
11. [Rules to Never Break](#11-rules-to-never-break)

---

## 1. Design Philosophy

### The Mental Model: Calm Workspace, Not Dashboard

EventBid is used by two types of people who are both making real decisions with real money:

- A host planning a wedding, birthday, or corporate event — likely using this product once or twice in their life
- A venue manager running their business — not a software power user

Neither of these people should feel overwhelmed when they open the product. The interface must earn trust before it earns engagement.

**The guiding principle:** Every page should feel like a well-lit table with the right information laid out in front of you. Nothing fighting for attention. Nothing hidden. Nothing to figure out.

---

### Four Laws of EventBid UI

**1. One primary action per screen.**
Every page has one obvious next step. That step is visually dominant. Everything else is supporting context.

**2. Vertical flow, not grid soup.**
Pages read top to bottom. Users should never have to scan a grid of equal-weight cards trying to figure out where to look first.

**3. Status over numbers.**
Don't show metric cards. Tell a story. "Your brief is active. 3 venues have responded. Analysis is ready." is better than three separate stat boxes.

**4. Whitespace is doing work.**
Empty space is not wasted space. It is what makes a page feel calm instead of overwhelming. When in doubt, add more padding.

---

## 2. Layout System

### Page Shell

Every inner page uses the same shell:

```
┌─────────────────────────────────────────────┐
│                  Top Nav                    │  height: 56px
├─────────────────────────────────────────────┤
│                                             │
│              Page Content                  │  max-w-3xl or max-w-5xl
│                                             │  mx-auto px-6
│                                             │
└─────────────────────────────────────────────┘
```

- Nav is fixed, 56px tall, full width
- Content is centered, never full bleed
- No sidebars on any inner page

---

### Content Width Constraints

Two widths are used across the entire product. Nothing else.

| Width | Usage | Tailwind |
|---|---|---|
| `max-w-3xl` (48rem) | Single-focus pages — auth, forms, empty states, account settings | `max-w-3xl mx-auto` |
| `max-w-5xl` (64rem) | List and detail pages where content is wider — brief list, proposal comparison | `max-w-5xl mx-auto` |

Never use full width (`w-full`) for readable content. Never use `max-w-7xl` — it's too wide for this product's content density.

---

### Page Anatomy

Every page follows the same top-down anatomy:

```
┌─────────────────────────────────────┐
│  Page Header                        │  Page title + optional subtitle
│  (optional contextual action)       │  One action max — top right
├─────────────────────────────────────┤
│  Status / Context Bar               │  Optional — brief status, deadline, count
│  (only when directly useful)        │
├─────────────────────────────────────┤
│                                     │
│  Primary Content                    │  The main list, form, or detail
│                                     │
├─────────────────────────────────────┤
│  Secondary Content                  │  Optional — related info, AI analysis panel
│  (only when needed)                 │
└─────────────────────────────────────┘
```

Page header is always plain text — no card, no box, no background. Just a heading and optional muted subtitle beneath it.

---

### Grid Usage

Grids are used in exactly two places:

1. **Proposal comparison view** — two or three proposal cards side by side on wide screens, stacked on mobile. This is the only place a horizontal grid layout is used.
2. **Venue profile photo grid** — 2-column photo grid on the venue profile card.

Everywhere else: single column, vertical flow.

---

## 3. Navigation

### Top Nav Structure

```
┌──────────────────────────────────────────────────────┐
│  EventBid          Briefs   Feed         🔔  Avatar  │
└──────────────────────────────────────────────────────┘
```

- Logo/wordmark — left, links to home/dashboard
- Nav links — center-right, 2-3 items max depending on role
- Notification bell — right, shows unread dot when there are unread notifications
- Avatar — far right, opens a small dropdown (account, sign out)

Height: `h-14` (56px). Background: `bg-card`. Bottom border: `border-b border-border`. No shadow on the nav.

---

### Nav Links by Role

**Host:**
- My Briefs
- (Notifications via bell icon only)

**Venue Rep:**
- Brief Feed
- My Proposals
- (Notifications via bell icon only)

That is the entire nav. No sub-navigation, no mega menu, no secondary sidebar.

---

### Active State

Active nav link: `text-primary font-medium`. Nothing else — no underline, no background pill, no border. The weight and color change is enough.

Inactive nav link: `text-muted-foreground`. Hover: `text-foreground transition-colors duration-150`.

---

### Notification Bell

Unread state: a small filled dot in `bg-primary` positioned top-right of the bell icon. Size: `w-2 h-2`. No number badge — the dot is enough to prompt a click.

Notification dropdown: opens below the bell, `max-w-sm`, shows last 5 notifications as a list. Each notification is a single row — icon + text + time. No cards, no borders between items, just `py-3 border-b border-border` separators.

---

### Mobile Nav

On screens below `md`: hide nav links. Show hamburger icon that opens a full-height drawer from the left. Drawer background uses `bg-card`. Links are large, `text-lg`, `py-4` each. Plenty of tap space.

---

## 4. Spacing Principles

### The Spacing Scale

Only use spacing values from this set. Do not invent intermediate values.

| Token | Value | Usage |
|---|---|---|
| `space-2` | 8px | Inline gaps — icon to label, tag spacing |
| `space-3` | 12px | Tight internal padding — badge padding, small gaps |
| `space-4` | 16px | Default internal padding — input fields, small cards |
| `space-6` | 24px | Standard section gaps, card padding |
| `space-8` | 32px | Generous section gaps, page header bottom margin |
| `space-12` | 48px | Major section separations |
| `space-16` | 64px | Page top padding, large breathing room |

---

### Page Padding

```
Page top padding:      pt-10 (40px)
Page bottom padding:   pb-16 (64px)
Page horizontal:       px-6 (24px) — on the content wrapper, not the shell
```

---

### Card Padding

```
Standard card:         p-6 (24px)
Compact row item:      px-6 py-4
Detail card (wide):    p-8 (32px)
```

---

### Vertical Rhythm Rules

- Page heading → first content: `mt-8`
- Between list items (row style): `border-b border-border` — no margin needed, the border creates rhythm
- Between sections on a detail page: `mt-10` or `mt-12`
- Between a label and its value: `mt-1`
- Between a section heading and its content: `mt-4`

---

### What Not To Do

- Never use `p-2` or `p-3` as the primary padding on a card — it will feel cramped
- Never stack two sections with less than `mt-8` between them on a detail page
- Never use `gap-2` in a flex row where the items are substantial — use `gap-4` minimum

---

## 5. Typography Usage

### Font: Outfit

Already set in the theme. Outfit is geometric but friendly — it reads cleanly at small sizes and has enough character to feel considered without being decorative.

---

### Type Scale

| Role | Size | Weight | Color | Tailwind |
|---|---|---|---|---|
| Page title | `text-2xl` | `font-semibold` | `text-foreground` | — |
| Page subtitle | `text-sm` | `font-normal` | `text-muted-foreground` | — |
| Section heading | `text-base` | `font-medium` | `text-foreground` | — |
| Card title | `text-base` | `font-medium` | `text-foreground` | — |
| Body text | `text-sm` | `font-normal` | `text-foreground` | — |
| Supporting text | `text-sm` | `font-normal` | `text-muted-foreground` | — |
| Label / eyebrow | `text-xs` | `font-medium` | `text-muted-foreground` | `uppercase tracking-wide` |
| Metadata / timestamps | `text-xs` | `font-normal` | `text-muted-foreground` | — |

---

### Hierarchy Rules

- **Never use `text-xl` or larger inside a card or list item.** Cards are not pages — their internal hierarchy is subtle.
- **Two levels of text weight is enough** in any single component — `font-medium` for the primary label, `font-normal` for supporting text.
- **Color does more hierarchy work than size.** `text-foreground` vs `text-muted-foreground` creates clear hierarchy without aggressive size jumps.
- **No bold body text** (`font-bold`) anywhere in the interface. `font-semibold` is the maximum weight used, and only for page titles.

---

### Line Length

Body text and form labels should never exceed `max-w-prose` (65ch). Reading lines that are too long are exhausting. On wide layouts, constrain descriptive text columns explicitly.

---

### Number & Data Display

Monetary values (budget, proposal price): always formatted with Indian number formatting — `₹5,00,000` not `₹500000`. Use a shared formatter utility.

Dates: human-readable always — `15 Nov 2025` not `2025-11-15`. Relative dates for recent activity — `2 days ago`, `just now`.

---

## 6. Page Patterns

### Auth Pages (Login / Register)

**Layout:** `max-w-sm mx-auto`, vertically centered on the page with `min-h-screen flex items-center justify-center`.

**Structure:**
```
Logo / wordmark          — centered, mb-8
Page heading             — "Welcome back" / "Create your account"
Subtext                  — one line, muted
Form                     — mt-6, standard spacing
Role selector            — only on register, two clean option cards
Primary CTA button       — full width, mt-6
Divider + OAuth option   — mt-4
Switch link              — "Don't have an account? Sign up" — centered, mt-6, muted
```

Role selector on register: two side-by-side cards — "I'm planning an event" and "I represent a venue." Each card has an icon, a label, and a one-line description. Selected state: `border-primary bg-accent`. Unselected: `border-border bg-card`. No heavy styling — the border color change is enough.

---

### Host — Brief List Page

**Header:**
```
My Briefs                          [+ Create Brief]
Your event briefs and their status
```

Page title left, single primary action button right. Button: `variant="default"` (primary green). No secondary actions at this level.

**Empty state** (no briefs yet):
```
           [icon: document-plus]
       You haven't created a brief yet
  Describe your event and let venues come to you.
           [Create your first brief]
```
Centered, `max-w-xs mx-auto`, icon in `text-muted-foreground`, heading in `text-foreground`, description in `text-muted-foreground`, button centered below. No card box around this — just centered content on the page background.

**Brief list — row style:**

Each brief is a horizontal row, not a card:

```
┌─────────────────────────────────────────────────────┐
│  Wedding Reception          ●  Open          →      │
│  15 Nov 2025  ·  200 guests  ·  ₹5L – ₹8L          │
│  3 proposals  ·  Deadline in 4 days                 │
└─────────────────────────────────────────────────────┘
```

- `border-b border-border` separates rows — no individual card borders
- First line: event type (bold-ish, `font-medium`) + status badge right-aligned + chevron
- Second line: date · headcount · budget range — all `text-sm text-muted-foreground`
- Third line: proposal count + deadline — `text-xs text-muted-foreground`
- Row background: `bg-transparent`. Hover: `bg-muted/50 transition-colors duration-150`
- Full row is clickable — no separate "View" button

Status badge: small, pill-shaped, no heavy color fill.
- Open: `bg-accent text-accent-foreground`
- Evaluating: `bg-secondary/30 text-secondary-foreground`
- Closed: `bg-muted text-muted-foreground`
- Expired: `bg-destructive/10 text-destructive`

---

### Host — Brief Creation Wizard

The most important first-touch flow for a host. It must feel like answering a friendly enquiry, not filling out a software form.

**Layout:** `max-w-2xl mx-auto`. Single column. Multi-step, one step per screen — never a long scrolling form.

**Step model:** Wizard step lives in the URL search param (`?step=1`). Browser back/forward preserves progress. Four steps:

1. **Event basics** — event type (large radio cards), date(s), headcount
2. **Location & budget** — city, state, budget min/max
3. **Requirements & description** — requirement tags (toggleable), free-text description
4. **Review** — read-only summary, AI quality warnings (if any), submit

**Header (persistent across steps):**
```
← My Briefs
Create a brief
Step 2 of 4  ·  Location & budget
```
Back link top-left. Page title plain. Step indicator as plain muted text — no progress bars, no numbered dots. The user knows where they are because the page tells them.

**Step body:** standard form spacing from §7. Section heading at the top of each step (`text-base font-medium`) with a one-line muted subtitle below it explaining the step in plain language.

**Step navigation:**
```
                              [Back]  [Continue]
```
- Right-aligned, `gap-2`, bottom of the step body with `mt-10` above
- `Back`: `variant="ghost"` — disabled on step 1
- `Continue`: `variant="default"` — disabled until the current step validates
- Final step replaces `Continue` with `Submit brief` — same variant, no special treatment

**AI quality warnings (step 4):** rendered as a quiet inline list above the submit button — never a blocking modal. Each warning is a single line with a `text-amber-500/80` dot prefix. Heading: "A few things worth a second look" in `text-sm font-medium`. Warnings do not block submission — the host can submit anyway.

**Improve description (step 3):** a small `variant="ghost"` link below the description textarea — "✦ Improve with AI". Clicking it opens a streaming panel inline below the textarea, text appearing word by word. An "Apply" button copies the streamed text into the description field. The original text is preserved until apply — never auto-replace.

---

### Host — Brief Detail Page

This is the most important page. A host comes here to read proposals and make a decision.

**Header:**
```
← My Briefs
Wedding Reception                     [Close Brief]
15 Nov 2025  ·  Hyderabad  ·  200 guests
```

Back link top-left (`text-sm text-muted-foreground`, chevron left). Page title below. Destructive action (`Close Brief`) only shown when brief is open — right aligned, `variant="outline"` with destructive color, not a red button.

**Context bar** (below header, `mt-4`):
```
● Open  ·  3 proposals received  ·  Deadline: 4 days left
```
Single line, `text-sm text-muted-foreground`. The status dot matches the badge color. This replaces metric cards entirely.

**Brief summary section:**
A single quiet block showing what the host asked for — event type, dates, headcount, budget range, requirements as small tags, description. Background: `bg-muted/40 rounded-lg p-6`. No card shadow. This is reference information — it should feel secondary to the proposals below it. Label/value pairs, labels in `text-xs uppercase tracking-wide text-muted-foreground`, values in `text-sm text-foreground`.

**Proposals section heading:**
```
Proposals  (3)                    [✦ View AI Analysis]
```
Section heading left, AI analysis trigger right. The AI analysis button only appears when analysis is available — `variant="outline"` with a subtle sparkle icon. When analysis is running: show a muted spinner and "Analysing..." text in place of the button.

**Proposal cards:**

When there are 1-2 proposals: full width stacked vertically.
When there are 3+: side-by-side on `md+` screens (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`), stacked on mobile.

> **No separate "compare" page.** Side-by-side comparison happens on this page via the responsive grid. The brief detail page is the comparison view — there is no `/compare` route to design or build.

Each proposal card:
```
┌─────────────────────────────────────┐
│  The Grand Banquet Hall             │
│  Hyderabad  ·  Max 300 guests       │
│                                     │
│  ₹6,50,000  starting from           │
│                                     │
│  ✓ Catering included                │
│  ✓ AV equipment                     │
│  ✓ Availability confirmed           │
│                                     │
│  [View Full Proposal]  [Accept]     │
└─────────────────────────────────────┘
```

Card: `bg-card border border-border rounded-lg p-6`. No shadow.
Venue name: `text-base font-medium`.
Price: `text-xl font-semibold text-foreground` — the one place a larger size is used inside a card, because price is the primary decision signal.
Inclusions: `text-sm text-muted-foreground` with a `text-primary` checkmark icon.
Accept button: `variant="default"` — primary green. Only shown when brief is `open` or `evaluating`.

**AI Analysis panel:**

Slides in below the proposals section when the host clicks "View AI Analysis." Not a modal — inline expansion.

```
┌────────────────────────────────────────────────────┐
│  ✦ AI Analysis                          [Dismiss]  │
│  Based on your brief requirements                  │
│                                                    │
│  The Grand Banquet Hall         Score: 87/100      │
│  Covers all core requirements. Slightly above      │
│  budget. AV not explicitly confirmed.              │
│  Gaps: outdoor space not specified                 │
│                                                    │
│  Sunrise Gardens                Score: 74/100      │
│  ...                                               │
└────────────────────────────────────────────────────┘
```

Background: `bg-accent/40 rounded-lg p-6 border border-border`. Score displayed as `text-lg font-semibold text-primary`. Gaps in `text-xs text-muted-foreground`. Streaming text renders word by word — no skeleton loader, just the text appearing naturally.

---

### Venue Rep — Brief Feed Page

**Header:**
```
Brief Feed
Events looking for venues like yours
```

No primary action button here — this is a read-only discovery page.

**Filter bar** (below header, `mt-6`):
```
[All]  [Wedding]  [Birthday]  [Corporate]  [Party]
```
Horizontal pill filters, `gap-2`. Active: `bg-primary text-primary-foreground`. Inactive: `bg-muted text-muted-foreground`. No dropdown filter panel — these five categories cover all event types.

**Brief rows** — same row style as the host list, adapted:

```
┌─────────────────────────────────────────────────────┐
│  Wedding Reception               Deadline: 4 days → │
│  15 Nov 2025  ·  200 guests  ·  ₹5L – ₹8L          │
│  Hyderabad  ·  Match score: ●●●●○                   │
└─────────────────────────────────────────────────────┘
```

Match score shown as filled/empty dots (5 dot scale) in `text-primary` — more readable than a percentage for non-technical users. Hoverable with a tooltip showing the exact score.

---

### Venue Rep — Proposal Submission Page

**Layout:** `max-w-3xl mx-auto` — form layout, single column.

**Header:**
```
← Brief Feed
Submit a Proposal
Wedding Reception  ·  15 Nov 2025  ·  200 guests
```

Brief context shown as a single muted line below the heading — so the venue rep always knows what they're responding to without scrolling.

**Form sections** — grouped, not a single long form:

```
Pricing
───────────────────────────────
Total price          [________]
Price type           [Fixed ▾]

What's included
───────────────────────────────
☑ Catering    ☐ AV    ☑ Parking ...
Catering type        [Included ▾]

Availability & Capacity
───────────────────────────────
☑ I confirm availability for this date
☑ Venue can accommodate 200+ guests

Additional notes
───────────────────────────────
[                              ]
[  Free text area              ]

              [Submit Proposal]
```

Section headings: `text-sm font-medium text-foreground` with a `border-b border-border pb-2 mb-4` beneath them. This creates visual grouping without heavy box containers.

Submit button: full width `w-full`, `variant="default"`, `mt-8`.

---

### Venue Rep — Venue Profile Page

**Layout:** `max-w-3xl mx-auto`.

Split into clearly separated sections with `mt-10` between each:

1. **Basic info** — name, description, city, contact
2. **Details** — capacity, event types (as tags), style tags (as tags), amenities (as tags)
3. **Photos** — `grid grid-cols-2 gap-3`, max 6 photos, each with a delete icon on hover
4. **Save button** — `variant="default"`, right-aligned, sticky at bottom on mobile

Tags (event types, amenities, style): small pills, `bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs`. Editable — clicking an active tag removes it, clicking an inactive one adds it.

---

### Venue Rep — My Proposals Page

**Layout:** `max-w-5xl mx-auto`.

**Header:**
```
My Proposals
Proposals you've submitted across all briefs
```

No primary action button — this is a status-tracking page.

**Filter bar** (below header, `mt-6`):
```
[All]  [Active]  [Locked]  [Closed]  [Superseded]
```
Horizontal pill filters, same pattern as the brief feed. Counts shown in parentheses on each pill: `Active (3)`.

**Proposal rows** — row layout, not cards. One row per proposal:

```
┌──────────────────────────────────────────────────────────┐
│  Wedding Reception  ·  Hyderabad     ●  Active        →  │
│  ₹6,50,000  starting from  ·  Submitted 2 days ago       │
│  Brief deadline: 4 days left                             │
└──────────────────────────────────────────────────────────┘
```

- First line: brief event type + city, status badge right-aligned, chevron
- Second line: own price + relative submitted timestamp — `text-sm text-muted-foreground`
- Third line: brief deadline — `text-xs text-muted-foreground`. When status is `locked` or `closed`, this line shows the outcome instead: "You won this brief" or "Another venue was selected"
- Row is fully clickable — navigates to the read-only brief view with the proposal panel expanded
- `border-b border-border` between rows, same as other lists

Status badge palette extends the four-state set from §7:
- Active: `bg-accent text-accent-foreground`
- Locked (won): `bg-primary/15 text-primary` — the one place a slightly stronger fill is acceptable because winning is the signal moment
- Closed (lost): `bg-muted text-muted-foreground`
- Superseded: `bg-muted/60 text-muted-foreground` — visually quieter than closed; this is an archival state, not an outcome

**Empty state** when no proposals exist yet:
```
           [icon: paper-plane]
       You haven't submitted any proposals yet
  Open briefs matching your venue will appear in your feed.
              [View brief feed]
```

---

### Notifications Page

**Layout:** `max-w-2xl mx-auto`.

**Header:**
```
Notifications                    [Mark all read]
```

"Mark all read" only visible when there are unread items. `variant="ghost"` — very quiet.

**Notification rows:**

```
┌─────────────────────────────────────────────────────┐
│  ●  New proposal received                           │
│     The Grand Banquet Hall responded to your        │
│     Wedding Reception brief.          2 hours ago   │
└─────────────────────────────────────────────────────┘
```

Unread: left border `border-l-2 border-primary pl-4`, background `bg-muted/30`.
Read: no left border, `pl-6` to maintain alignment, background transparent.
Full row is clickable — navigates to the relevant brief or proposal.

---

### Account / Settings Page

**Layout:** `max-w-2xl mx-auto`.

Simple stacked sections:
1. Profile (name, email — email read-only if Google OAuth)
2. Password change (only for email/password accounts)
3. Danger zone (delete account — `text-destructive`, requires confirmation)

No tabs, no sidebar nav within the settings page. Just vertical sections with `mt-10` between them and clear `text-sm font-medium` section headings.

---

## 7. Component Patterns

### Buttons

Three variants used in EventBid. No others.

| Variant | Usage | When |
|---|---|---|
| `default` | Primary action — Create Brief, Submit Proposal, Accept | One per page max |
| `outline` | Secondary action — View Analysis, Edit, Cancel | Supporting actions |
| `ghost` | Tertiary / quiet action — Mark read, Dismiss, Back links | Low-priority actions |

Button sizing: `size="default"` everywhere. No `size="lg"` except on auth page CTAs. No icon-only buttons except the notification bell and nav avatar.

Destructive actions (`Close Brief`, `Delete Account`): use `variant="outline"` with `className="text-destructive border-destructive hover:bg-destructive/10"` — never a full red filled button. Red filled buttons feel alarming. A red-outlined button communicates caution without panic.

---

### Form Inputs

All inputs use shadcn's `Input` and `Textarea` components unchanged. No custom styling on inputs.

Label always above input — never placeholder-as-label. Placeholder text is an example value, not the field name.

Error state: `text-destructive text-xs mt-1` below the input. No red border on the input itself — the text message is enough.

Optional fields: mark with `(optional)` in `text-muted-foreground text-xs` next to the label. Never use asterisks for required fields — mark optional ones instead, required is the default assumption.

---

### Status Badges

Small, pill-shaped, low-contrast fill. Never a thick colored block.

```tsx
// Usage pattern
<Badge variant="secondary" className="bg-accent/50 text-accent-foreground">
  Open
</Badge>
```

Four states in the product — Open, Evaluating, Closed, Expired. Each maps to a specific muted color combination from the theme. Never use raw red/green/yellow — use the theme tokens.

---

### Empty States

Every list or feed that can be empty has an empty state. No blank white space.

Pattern:
```
[icon — muted, size 40px]
Primary message         — text-foreground, font-medium
Supporting message      — text-muted-foreground text-sm, max-w-xs, centered
[CTA button]            — only if there's an action to take
```

Centered in the available space. No card box around it. Icon from lucide-react, `text-muted-foreground`.

---

### Loading States

No skeleton screens for inner page content — they add complexity and rarely match the real layout.

Instead:
- **Lists:** Show 3 muted placeholder rows — `bg-muted animate-pulse rounded h-16` — same height as real rows
- **Detail pages:** Show the page header immediately (from SSR/loader), pulse only the content section
- **AI analysis streaming:** Text appears word by word as it streams — no loader at all

---

### Confirmation Dialogs

Used for: accepting a proposal (irreversible), closing a brief, deleting account.

Pattern: shadcn `AlertDialog`. Keep the message short and plain. State exactly what will happen. One destructive confirm button, one cancel.

```
Accept this proposal?

Accepting The Grand Banquet Hall's proposal will close
this brief and notify all other venues. This cannot
be undone.

[Cancel]   [Yes, accept proposal]
```

The confirm button text is always specific — never just "Confirm" or "Yes." Tell the user exactly what they're doing.

---

### Tags / Requirement Pills

Used for: brief requirements, venue amenities, event types, style tags.

```tsx
<span className="inline-flex items-center rounded-full bg-accent/60
                 text-accent-foreground text-xs px-3 py-1">
  Catering
</span>
```

Non-interactive tags: `bg-accent/60`.
Interactive (toggleable on venue profile): add `cursor-pointer hover:bg-accent transition-colors duration-150`. Active: `bg-primary text-primary-foreground`. Inactive: `bg-muted text-muted-foreground`.

---

## 8. States & Feedback

### Toast Notifications

Used for: success confirmations, non-critical errors, background job completions.

- Position: bottom-right
- Duration: 4 seconds for success, 6 seconds for errors (more time to read)
- No stacking more than 2 toasts at a time
- Keep messages under 10 words

Examples:
- ✓ "Brief created successfully."
- ✓ "Proposal submitted."
- ✓ "AI analysis is ready — view it on your brief."
- ✗ "Something went wrong. Please try again."

---

### SSE-Driven Updates

When a real-time SSE event arrives, the UI responds quietly:

| Event | UI Response |
|---|---|
| `proposal.received` | Increment proposal count on the brief row without page reload. Show a toast: "New proposal received." |
| `analysis.ready` | If the user is on the brief detail page, swap "Analysing..." to "View AI Analysis" button. Toast: "AI analysis is ready." |
| `analysis.stale` | If visible, dim the analysis panel and show "Proposals have changed — re-run analysis." inline. |
| `brief.matched` | Toast for venue rep: "A new brief matches your venue." with a link. |
| `proposal.accepted` | Full-page state update — brief shows as closed, accepted proposal card shows a "Accepted ✓" state. |

No jarring page refreshes. No modals interrupting the user. Quiet inline updates or toasts only.

---

### Form Validation

- Validate on submit first, not on every keystroke
- On blur validation only for fields where immediate feedback is useful (e.g. budget min > budget max)
- Show all errors at once after submit — not one at a time
- Scroll to first error automatically

---

### Error Pages

**404:** Simple centered message. "This page doesn't exist." + back link. No illustration.
**500:** "Something went wrong on our end. We've been notified." + back link. No technical details.
**Unauthorized:** Redirect to login silently. No error page.

---

## 9. Interaction Design

### Hover Transitions

One transition rule for the entire product:

```css
transition-colors duration-150
```

Applied to: nav links, list rows, buttons (shadcn handles this), tags, clickable cards.

Nothing else moves, scales, or slides on inner pages. No `transform`, no `scale`, no `translate` on hover. No entrance animations. Content is already there when the page loads.

---

### Clickable Areas

Every list row is fully clickable — no "View" button inside a row. The entire row is the target.

```tsx
<Link
  to="/host/briefs/$briefId"
  params={{ briefId: brief.id }}
  className="block hover:bg-muted/50 transition-colors duration-150"
>
  {/* row content */}
</Link>
```

Minimum tap target on mobile: `min-h-[56px]`. Rows should naturally meet this with `py-4` padding.

---

### Focus States

Shadcn handles focus rings via `outline-ring/50` (already in the theme base layer). Do not override or remove focus rings — they are essential for keyboard navigation.

---

### Disabled States

Disabled buttons: `opacity-50 cursor-not-allowed`. Never hide a disabled button — show it disabled so the user knows the action exists but isn't available.

When a brief is closed: proposal accept buttons become disabled. Show a muted "Brief closed" label instead.

---

### Optimistic Updates

Apply optimistic updates for: marking notifications as read, toggling venue profile tags. These feel instant and can be silently reverted on error with a toast.

Do not apply optimistic updates for: accepting a proposal, submitting a proposal, closing a brief. These are consequential — wait for server confirmation before updating the UI.

---

## 10. Role-Specific UX Notes

### Host UX Priorities

1. **The brief creation flow must feel effortless.** Hosts are not technical. The form should feel like filling out an event enquiry, not a software form. Plain labels, helpful placeholder examples, no jargon.

2. **Proposal comparison is the core job.** Everything on the brief detail page is in service of helping the host compare proposals and feel confident about their decision. Don't clutter this page.

3. **The AI analysis is a tool, not the answer.** Present it as a helpful summary, not an authoritative recommendation. The copy should say "Here's what we noticed" not "We recommend."

4. **Deadline visibility is important.** The deadline should always be visible on the brief — in the list row, in the detail header, in the context bar. Hosts forget they set a deadline.

---

### Venue Rep UX Priorities

1. **The brief feed must be scannable.** A venue rep might check the feed daily. They need to quickly identify relevant briefs and skip irrelevant ones. The row layout with match score dots serves this.

2. **Proposal submission should feel professional.** The form is simple but the output matters — the venue rep is putting their business forward. The form should feel considered, not like a Google Form.

3. **Proposal status visibility.** A venue rep needs to always know: which briefs have they responded to, which proposals are still active, which were accepted or declined. This should be immediately clear from the My Proposals page without opening each one.

4. **Venue profile completeness drives matches.** Quietly surface profile completeness — not as a progress bar or gamification, but as a simple muted note: "Add more event types to your profile to receive more relevant briefs."

---

## 11. Rules to Never Break

These are not guidelines — they are constraints. If a design decision violates one of these, it is wrong.

1. **Never more than one primary action button per page.** If you think you need two, one of them is secondary.

2. **Never put a metric card on any page.** No "3 Proposals" boxes. No stat grids. Use inline text context instead.

3. **Never use `font-bold` anywhere in the UI.** `font-semibold` is the ceiling.

4. **Never use a modal for navigation.** Modals are for confirmations and quick edits only. Never use a modal where a page would be more appropriate.

5. **Never show an empty white page while loading.** Every page has either SSR content or a pulsing placeholder.

6. **Never let an SSE event interrupt the user.** No modals, no forced refreshes, no overlays from real-time events. Quiet toasts and inline updates only.

7. **Never use color alone to convey status.** Every status badge has a text label. Color is reinforcement, not the signal.

8. **Never use placeholder text as a label.** Labels live above inputs, always.

9. **Never stack more than two levels of visual hierarchy inside a single card.** Title → supporting text. That's it.

10. **Never trigger a destructive action without a confirmation dialog.** Accepting a proposal, closing a brief, deleting anything — always confirm.

---

*Last updated: v1.0 — initial frontend design guide*
*Covers: inner pages only. Landing page design guide to follow separately.*