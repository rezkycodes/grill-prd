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

1. **One question per turn.** Never stack questions. Exceptions: (a) the user asks for "batch mode" → at most 4 questions that are all on the current frontier (independent of each other); (b) the four tech-layer questions in TP (§2) may be asked together because they are independent. The AR dimensions are **not** independent — ask them one at a time.
2. **Every question MUST include a recommended answer** and the reason for it. The user can simply reply "ok" to accept.
3. **Follow dependency order**, not template order. Do not *recommend* a stack or an architecture before you know who the users are, the scope, the data, the scale, and the SEO/realtime/offline needs. The user's own stack preferences (TP) are asked early because they are constraints, not recommendations; architecture (AR) is asked after B5 because it must be justified by scope and data.
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

If an interactive multiple-choice tool is available (e.g. `AskUserQuestion`), use it for questions with discrete options: put the recommended option first and label it `(Recommended)`; the user can always type their own answer. Most such tools allow only ~4 options per question, so offer the 3–4 most relevant options from the catalogs (§3.1, §3.3) and let the user type anything else. Use multi-select for design patterns (AR.5). Without such a tool, ask in text with a numbered list.

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

### AR — Architecture (asked after B5, before B6)

Architecture is decided after scope (B3), flows (B4) and data (B5) are known, because each choice must answer a real need: domain complexity, number of deployables, team size, scale. Ask the five dimensions **in this order** — each one depends on the one before it, so ask them one at a time:

| # | Dimension | Question | Depends on |
|---|---|---|---|
| AR.1 | Domain design | How is the domain modelled and split? | B3 features, B4 rules, B5 entities |
| AR.2 | Software architecture | How many deployable units, and how do they talk? | AR.1 boundaries, team size, scale |
| AR.3 | Repository strategy | How is the code organised across repositories? If monorepo, which tooling? | AR.2 deployables, TP frontends/backends, languages |
| AR.4 | Application architecture | How is the code inside each deployable structured? | AR.1, AR.2, chosen frameworks |
| AR.5 | Design patterns | Which patterns solve which concrete problems? | AR.4 plus problems found in B4/B5 |

Before AR.1, ask the mode once (same as TP):

```
❓ [AR.0] Do you already have an architecture in mind, or should I recommend it?
➡️ Recommendation: Let me recommend each dimension from what we have so far — you can override any of them.
Options: (1) Let AI pick  (2) Choose myself
```

- **Let AI pick** → still walk AR.1–AR.5, but present each as a recommendation the user confirms with `ok` (one line per dimension is enough). Record `architecture.mode = "ai"`.
- **Choose myself** → ask each dimension with options from the **Architecture Catalog (§3.3)**. Record `architecture.mode = "user"`.

Rules:
- Every recommendation names the requirement that justifies it (e.g. "modular monolith: one developer, 4 bounded contexts, no independent scaling need").
- **AR.1 Domain design** must produce a list of **modules / bounded contexts**, and every feature from B3 must belong to exactly one of them. A feature that fits none → rethink the boundary or the feature.
- **AR.3 Repository strategy:** if the answer is *monorepo*, immediately ask the follow-up **"Which monorepo tooling?"** with options from §3.3 (workspace manager + optional task runner / build system). Recommend based on languages and package manager already chosen in TP.
- **AR.5 Design patterns** is multi-select. Each pattern must name **where** it applies and **which problem** it solves. A pattern with no concrete problem is dropped.
- Run the **Architecture Fit Check (§3.4)** after AR.5 and raise each hit as a grilling question.
- Choices made here are constraints for B6 (folder structure, deployment topology) — just like TP picks.
- **Exit criteria:** five dimensions recorded with source (`user`, `ai`, `assumption`) and reason; every feature mapped to a module; monorepo tooling chosen if monorepo; no unresolved fit-check hits.

