---
name: grill-prd
description: Grill the user relentlessly, one question at a time with a recommended answer, then write a precise PRD with stack, architecture, data model and a phased feature map (feature -> sub-feature). Use when the user wants to write, refine, or validate a PRD or plan a new app/feature.
---

# Grill PRD

Interview the user relentlessly about every aspect of the product until you reach a shared understanding, THEN write the PRD.
Adapted from the `grill-me` skill (mattpocock/skills, MIT): walk down every branch of the design tree, resolve dependencies between decisions one by one, and provide a recommended answer for every question.

The goal is not a long document but a **precise** one: every feature has a role, every sub-feature has testable acceptance criteria, every entity has an owner, every stack choice has a reason, and the phase order never violates a dependency.

---

## 1. Grilling rules (mandatory)

1. **One question per turn.** Never stack questions. Exceptions: (a) the user asks for "batch mode" → at most 4 questions that are all on the current frontier (independent of each other); (b) the four tech-layer questions in TP (§2) may be asked together because they are independent.
2. **Every question MUST include a recommended answer** and the reason for it. The user can simply reply "ok" to accept.
3. **Follow dependency order**, not template order. Do not *recommend* a stack before you know who the users are, the scale, and the SEO/realtime/offline needs. The user's own stack preferences (TP) are asked early because they are constraints, not recommendations.
4. **Don't ask what you can look up.** If the answer is in the codebase, documents, memory, or earlier answers → look it up first, share what you found, and only ask for confirmation.
5. **Chase vague answers.** "Fast", "easy", "a lot", "secure", "later" are not answers. Turn them into numbers, rules, or concrete examples.
6. **Challenge contradictions directly.** Example: "Clear pricing" is the core value, but Set Pricing is in Phase 4 → point out the conflict and recommend a fix.
7. **Log every decision** in the Decision Log (see §5) as soon as it is confirmed.
8. **The user may skip.** A skipped question is filled with your recommendation, marked `[ASSUMPTION]`, and added to Open Questions.
9. Stop grilling only when the Definition of Ready (§6) is met or the user says "enough, write the PRD".

### Question format

```
❓ [B3.2] Who populates the design catalog for the first time?
Why it matters: Design Gallery (Phase 1) is empty without a data source.
➡️ Recommendation: Admin uploads via the Manage Designs panel, so Manage Designs + Admin Login move to Phase 1.
Alternatives: (a) manual seed via script in Phase 1, panel later; (b) import from a Google Drive folder.
```

The code `[B3.2]` = branch B3, question 2. Show a short progress line whenever you switch branches, e.g. `Branches done: B1 ✅ TP ✅ B2 ✅ | Now: B3`.

### Interactive questions

If an interactive multiple-choice tool is available (e.g. `AskUserQuestion`), use it for questions with discrete options: put the recommended option first and label it `(Recommended)`; the user can always type their own answer. Most such tools allow only ~4 options per question, so offer the 3–4 most relevant options from the catalog (§3.1) and let the user type anything else. Without such a tool, ask in text with a numbered list.

---

## 2. Design tree (ordered by dependency)

Walk the branches below. A branch is done when its **exit criteria** are met. Jump to another branch only when a user answer opens a new dependency.

### B1 — Problem & users
- Who is the primary user (concrete, not "the general public")? What do they do TODAY to solve the problem?
- The one thing they must accomplish in their first session before closing the app.
- What makes this app better than the current way (pick ONE core value)?
- What brings users back (retention), and how do they find out something is new?
- Who is the buyer vs. who is the user? (e.g. the village government buys, the village operator uses it.) Does the buyer have document/administrative requirements?
- **Exit criteria:** 1-sentence problem statement, 1 core value, 1 "first-session job", 1 retention trigger, measurable success metrics.

### TP — Tech preferences (asked right after B1)

**Step 1 — mode.** Ask one question:

```
❓ [TP.1] Do you already have a tech stack in mind, or should I pick it?
➡️ Recommendation: Let me pick (decided in B6 after scope and NFRs are clear) — unless your team already has an established stack.
Options: (1) Let AI pick  (2) Choose myself
```

- **Let AI pick** → record `stack.mode = "ai"`, skip Step 2, and decide every layer in B6 using the Default Stack Profile (§3).
- **Choose myself** → go to Step 2.

**Step 2 — one question per layer.** Ask about these four layers (they are independent, so they may be asked together in one round):

| Layer | Question | Purpose |
|---|---|---|
| Frontend | Which frontend for the UI? | UI & user-facing screens |
| Backend | Which backend for logic & API? | Business logic & API server |
| Database | Which database for storage? | Data storage |
| Deployment | Where will it be hosted? | Hosting & infrastructure |

Rules:
- Offer options from the **Layer Catalog (§3.1)**; the user may also type anything not in the list.
- Each layer may be answered `Let AI pick` (or skipped). Partial answers are normal (e.g. only Frontend = Next.js, "1/4 chosen"): the remaining layers are decided in B6 and must be compatible with what the user picked.
- Still give a `➡️ Recommendation` per layer based on what B1 revealed (e.g. public catalog that needs SEO → Next.js or Astro).
- Immediately run the **Compatibility Check (§3.2)** on the chosen combination. Raise each conflict as its own grilling question with a recommended fix — do not silently change the user's choice.
- User picks are **constraints**: B6 may only override them if the user agrees after a conflict is raised. Log each choice in the Decision Log with source `user`.
- **Exit criteria:** `stack.mode` set; every layer is either a user choice, `ai`, or `[ASSUMPTION]`; no unresolved compatibility conflicts among chosen layers.