### B6 — Stack & architecture
- Start from the TP answers. Layers the user chose are fixed constraints; layers marked `ai` or skipped are filled from the **Default Stack Profile (§3)**, choosing options compatible with the user's picks.
- Re-test the full stack against the needs from B1–B5: public SEO? realtime? offline? large file volume? hosting budget? who will maintain it? If a user-chosen layer no longer fits a requirement found later (e.g. realtime discovered in B4 on a serverless host), raise it as a grilling question.
- Then ask the supporting choices that depend on the four layers: ORM / query layer (must match the backend language), auth, file storage, cache/queue if needed.
- Re-run the **Compatibility Check (§3.2)** on the complete stack.
- Apply the AR decisions: deployment topology follows the software architecture (AR.2); the folder structure follows the repository strategy and monorepo tooling (AR.3) and the application architecture (AR.4); module folders follow the bounded contexts (AR.1).
- External integrations: payments (QRIS/virtual accounts), notifications (WhatsApp/Telegram/email), storage, maps.
- Before naming a framework version, verify the latest stable version (official docs or an MCP such as Context7). Don't rely on memory.
- **Exit criteria:** every stack component has a reason tied to a requirement; architecture diagram; folder structure consistent with AR.

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

## 3. Default profiles & catalogs (starting recommendations, not assumptions)

**Default Stack Profile** — use as the `➡️ Recommendation` in B6. Always state when to deviate. Adjust this table to your team's stack. (The Default Architecture Profile is in §3.3.)

| Layer | Default | Choose the alternative when |
|---|---|---|
| Runtime | Bun + TypeScript | Team or host requires Node.js → Node.js LTS |
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

| Layer | Purpose | Options |
|---|---|---|
| Frontend | UI & user-facing screens | Next.js · React (Vite) · TanStack Start · React Router 7 / Remix · Astro · Vue.js · Nuxt · Svelte · SvelteKit · Solid / SolidStart · Qwik · Angular · HTMX + Server-rendered · Flutter · React Native · Expo (React Native) · SwiftUI (iOS native) · Jetpack Compose (Android native) · Tauri (desktop) · Electron (desktop) |
| Backend | Logic & API server | Node.js (Express/Fastify) · NestJS · Hono · Elysia (Bun) · Bun runtime · Deno · Python (FastAPI/Django) · Go (Fiber/Echo) · Rust (Axum/Actix) · Laravel (PHP) · Ruby on Rails · Java (Spring Boot) · .NET (ASP.NET Core) · Cloudflare Workers · Edge Functions (Vercel/Netlify) · Convex (BaaS) · Supabase (BaaS) · Firebase (BaaS) · Appwrite (BaaS) · Pocketbase (BaaS) |
| Database | Data storage | PostgreSQL · Neon (serverless Postgres) · Supabase (Postgres) · Prisma Postgres · MySQL · PlanetScale (MySQL) · SQLite · Turso (libSQL) · Cloudflare D1 · MongoDB · Firebase / Firestore · Convex · Redis / Upstash · DynamoDB · CockroachDB · ClickHouse (analytics) · Xata |
| Deployment | Hosting & infrastructure | Vercel · Netlify · Cloudflare Pages / Workers · Railway · Render · Fly.io · Koyeb · Northflank · Deno Deploy · AWS (Amplify/ECS/Lambda) · Google Cloud (Cloud Run) · Azure (App Service) · Hetzner Cloud · DigitalOcean (App Platform) · VPS (manual) · Coolify (self-host PaaS) · Docker / Kubernetes (self-host) |

Implicit answers to accept besides the list:
- **Backend = "same as frontend"** when the frontend is full-stack (Next.js Route Handlers / Server Actions, Nuxt server routes, SvelteKit endpoints, TanStack Start server functions, Astro endpoints). Record it as `"<framework> (full-stack)"`.
- **Frontend = "none"** for API-only or bot/integration products.
- **"Bun runtime"** is a runtime, not a framework → follow up: Hono, Elysia, or plain `Bun.serve`?
- **A BaaS backend usually fixes the database** (Supabase → Supabase Postgres, Firebase → Firestore, Convex → Convex, Pocketbase → embedded SQLite, Appwrite → Appwrite's own). Pre-fill the Database layer and confirm instead of asking from scratch.
- **Several frontends are allowed** (e.g. Next.js for the public web + Expo for mobile + React (Vite) for the admin). Record each with its target (`web`, `admin`, `mobile`, `desktop`).

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
| Mobile frontend (Flutter, React Native, Expo, SwiftUI, Jetpack Compose) | Needs a real API (not Server Actions only); auth must work for mobile (tokens, not cookie-only). The Deployment layer covers the backend only → also ask about app distribution (App Store / Play Store, OTA updates, review lead time). |
| Desktop frontend (Tauri, Electron) | Ask about installers, auto-update, code signing, and offline behaviour. Tauri means Rust in the toolchain. |
| HTMX + Server-rendered | The backend renders HTML (Laravel, Rails, Django, Go, Spring, ASP.NET). A JS full-stack framework on top is redundant → confirm. |
| Backend = Cloudflare Workers or Edge Functions | Deployment is fixed to that platform; check CPU-time limits, no native Node modules, DB reached over HTTP or a pooler. Long jobs → queue or a separate worker. |
| Backend = Deno and Deployment ≠ Deno Deploy (or the reverse) | Confirm the runtime is supported on the chosen host. |
| BaaS backend (Convex, Supabase, Firebase, Appwrite, Pocketbase) + a different Database choice | Usually a contradiction — the BaaS owns the data. Confirm whether a second database is really needed. |
| Pocketbase or SQLite + horizontal scaling / serverless host | Single-node, file-based → needs one persistent server with a volume and backups. |
| DynamoDB / Firestore / MongoDB + reporting or ad-hoc queries | Access patterns must be designed up front; ask about reporting needs. |
| ClickHouse or Redis / Upstash as the only database | These are analytics / cache stores, not a primary OLTP database → add a primary DB. |
| Ruby on Rails, Spring Boot, ASP.NET Core, Django, Laravel on Vercel / Netlify / Deno Deploy | Not a fit for those hosts → container host (Railway, Render, Fly.io, Koyeb, Northflank, Cloud Run, VPS/Coolify). |

### 3.3 Architecture Catalog (options for AR)

Not exhaustive — the user may name any other approach.

**Default Architecture Profile** (the `➡️ Recommendation` when nothing in B1–B5 argues otherwise):

| Dimension | Default | Choose the alternative when |
|---|---|---|
| Domain design | DDD-lite: bounded contexts as modules, rich rules only where B4 found them | Pure CRUD / admin panel → transaction script; complex, evolving rules with domain experts → full DDD |
| Software architecture | Modular monolith | Independent scaling or team ownership per context → microservices; spiky, event-driven workloads → serverless |
| Repository strategy | Single repo for one deployable; monorepo once there are ≥ 2 deployables or shared packages | Separate teams with separate release cycles → polyrepo |
| Monorepo tooling | Bun workspaces (+ Nx when task caching / project graph is needed) | pnpm stack → pnpm workspaces + Turborepo; polyglot → Nx, moon or Bazel |
| Application architecture | Feature-based modules (vertical slices) with a thin layered split inside each: handler → service → repository | Heavy domain + many adapters → hexagonal / clean; framework-centric team (Laravel, Rails) → framework-idiomatic MVC + service classes |
| Design patterns | Repository, Service layer, DTO + schema validation, State machine for status fields | Add others only for a named problem (see AR.5) |

**AR.1 — Domain design**

| Option | Fits when | Watch out |
|---|---|---|
| Transaction script / CRUD | Simple data entry, few rules | Logic scatters as rules grow |
| Anemic model + service layer | Moderate rules, small team, ORM-centric | Services become god classes |
| DDD-lite (bounded contexts as modules, aggregates only where needed) | Several sub-domains, some real business rules | Needs discipline on module boundaries |
| Full DDD (strategic + tactical: bounded contexts, context map, aggregates, value objects, domain events, ubiquitous language) | Complex, changing rules; access to domain experts | Heavy for CRUD products |
| Event storming (workshop technique to discover contexts) | Unclear boundaries, many actors | A technique, not an output — still record the resulting contexts |

**AR.2 — Software architecture**

| Option | Fits when | Watch out |
|---|---|---|
| Monolith | One small team, one product, early stage | Boundaries erode without module rules |
| Modular monolith | One deployable but clear modules; the usual default | Enforce module boundaries (lint rules, package boundaries) |
| Microservices | Independent teams, independent scaling/release per context | Distributed data, network failures, ops cost |
| Serverless / functions | Spiky or event-driven workloads, low ops | Cold starts, time limits, vendor lock-in |
| Event-driven (broker / queue between parts) | Async workflows, integrations, fan-out | Eventual consistency, debugging |
| BaaS-centric | Backend is mostly a BaaS (Supabase, Firebase, Convex) | Business rules in functions/policies; lock-in |
| Micro-frontends | Several teams own separate UI areas | Rarely worth it for one team |

**AR.3 — Repository strategy**

| Option | Fits when | Watch out |
|---|---|---|
| Single repo (one app) | One deployable | Re-evaluate when a second app appears |
| Monorepo | Several apps/packages sharing contracts, types, UI | Needs tooling for tasks, caching, boundaries |
| Polyrepo (one repo per app/service) | Separate teams, separate release cycles | Shared contracts need versioned packages |
| Hybrid | Monorepo for the product + separate repos for infra or public SDKs | Two workflows to maintain |

Avoid git submodules as the sharing mechanism unless the user insists — they make every clone and update error-prone.

**Monorepo tooling** (asked only when AR.3 = monorepo). A monorepo usually needs a **workspace manager** (links packages, one lockfile) and optionally a **task runner / build system** (task graph, caching, affected-only runs). Verify current versions and support before recommending.

| Tooling | Type | Fits when |
|---|---|---|
| Bun workspaces | Workspace manager (JS/TS) | Bun is the runtime/package manager; simple setups |
| pnpm workspaces | Workspace manager (JS/TS) | Strict dependency isolation, fast installs |
| npm workspaces | Workspace manager (JS/TS) | No extra tooling wanted |
| Yarn workspaces | Workspace manager (JS/TS) | Team already on Yarn |
| Nx | Task runner + build system + generators, project graph, module-boundary rules | Many apps/libs, caching, enforced boundaries; works on top of any workspace manager; polyglot via plugins |
| Turborepo | Task runner + caching (JS/TS focused) | JS/TS monorepo that wants caching with minimal config |
| moon (moonrepo) | Task runner + toolchain manager, polyglot | Mixed languages, pinned toolchains |
| Lerna (powered by Nx) | Versioning and publishing of packages | Publishing many npm packages |
| Rush | Large JS/TS monorepos with strict policies | Big organisations |
| Bazel / Buck2 / Pants | Hermetic build systems, polyglot | Very large or multi-language codebases; steep learning curve |
| Cargo workspaces | Language-native (Rust) | Rust crates |
| Go workspaces (`go.work`) | Language-native (Go) | Several Go modules |
| uv workspaces | Language-native (Python) | Several Python packages |
| Gradle multi-project / Maven multi-module | Language-native (JVM) | Spring Boot services |
| .NET solution (multi-project) | Language-native (.NET) | ASP.NET Core services |
| Composer path repositories | Language-native (PHP) | Shared Laravel packages |

Typical pairings: `Bun workspaces + Nx`, `pnpm workspaces + Turborepo`, `pnpm workspaces + Nx`, `npm workspaces + Turborepo`, `Nx` or `moon` alone for polyglot repos, language-native workspaces inside an Nx/moon repo for mixed stacks.

**AR.4 — Application architecture**

| Option | Fits when | Watch out |
|---|---|---|
| Layered (presentation → service → data access) | Straightforward apps | Changes cut across all layers |
| MVC / framework-idiomatic (Laravel, Rails, Django, NestJS modules) | Team follows the framework's conventions | Fat controllers/models without a service layer |
| Feature-based / vertical slice | Features change independently; pairs well with a modular monolith | Shared code needs a clear home |
| Clean architecture | Long-lived core logic, many delivery mechanisms | Boilerplate for simple CRUD |
| Hexagonal (ports & adapters) | Many external integrations to swap or test in isolation | Same as above |
| Onion architecture | Similar goals to clean/hexagonal | Pick one vocabulary, not all three |
| CQRS (separate read and write models) | Reads and writes differ strongly in shape or load | Two models to keep consistent |
| Feature-Sliced Design (frontend) | Large frontends with many features | Learning curve |
| Atomic design / component-driven (frontend UI) | Design-system-heavy UIs | Structures UI only, not logic |

A product can mix one backend option and one frontend option (e.g. vertical slice backend + Feature-Sliced Design frontend). Record each per deployable.

**AR.5 — Design patterns** (multi-select; each needs *where* + *problem solved*)

| Category | Patterns |
|---|---|
| Data access | Repository · Unit of Work · Data Mapper · Active Record (framework default) · Query Object · Specification |
| Application logic | Service layer · Use case / interactor · Command / Command handler · Mediator · Pipeline / Middleware · Result / Either for errors |
| Domain | Aggregate · Value object · Domain event · Domain service · Factory · Policy |
| Integration & reliability | Adapter · Facade · Anti-corruption layer · Gateway · Outbox · Idempotency key · Retry with backoff · Circuit breaker · Saga / process manager |
| Behaviour | Strategy · State machine · Observer / Pub-Sub · Template method · Chain of responsibility |
| Structure | Dependency injection · Plugin / registry · Builder · Singleton (only for true process-wide resources) |
| Read side & scale | CQRS · Event sourcing · Materialized view · Cache-aside |
| API & contracts | DTO + schema validation · BFF (backend for frontend) · API gateway · Shared contracts package |

### 3.4 Architecture Fit Check

Run after AR.5 and again in B6. Each hit becomes a grilling question with a recommended fix.

| If the architecture has… | Then check / ask |
|---|---|
| Microservices + 1–3 developers or no independent scaling need | Flag over-engineering → recommend a modular monolith with clean module boundaries (can be split later). |
| Microservices sharing one database | Anti-pattern (distributed monolith) → one database or schema per service, or stay modular monolith. |
| Full DDD or event sourcing for a CRUD-heavy product | Flag over-engineering → DDD-lite; event sourcing only with a real audit/replay requirement. |
| CQRS without a read/write asymmetry | Drop it, or limit it to the specific read model that needs it. |
| Polyrepo + shared contracts/types | Versioned packages and release coordination needed → consider a monorepo. |
| Monorepo with mixed languages + a JS-only task runner | Use polyglot tooling (Nx, moon, Bazel) or language-native workspaces orchestrated by one runner. |
| Monorepo with only one deployable and no shared packages | Tooling overhead without benefit → single repo until a second app appears. |
| Package manager chosen in TP ≠ workspace manager | Must match (e.g. Bun runtime + pnpm workspaces → confirm or switch to Bun workspaces). |
| Hexagonal/clean architecture on a framework-centric stack (Laravel, Rails, Django) | Fighting the framework → confirm the team accepts the extra layers, or use framework-idiomatic + service layer. |
| Serverless architecture + long-running jobs or stateful connections | Needs a queue/worker or a long-running service. |
| Event-driven or outbox without a broker/queue in the stack | Add the broker/queue to the stack (B6) or drop the pattern. |
| A feature not mapped to any module/bounded context | Fix the boundary or the feature before writing the PRD. |
| Repository pattern on top of an ORM that already is one (e.g. Eloquent, Active Record) for simple CRUD | Ask whether the abstraction pays off (testing, multiple data sources) or is ceremony. |

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
- Every feature belongs to exactly one module / bounded context (AR.1).
- Every design pattern names where it applies and the problem it solves (AR.5).
- The folder structure in the PRD matches the repository strategy, monorepo tooling, and application architecture (AR.3, AR.4).
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

When B8 is done, send a **shared-understanding summary** (problem, core value, roles, features per phase, stack, architecture, key decisions, assumptions) and ask for confirmation: "Does this match? I'll write the PRD." Do not write the PRD before it is confirmed.

---

## 6. Definition of Ready (required before writing the PRD)

- [ ] Problem statement, core value, first-session job, retention trigger, success metrics
- [ ] Tech preferences recorded (mode + four layers) and Compatibility Check passed
- [ ] Complete role matrix, clear auth method
- [ ] Every feature: goal, role, priority, data source, 2–5 sub-features
- [ ] Every sub-feature: acceptance criteria + entities
- [ ] ERD + state machines for entities with a status
- [ ] Architecture recorded (domain design, software architecture, repository strategy + monorepo tooling if any, application architecture, design patterns) and Architecture Fit Check passed
- [ ] Every feature mapped to a module / bounded context
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
| ID | Feature | Module | Phase | Priority | Role | Depends on |
|---|---|---|---|---|---|---|

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

### 9.1 Architecture
Architecture mode: <ai | user>
| Dimension | Choice | Source (user / ai) | Reason (requirement it satisfies) |
|---|---|---|---|
| Domain design | | | |
| Software architecture | | | |
| Repository strategy | | | |
| Monorepo tooling (if monorepo) | | | |
| Application architecture (per deployable) | | | |

Modules / bounded contexts:
| Module | Responsibility | Owns entities | Features |
|---|---|---|---|
<mermaid context map, if more than one module>

Design patterns:
| Pattern | Where | Problem it solves |
|---|---|---|
Architecture Fit Check: ✅ passed / resolved conflicts (see Decision Log)

### 9.2 Stack
Tech preference mode: <ai | user>
| Layer | Choice | Source (user / ai) | Reason (requirement it satisfies) |
|---|---|---|---|
| Frontend | | | |
| Backend | | | |
| Database | | | |
| Deployment | | | |
| ORM / Auth / Storage | | | |
Compatibility Check: ✅ passed / resolved conflicts (see Decision Log)

### 9.3 Folder structure
<tree, consistent with 9.1>

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
  "architecture": {
    "mode": "user",
    "domainDesign": { "choice": "DDD-lite", "source": "ai", "reason": "Four sub-domains, real rules only in pricing and ordering" },
    "softwareArchitecture": { "choice": "Modular monolith", "source": "ai", "reason": "One developer, no independent scaling need" },
    "repositoryStrategy": { "choice": "Monorepo", "tooling": "Bun workspaces + Nx", "source": "user", "reason": "Public web, admin and API share contracts" },
    "applicationArchitecture": [
      { "deployable": "api", "choice": "Vertical slice (handler → service → repository)", "source": "ai" },
      { "deployable": "web", "choice": "Feature-based folders", "source": "ai" }
    ],
    "modules": [
      { "id": "catalog", "name": "Catalog", "owns": ["Design", "Category"] },
      { "id": "pricing", "name": "Pricing", "owns": ["DesignPrice", "PriceHistory"] },
      { "id": "ordering", "name": "Ordering", "owns": ["Order"] },
      { "id": "identity", "name": "Identity", "owns": ["AdminUser"] }
    ],
    "designPatterns": [
      { "pattern": "Repository", "where": "Each module's data access", "problem": "Keep Drizzle queries out of services and testable" },
      { "pattern": "State machine", "where": "Order.status", "problem": "Only valid status transitions, enforced in one place" }
    ]
  },
  "roles": ["guest", "admin"],
  "features": [
    {
      "id": "F-GAL",
      "name": "Design Gallery",
      "icon": "layout-grid",
      "module": "catalog",
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
- `architecture.mode`: `ai | user` (`user` as soon as the user picked at least one dimension, same as `stack.mode`). Each dimension's `source`: `user | ai | assumption`. `repositoryStrategy.tooling` is set only when `choice` is `Monorepo` (or `Hybrid` with a monorepo part).
- `applicationArchitecture` has one entry per deployable.
- Every feature's `module` must match an `architecture.modules[].id`.

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

Architecture in the same example — user chose "Choose myself" in AR and answered: microservices, full DDD, monorepo:
10. **Over-engineering:** One developer, four small modules, no independent scaling need → recommend a modular monolith with DDD-lite; keep the module boundaries so a context can be split out later.
11. **Monorepo follow-up:** "Monorepo" alone is not an answer → ask for the tooling. With Bun as the runtime and Next.js + an API sharing Zod contracts, recommend `Bun workspaces + Nx`; offer `pnpm workspaces + Turborepo` if the team prefers pnpm.
12. **Unmapped feature:** "Contact Admin" fits no module → put it in Ordering (it starts an order conversation) or make it a thin integration module; ask which.