### B2 — Actors, roles & access
- List the roles (guest, registered user, admin, super admin, etc.). Must public users have an account to transact, or can they act as guests?
- What can/can't each role do (role × capability)?
- Auth method (email+password, WhatsApp OTP, OAuth, magic link). How many admins? (A single admin doesn't need complex user management.)
- **Exit criteria:** complete role matrix, auth method chosen, no feature without a role.

### B3 — Scope & feature map
- Derive features from the job in B1, not from a wish list. Each feature → 2–5 sub-features.
- Prioritize with MoSCoW. Write explicit **Non-goals** (things deliberately not built).
- For every feature ask: "Where does this data come from?" — a feature that displays data must have a feature that creates it.
- Distinguish "built in-house" vs. "integration" (e.g. realtime chat vs. WhatsApp deep link).
- **Exit criteria:** every feature has a goal, role, sub-features, priority; every piece of data has a source.

### B4 — Flows & business rules per feature
- Happy path step by step, then edge cases: empty data, payment failure, duplicates, cancellation, expiry, edit conflicts.
- Entities with a status → define a state machine (e.g. `order: draft → submitted → confirmed → in_progress → completed | cancelled`). Who may trigger each transition?
- Pricing/calculation/limit rules: formulas, rounding, tax, discounts, price version at the time an order is created.
- **Exit criteria:** every sub-feature has testable Given/When/Then acceptance criteria; every status has its transitions and triggers.

### B5 — Data model
- Core entities, relations, cardinality, data owner (who creates/updates).
- Lifecycle: soft delete vs. hard delete, archiving, audit trail (e.g. price change history).
- Files/media: max size, formats, compression, watermarking, storage location.
- What personal data is stored (relevant to data protection laws such as GDPR / Indonesia's PDP Law) and for how long.
- **Exit criteria:** final ERD; every sub-feature maps to the entities it reads/writes.

### B6 — Stack & architecture
- Start from the TP answers. Layers the user chose are fixed constraints; layers marked `ai` or skipped are filled from the **Default Stack Profile (§3)**, choosing options compatible with the user's picks.
- Re-test the full stack against the needs from B1–B5: public SEO? realtime? offline? large file volume? hosting budget? who will maintain it? If a user-chosen layer no longer fits a requirement found later (e.g. realtime discovered in B4 on a serverless host), raise it as a grilling question.
- Then ask the supporting choices that depend on the four layers: ORM / query layer (must match the backend language), auth, file storage, cache/queue if needed.
- Re-run the **Compatibility Check (§3.2)** on the complete stack.
- Topology: modular monolith vs. multi-app monorepo vs. serverless. Module/layer boundaries.
- External integrations: payments (QRIS/virtual accounts), notifications (WhatsApp/Telegram/email), storage, maps.
- Before naming a framework version, verify the latest stable version (official docs or an MCP such as Context7). Don't rely on memory.
- **Exit criteria:** every stack component has a reason tied to a requirement; architecture diagram; folder structure.

### B7 — Non-functional requirements
- Performance (p95 targets, page weight), scale (active users, item count, growth), availability.
- Security: per-endpoint authorization, rate limiting, upload validation, secrets, OWASP basics, backup & restore.
- Observability: logging, error tracking, business metrics.
- Deployment: environments (dev/staging/prod), CI/CD, domain, estimated monthly cost.
- **Exit criteria:** every NFR has a number or a verifiable rule.

### B8 — Release phases & dependency validation
- Group features into phases. **Phase 1 must be a usable end-to-end vertical slice**, not "frontend first, backend later".
- Run the **Phase Dependency Check (§4)** and fix violations with the user.
- **Exit criteria:** no dependency violations; every phase has a goal and a definition of done.

---

## 3. Default Stack Profile (starting recommendation, not an assumption)

Use as the `➡️ Recommendation` in B6. Always state when to deviate. Adjust this table to your team's stack.

| Layer | Default | Choose the alternative when |
|---|---|---|
| Runtime & monorepo | Bun + TypeScript, Nx monorepo | Small single-app project → single repo |
| API | Hono (Bun / Cloudflare Workers) | Bun-only & need end-to-end types → ElysiaJS; very high throughput → Go Fiber; PHP team / heavy admin CRUD → Laravel |
| Public web | Next.js App Router (SSR/SSG for SEO) | No SEO needed → React + Vite / Vue |
| Admin dashboard | React + Vite or Vue | Very simple admin → protected routes in the same app |
| UI | shadcn/ui + Tailwind CSS | — |
| Validation & contracts | Zod, shared `contracts` package for FE & BE | — |
| Database | PostgreSQL + Drizzle or Prisma | All-in on Workers → Cloudflare D1 |
| Auth | better-auth | Institutional SSO → OAuth/OIDC |
| Files | Cloudflare R2 / S3-compatible storage | — |
| Notifications | WhatsApp / Telegram Bot / email | — |
| Deploy | Docker + VPS, or Cloudflare | — |

### 3.1 Layer Catalog (options for TP)

Not exhaustive — the user may type any other technology. Verify that a lesser-known option still exists and is maintained before recommending it.

| Layer | Options |
|---|---|
| Frontend | Next.js · React (Vite) · TanStack Start · React Router 7 / Remix · Astro · Vue.js · Nuxt · SvelteKit · Angular · None (API only) |
| Backend | Same as frontend (Next.js Route Handlers / Server Actions, Nuxt server) · Node.js (Express / Fastify / NestJS) · Hono · ElysiaJS (Bun) · Deno · Python (FastAPI / Django) · Go (Fiber / Echo) · Rust (Axum / Actix) · Laravel (PHP) · BaaS (Supabase / Firebase) |
| Database | PostgreSQL · Neon (serverless Postgres) · Supabase (Postgres) · Prisma Postgres · MySQL · PlanetScale (MySQL) · SQLite / Turso · Cloudflare D1 · MongoDB · Firebase Firestore · Redis (cache/queue, not primary) |
| Deployment | Vercel · Netlify · Cloudflare (Workers / Pages) · Railway · Render · Fly.io · AWS · GCP (Cloud Run) · Azure (App Service) · Hetzner Cloud · DigitalOcean (App Platform) · VPS (manual) · Coolify (self-host PaaS) · Docker / Kubernetes (self-host) |

### 3.2 Compatibility Check

Run after TP and again in B6. Each hit becomes a grilling question with a recommended fix.

| If the stack has… | Then check / ask |
|---|---|
| Serverless host (Vercel, Netlify, Cloudflare) + long-running backend (Laravel, Django, Go, Rust, NestJS) | Backend needs a separate host (Railway, Fly.io, Render, VPS/Coolify) or a serverless-compatible runtime. Two deploy targets → confirm. |
| Cloudflare Workers + PostgreSQL / MySQL | Needs a connection pooler/driver that works on Workers (e.g. Hyperdrive or a serverless HTTP driver). Otherwise suggest D1. |
| Serverless host + realtime (chat, live updates) | No persistent WebSockets on most serverless functions → use a managed realtime service or a long-running server. |
| Serverless host + SQLite file | Local files don't persist → use Turso or D1. |
| Frontend and backend are the same framework (e.g. Next.js + Next.js) | Single full-stack app. Ask: will other clients (mobile app, third parties) need a public API? If yes, consider a separate API. |
| Frontend is a SPA (React/Vite, Vue) + public pages need SEO | SPA SEO is weak → suggest Next.js / Nuxt / Astro for public pages, or prerendering. |
| BaaS chosen (Supabase / Firebase) + a separate auth library | Avoid two auth systems — confirm which one owns users and sessions. |
| Supabase / Neon / Prisma Postgres chosen as DB | Confirm which extras (auth, storage, realtime) are used, and plan for vendor lock-in. |
| MongoDB / Firestore + strongly relational data (orders, invoices, stock) or multi-document transactions | Flag the mismatch; recommend a relational DB unless there is a reason. |
| ORM language ≠ backend language (e.g. Prisma with Go) | ORM must match: TS → Drizzle/Prisma; Go → GORM/sqlc; Rust → SeaORM/sqlx; PHP → Eloquent; Python → SQLAlchemy/Django ORM. |
| Self-hosted deploy (VPS, Coolify, Docker/K8s) | Ask who handles backups, TLS, monitoring, updates. Kubernetes for a small app → flag as over-engineering. |
| Users mostly in one region (e.g. Indonesia) | Pick a host/DB region close to users (e.g. Singapore/Jakarta) and keep app and DB in the same region. |
| Budget is free/minimal | Check free-tier limits of the chosen host and DB (sleeping instances, connection limits, storage caps). |

---

## 4. Precision rules (checked before writing the PRD)

**Phase Dependency Check** — every violation must be fixed or explicitly accepted in the Decision Log:
- A feature may not be in an earlier phase than the features it needs (`phase(F) >= phase(dependsOn)`).
- A feature that **displays** data must be in the same phase as, or after, the feature that **creates** that data (or a planned seed must exist).
- Features that require login may not precede the auth feature.
- The core value from B1 must be present in Phase 1. If the core value is "clear pricing", prices must be visible in Phase 1.
- The retention trigger from B1 must have a feature that delivers it (e.g. "new designs appear" → newest-first sort / "New" badge / notifications).

**Spec quality rules:**
- Every sub-feature: at least 1 Given/When/Then acceptance criterion.
- Every sub-feature maps to: entities (B5), endpoints (if any), and roles (B2).
- No unmeasured adjectives: "fast" → "p95 < 500 ms", "a lot" → "≤ 5,000 designs".
- Every stack choice has a "Reason" column that refers to a requirement, not taste.
- A feature with no role, no data source, or no link to the B1 job → propose removing it or moving it to Non-goals.

---

## 5. Decision Log (filled during the session)

Log every confirmed decision in a short ADR format:

```
D-07 | Contact Admin uses a WhatsApp deep link, not realtime chat
Context: 1 admin, low chat volume, admin already active on WhatsApp
Decision: "Ask via WhatsApp" button with a prefilled message (design name + code)
Consequences: no WebSocket/chat infrastructure; chat history is not stored in the system
Status: Approved | [ASSUMPTION] if the user skipped
```

When B8 is done, send a **shared-understanding summary** (problem, core value, roles, features per phase, stack, key decisions, assumptions) and ask for confirmation: "Does this match? I'll write the PRD." Do not write the PRD before it is confirmed.

---

## 6. Definition of Ready (required before writing the PRD)

- [ ] Problem statement, core value, first-session job, retention trigger, success metrics
- [ ] Tech preferences recorded (mode + four layers) and Compatibility Check passed
- [ ] Complete role matrix, clear auth method
- [ ] Every feature: goal, role, priority, data source, 2–5 sub-features
- [ ] Every sub-feature: acceptance criteria + entities
- [ ] ERD + state machines for entities with a status
- [ ] Stack with reasons, architecture diagram, folder structure
- [ ] Measurable NFRs
- [ ] Phases pass the Phase Dependency Check
- [ ] Non-goals & Open Questions written down

---

## 7. Output

Produce **two artifacts**:
1. `PRD.md` — the human-readable document.
2. `feature-map.json` — a structured feature schema to render as a feature map (root → phased features → sub-features), turn into tickets, or scaffold from.

When working in a codebase, save to `docs/prd/<slug>/PRD.md` and `docs/prd/<slug>/feature-map.json`. In chat, create them as a document.

### 7.1 PRD.md template

```markdown
# PRD — <Product Name>
Version: 0.1 · Status: Draft · Date: <YYYY-MM-DD> · Owner: <name>

## 1. Summary
<3–4 sentences: who it is for, what problem, core value, Phase 1 scope>

## 2. Problem & Jobs-to-be-Done
- Current situation:
- Primary job (first session):
- Core value:
- Retention trigger:

## 3. Goals, Metrics & Non-goals
| Goal | Metric | Target |
|---|---|---|
Non-goals:
-

## 4. Actors & Role Matrix
| Capability | Guest | Admin | ... |
|---|---|---|---|

## 5. Feature Map
<mermaid diagram: root → feature [Phase N] → sub-feature>
| ID | Feature | Phase | Priority | Role | Depends on |
|---|---|---|---|---|---|

## 6. Feature Specifications
### F-XXX <Feature Name> (Phase N)
- Goal:
- Roles:
- Sub-features:
  - F-XXX-01 <name>
    - AC1: Given … When … Then …
    - Entities: … · Endpoints: …
- Business rules:
- Edge cases:
- State machine (if any):

## 7. Data Model
<mermaid erDiagram>
| Entity | Key fields | Owner | Lifecycle |
|---|---|---|---|

## 8. API Surface
| Method | Path | Role | Sub-feature |
|---|---|---|---|

## 9. Architecture & Stack
<mermaid architecture diagram>
Tech preference mode: <ai | user>
| Layer | Choice | Source (user / ai) | Reason (requirement it satisfies) |
|---|---|---|---|
| Frontend | | | |
| Backend | | | |
| Database | | | |
| Deployment | | | |
| ORM / Auth / Storage | | | |
Compatibility Check: ✅ passed / resolved conflicts (see Decision Log)
Folder structure:
<tree>

## 10. Non-functional Requirements
| Category | Requirement | How to verify |
|---|---|---|

## 11. Phase Plan
| Phase | Goal | Features | Definition of done |
|---|---|---|---|
Phase Dependency Check: ✅ passed / list of approved exceptions

## 12. Decision Log
<D-01 … D-NN>

## 13. Assumptions & Open Questions
- [ASSUMPTION] …
- [OPEN] …
```

### 7.2 feature-map.json schema

```json
{
  "project": {
    "name": "Billboard Design Portal",
    "slug": "billboard-design-portal",
    "status": "planning",
    "version": "0.1"
  },
  "phases": [
    { "id": 1, "name": "MVP Catalog & Pricing", "goal": "Village governments can browse designs with prices and contact the admin" }
  ],
  "stack": {
    "mode": "user",
    "frontend": { "choice": "Next.js", "source": "user" },
    "backend": { "choice": "Hono (Bun)", "source": "ai" },
    "database": { "choice": "PostgreSQL", "source": "ai" },
    "deployment": { "choice": "VPS (Coolify)", "source": "ai" },
    "extras": { "orm": "Drizzle", "auth": "better-auth", "storage": "Cloudflare R2" }
  },
  "roles": ["guest", "admin"],
  "features": [
    {
      "id": "F-GAL",
      "name": "Design Gallery",
      "icon": "layout-grid",
      "phase": 1,
      "status": "planned",
      "priority": "must",
      "roles": ["guest"],
      "dependsOn": ["F-MDS", "F-PRC"],
      "subFeatures": [
        {
          "id": "F-GAL-01",
          "name": "Design Catalog",
          "priority": "must",
          "acceptanceCriteria": [
            "Given active designs exist, When a guest opens /designs, Then a grid of designs is shown with thumbnail, name, and starting price"
          ],
          "entities": ["Design", "DesignPrice"],
          "endpoints": ["GET /api/designs"]
        }
      ]
    }
  ]
}
```

Schema rules:
- `status`: `planned | in_progress | done | dropped`. `priority`: `must | should | could | wont`.
- `icon`: a lucide icon name (e.g. `layout-grid`, `search`, `shopping-cart`, `message-circle`, `log-in`, `folder-cog`, `tag`).
- Stable `id`s: `F-<CODE>` for features, `F-<CODE>-NN` for sub-features. The same sub-feature must use the same ID in PRD.md and the JSON.
- `dependsOn` contains only existing feature IDs; it is the input to the Phase Dependency Check.
- `stack.mode`: `ai | user`. Each layer's `source`: `user | ai | assumption`.

---

## 8. Example: catching precision problems

Input (user draft): Design Gallery = Phase 1, Search = Phase 2, Ordering = Phase 3, Contact Admin = Phase 3, Admin Login / Manage Designs / Set Pricing = Phase 4. Core value: "clear pricing". Retention: "new designs appear".

Findings to raise as grilling questions:
1. **Dependency inversion:** Gallery (Phase 1) displays designs that can only be uploaded via Manage Designs (Phase 4), and Manage Designs needs Admin Login (Phase 4). → Recommendation: Admin Login + Manage Designs + Set Pricing (minimal) move to Phase 1.
2. **Core value arrives too late:** "Clear pricing" is the main reason users come, but prices can't be set until Phase 4. → Show prices in the catalog from Phase 1; Price Change History can come later.
3. **Primary channel arrives too late:** Ordering through "the portal person" is the current behavior, but Contact Admin only lands in Phase 3. → WhatsApp deep link in Phase 1 (cheap), order form in a later phase.
4. **Ambiguous feature:** "Live Chat" vs. "Admin Contact Info" — build realtime chat or integrate WhatsApp? Ask about chat volume and number of admins.
5. **Retention without a feature:** "New designs appear" has no mechanism. → Newest-first sort + "New" badge (Phase 1), WhatsApp notifications to customers (later phase, requires contact consent).
6. **Buyer context:** The buyer is a village government → ask about accountability documents (receipts/invoices/price quotations), village identity at order time, and whether ordering requires an account or just guest + WhatsApp number.
7. **Over-engineering:** "Forgot Password" for a single admin account → ask how many admins; if one, a CLI/seed reset is enough for Phase 1.

Tech preferences in the same example — user chose "Choose myself", picked only Frontend = Next.js (1/4), and later says "Laravel" for Backend and "Vercel" for Deployment:
8. **Compatibility conflict:** Laravel is a long-running PHP app and doesn't fit Vercel's serverless model. → Recommendation: Next.js on Vercel + Laravel API on a VPS/Coolify, or drop Laravel and use Next.js Route Handlers (one app, one deploy target). Ask which the user prefers.
9. **Remaining layer:** Database left to AI → recommend PostgreSQL (orders and prices are relational), in a region close to Indonesian users, with Eloquent as the ORM if Laravel stays.
