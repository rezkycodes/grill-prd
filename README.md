# Grill PRD

A Claude Code skill that interviews you relentlessly, one question at a time with a recommended answer for each, until you reach a shared understanding of the product. Then it writes a **precise PRD**: stack, architecture, data model, and a phased feature map (feature → sub-feature) with testable acceptance criteria.

Use it when you want to write, refine, or validate a PRD, or plan a new app or feature.

> Adapted from the `grill-me` skill in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).

---

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Workflow](#workflow)
- [Design tree](#design-tree)
- [Default stack and layer catalog](#default-stack-and-layer-catalog)
- [Architecture catalog](#architecture-catalog)
- [Precision rules](#precision-rules)
- [Output](#output)
- [Repository structure](#repository-structure)
- [FAQ](#faq)
- [License and credits](#license-and-credits)

---

## Features

- **Progressive grilling**: questions come one at a time, ordered by dependency rather than by template.
- **A recommendation on every question**: reply `ok` to accept it.
- **Automatic stack compatibility check**: flags conflicting choices (for example, Laravel on Vercel) and proposes fixes.
- **Architecture decisions**: domain design, software architecture, repository strategy (with monorepo tooling such as Bun workspaces, pnpm + Turborepo, or Nx), application architecture, and design patterns, each justified by a requirement and checked for over-engineering.
- **Phase dependency check**: a feature never sits in an earlier phase than a feature it depends on.
- **Decision Log** in a short ADR format, so every decision is recorded with its reason.
- **Two outputs**: `PRD.md` for humans and `feature-map.json` for rendering, ticket generation, or scaffolding.
- **`Let AI pick` mode**: if you have no stack or architecture yet, the skill chooses defaults that fit your requirements and explains why.

## Installation

Pick **one** route below. The plugin is a managed, read-only bundle. The `npx skills` route copies files you own and edit. Installing both gives you the skill twice.

### Option 1: Claude Code plugin (recommended, updates itself)

Requires Claude Code 2.1.275 or later. Inside Claude Code, run:

```
/plugin install grill-prd --marketplace rezkycodes/grill-prd
```

The plugin is read from this repo's own marketplace (`.claude-plugin/marketplace.json`). It updates when a new version is released, because the Release workflow bumps `version` in `.claude-plugin/plugin.json`.

### Option 2: `npx skills` (copies editable files, manual updates)

The [`skills`](https://www.npmjs.com/package/skills) CLI copies the skill from GitHub into your project. Use this if you want to edit the skill, or if you use a harness other than Claude Code's plugin system.

**Project-level** (run from your project root):

```bash
npx skills@latest add rezkycodes/grill-prd -a claude-code
```

**Global** (for every project, in your user directory):

```bash
npx skills@latest add rezkycodes/grill-prd -a claude-code -g
```

Update an installed copy, and check what is installed:

```bash
npx skills@latest update grill-prd
npx skills@latest list
```

Remove it:

```bash
npx skills@latest remove grill-prd -a claude-code
```

Useful options for `add`:

| Option | Purpose |
|---|---|
| `-a, --agent claude-code` | Install only for Claude Code |
| `-g, --global` | Install to your user directory instead of the project |
| `-s, --skill grill-prd` | Select the skill by name (needed only if the repo has several) |
| `-y, --yes` | Skip confirmation prompts |
| `-l, --list` | List the skills in the repo without installing |

To see what the repo offers before installing:

```bash
npx skills@latest add rezkycodes/grill-prd --list
```

Restart Claude Code, or open a new session, after installing so the skill is picked up.

**Project-level** (only the current project, run from the project root):

```bash
npx skills add rezkycodes/grill-prd -a claude-code
```

**Global** (available in every project, for your user):

```bash
npx skills add rezkycodes/grill-prd -a claude-code -g
```

Useful options:

| Option | Purpose |
|---|---|
| `-a, --agent claude-code` | Install only for Claude Code |
| `-g, --global` | Install to your user directory instead of the project |
| `-s, --skill grill-prd` | Select the skill by name (needed only if the repo has several) |
| `-y, --yes` | Skip confirmation prompts |
| `-l, --list` | List the skills in the repo without installing |

Check what is installed, and remove it when you no longer need it:

```bash
npx skills list
npx skills remove grill-prd -a claude-code
```

Restart Claude Code (or open a new session) after installing so the skill is picked up.

### Option 3: Antigravity IDE and `agy` CLI

Antigravity reads skills from `.agents/skills/`. Install with the `antigravity` agent for the IDE, the `antigravity-cli` agent for `agy`, or both:

**Project-level** (run from your project root):

```bash
npx skills@latest add rezkycodes/grill-prd -a antigravity antigravity-cli
```

**Global** (for every project, in your user directory):

```bash
npx skills@latest add rezkycodes/grill-prd -a antigravity antigravity-cli -g
```

Update and remove work the same way as in Option 2:

```bash
npx skills@latest update grill-prd
npx skills@latest remove grill-prd -a antigravity antigravity-cli
```

Project installs go to `.agents/skills/grill-prd/`. The global paths are `~/.gemini/antigravity/skills/` (IDE) and `~/.gemini/antigravity-cli/skills/` (`agy`). Restart Antigravity or start a new `agy` session after installing.

### Option 4: Manual copy

The skill is a single file, [`skills/productivity/grill-prd/SKILL.md`](./skills/productivity/grill-prd/SKILL.md).

```bash
# Global
mkdir -p ~/.claude/skills/grill-prd
cp skills/productivity/grill-prd/SKILL.md ~/.claude/skills/grill-prd/SKILL.md

# Project-level
mkdir -p .claude/skills/grill-prd
cp skills/productivity/grill-prd/SKILL.md .claude/skills/grill-prd/SKILL.md
```

Keep the frontmatter at the top of `SKILL.md`. Claude Code uses `name` and `description` to decide when to invoke the skill:

```yaml
---
name: grill-prd
description: Grill the user relentlessly, ... Use when the user wants to write, refine, or validate a PRD or plan a new app/feature.
---
```

## Usage

Invoke the skill explicitly, or just describe what you need. Example triggers:

```
/grill-prd
```

```
I want to build a billboard design catalog for village governments. Grill me and write the PRD.
```

```
Validate my PRD at docs/prd/online-shop/PRD.md
```

```
Plan a new feature: a futsal field booking system.
```

During the session, questions look like this:

```
❓ [B3.2] Who populates the design catalog for the first time?
Why it matters: Design Gallery (Phase 1) is empty without a data source.
➡️ Recommendation: Admins upload through the Manage Designs panel, so Manage Designs + Admin Login move to Phase 1.
Alternatives: (a) manual seed via script in Phase 1, panel later; (b) import from a Google Drive folder.
```

The code `[B3.2]` means branch B3, question 2. Whenever the skill switches branches it shows progress, for example `Branches done: B1 ✅ TP ✅ B2 ✅ | Now: B3`.

If your Claude Code has an interactive multiple-choice tool, questions with discrete options appear as choices. You can always type your own answer.

### Commands during a session

| You type | Effect |
|---|---|
| `ok` | Accept the recommendation |
| `batch mode` | Allow up to 4 independent questions at once |
| `skip` | Fill the answer with the recommendation, mark it `[ASSUMPTION]`, and add it to Open Questions |
| `enough, write the PRD` | Stop grilling and write the PRD now |
| `Let AI pick` | Hand one stack layer or architecture dimension to the skill |

## Workflow

```
B1 Problem & users ─► TP Tech preferences ─► B2 Actors & access
                                                   │
   ┌───────────────────────────────────────────────┘
   ▼
B3 Scope & feature map ─► B4 Flows & business rules ─► B5 Data model
                                                   │
   ┌───────────────────────────────────────────────┘
   ▼
AR Architecture ─► B6 Stack & architecture
                                                   │
                                                   ▼
                       B7 NFRs ─► B8 Release phases & dependency validation
                                                   │
                                                   ▼
                     Shared-understanding summary ─► your confirmation
                                                   │
                                                   ▼
                                  Definition of Ready met
                                                   │
                                                   ▼
                              Write PRD.md + feature-map.json
```

The skill does not write the PRD until you confirm the shared-understanding summary.

## Design tree

Each branch is complete when its **exit criteria** are met.

| Branch | What is explored | Exit criteria |
|---|---|---|
| **B1 — Problem & users** | Primary user, what they do today, one core value, retention trigger, buyer vs. user | Problem statement, 1 core value, 1 first-session job, 1 retention trigger, success metrics |
| **TP — Tech preferences** | `AI pick` or choose yourself; then frontend, backend, database, deployment | Mode set; each layer has a source (`user`, `ai`, or `assumption`); no compatibility conflicts |
| **B2 — Actors & access** | Roles (guest, user, admin, …), role × capability matrix, auth method | Complete role matrix, auth chosen, no feature without a role |
| **B3 — Scope & feature map** | Features derived from the B1 job, MoSCoW priorities, non-goals, data source for each feature | Every feature has a goal, role, sub-features, priority; every piece of data has a source |
| **B4 — Flows & business rules** | Happy path, edge cases (empty data, payment failure, duplicates, cancellation, expiry), state machines, pricing rules | Every sub-feature has Given/When/Then acceptance criteria; every status has transitions and triggers |
| **B5 — Data model** | Entities, relations, cardinality, owners, soft vs. hard delete, audit trail, files and media, personal data | Final ERD; every sub-feature maps to the entities it reads or writes |
| **AR — Architecture** | `AI pick` or choose yourself; then, in order: domain design, software architecture, repository strategy (+ monorepo tooling), application architecture, design patterns | Five dimensions recorded with source and reason; every feature mapped to a module; monorepo tooling chosen if monorepo; no fit-check conflicts |
| **B6 — Stack & architecture** | Unchosen layers, ORM, auth, storage, external integrations; applies the AR decisions to deployment and folder structure | Every component has a reason tied to a requirement; architecture diagram; folder structure consistent with AR |
| **B7 — NFRs** | Performance (p95), scale, availability, security, observability, deployment, cost estimate | Every NFR has a number or a verifiable rule |
| **B8 — Release phases** | Grouping features into phases; Phase 1 must be an end-to-end vertical slice | No dependency violations; each phase has a goal and a definition of done |

## Default stack and layer catalog

### Default stack (starting recommendation)

| Layer | Default | Choose an alternative when |
|---|---|---|
| Runtime | Bun + TypeScript | Team or host requires Node.js → Node.js LTS |
| API | Hono (Bun / Cloudflare Workers) | Bun-only and need end-to-end types → ElysiaJS; very high throughput → Go Fiber; PHP team or heavy admin CRUD → Laravel |
| Public web | Next.js App Router (SSR/SSG for SEO) | No SEO needed → React + Vite or Vue |
| Admin dashboard | React + Vite or Vue | Very simple admin → protected routes in the same app |
| UI | shadcn/ui + Tailwind CSS | — |
| Validation & contracts | Zod, shared `contracts` package for FE and BE | — |
| Database | PostgreSQL + Drizzle or Prisma | All-in on Workers → Cloudflare D1 |
| Auth | better-auth | Institutional SSO → OAuth/OIDC |
| Files | Cloudflare R2 or S3-compatible storage | — |
| Notifications | WhatsApp / Telegram Bot / email | — |
| Deploy | Docker + VPS, or Cloudflare | — |

### Layer catalog (options for TP)

| Layer | Purpose | Options |
|---|---|---|
| Frontend | UI & user-facing screens | Next.js · React (Vite) · TanStack Start · React Router 7 / Remix · Astro · Vue.js · Nuxt · Svelte · SvelteKit · Solid / SolidStart · Qwik · Angular · HTMX + Server-rendered · Flutter · React Native · Expo (React Native) · SwiftUI (iOS native) · Jetpack Compose (Android native) · Tauri (desktop) · Electron (desktop) |
| Backend | Logic & API server | Node.js (Express/Fastify) · NestJS · Hono · Elysia (Bun) · Bun runtime · Deno · Python (FastAPI/Django) · Go (Fiber/Echo) · Rust (Axum/Actix) · Laravel (PHP) · Ruby on Rails · Java (Spring Boot) · .NET (ASP.NET Core) · Cloudflare Workers · Edge Functions (Vercel/Netlify) · Convex (BaaS) · Supabase (BaaS) · Firebase (BaaS) · Appwrite (BaaS) · Pocketbase (BaaS) |
| Database | Data storage | PostgreSQL · Neon (serverless Postgres) · Supabase (Postgres) · Prisma Postgres · MySQL · PlanetScale (MySQL) · SQLite · Turso (libSQL) · Cloudflare D1 · MongoDB · Firebase / Firestore · Convex · Redis / Upstash · DynamoDB · CockroachDB · ClickHouse (analytics) · Xata |
| Deployment | Hosting & infrastructure | Vercel · Netlify · Cloudflare Pages / Workers · Railway · Render · Fly.io · Koyeb · Northflank · Deno Deploy · AWS (Amplify/ECS/Lambda) · Google Cloud (Cloud Run) · Azure (App Service) · Hetzner Cloud · DigitalOcean (App Platform) · VPS (manual) · Coolify (self-host PaaS) · Docker / Kubernetes (self-host) |

The catalog is not exhaustive. You can type any other technology, and the skill will verify that it is still maintained before recommending it. It also accepts "same as frontend" for full-stack frameworks, "none" for API-only products, several frontends at once (web, admin, mobile, desktop), and pre-fills the database when you pick a BaaS backend.

### Compatibility checks

The skill runs these checks after TP and again in B6. Examples:

| Combination | What is checked |
|---|---|
| Serverless host (Vercel, Netlify, Cloudflare) + long-running backend (Laravel, Django, Go, Rust, NestJS) | Needs a separate host, or a serverless-compatible runtime |
| Cloudflare Workers + PostgreSQL / MySQL | Needs a driver or pooler that works on Workers (e.g., Hyperdrive), or consider D1 |
| Serverless + realtime (chat, live updates) | Persistent WebSockets don't fit; use a managed realtime service or a long-running server |
| Serverless + SQLite file | Local files don't persist; use Turso or D1 |
| BaaS (Supabase / Firebase) + a separate auth library | Two auth systems; decide which one owns users and sessions |
| MongoDB / Firestore + relational data (orders, invoices, stock) | Flag the mismatch; recommend a relational database |
| ORM language ≠ backend language | Match them: TS → Drizzle/Prisma; Go → GORM/sqlc; Rust → SeaORM/sqlx; PHP → Eloquent; Python → SQLAlchemy/Django ORM |
| Self-hosted (VPS, Coolify, Docker/K8s) | Who handles backups, TLS, monitoring, updates? Kubernetes for a small app is flagged as over-engineering |
| Users concentrated in one region | Pick host and DB regions close to users; keep the app and DB in the same region |
| Free or minimal budget | Check free-tier limits (sleeping instances, connection limits, storage caps) |
| Mobile frontend (Flutter, React Native, Expo, SwiftUI, Jetpack Compose) | Needs a real API and token-based auth; app-store distribution is asked separately |
| HTMX + Server-rendered | The backend renders HTML; a JS full-stack framework on top is redundant |
| Backend = Cloudflare Workers or Edge Functions | Deployment is fixed to that platform; CPU-time limits and HTTP database access |
| BaaS backend + a different database | Usually a contradiction, because the BaaS owns the data |
| ClickHouse or Redis / Upstash as the only database | Analytics or cache stores, not a primary database |

## Architecture catalog

Asked in branch **AR**, after the data model (B5) and before the stack (B6), because each choice must be justified by scope, data, team size and scale. The five dimensions depend on each other, so they are asked one at a time in this order.

| # | Dimension | Options (abridged) |
|---|---|---|
| AR.1 | Domain design | Transaction script / CRUD · Anemic model + service layer · DDD-lite (bounded contexts as modules) · Full DDD (strategic + tactical) · Event storming to discover contexts |
| AR.2 | Software architecture | Monolith · Modular monolith · Microservices · Serverless / functions · Event-driven · BaaS-centric · Micro-frontends |
| AR.3 | Repository strategy | Single repo · Monorepo · Polyrepo · Hybrid |
| AR.4 | Application architecture | Layered · MVC / framework-idiomatic · Feature-based / vertical slice · Clean · Hexagonal (ports & adapters) · Onion · CQRS · Feature-Sliced Design (frontend) · Atomic design (frontend UI) |
| AR.5 | Design patterns (multi-select) | Repository · Unit of Work · Service layer · Use case · Command handler · Aggregate · Value object · Domain event · Adapter · Anti-corruption layer · Outbox · Idempotency key · Saga · Strategy · State machine · Pub-Sub · Dependency injection · CQRS · Event sourcing · DTO + schema validation · BFF · … |

### Monorepo tooling

When you choose **Monorepo** in AR.3, the skill asks which tooling. A monorepo usually needs a **workspace manager** and optionally a **task runner / build system**.

| Tooling | Type |
|---|---|
| Bun workspaces · pnpm workspaces · npm workspaces · Yarn workspaces | Workspace manager (JS/TS) |
| Nx | Task runner + build system, project graph, module-boundary rules; works on top of any workspace manager; polyglot via plugins |
| Turborepo | Task runner + caching (JS/TS focused) |
| moon (moonrepo) | Polyglot task runner + toolchain manager |
| Lerna (powered by Nx) | Package versioning and publishing |
| Rush | Large JS/TS monorepos with strict policies |
| Bazel · Buck2 · Pants | Hermetic, polyglot build systems |
| Cargo workspaces · Go workspaces (`go.work`) · uv workspaces · Gradle / Maven multi-module · .NET solution · Composer path repositories | Language-native workspaces |

Typical pairings: `Bun workspaces + Nx`, `pnpm workspaces + Turborepo`, `pnpm workspaces + Nx`, `npm workspaces + Turborepo`, and Nx or moon for polyglot repos.

### Architecture fit checks

| Combination | What is checked |
|---|---|
| Microservices + 1–3 developers or no independent scaling need | Flagged as over-engineering; a modular monolith is recommended |
| Microservices sharing one database | Distributed monolith; one database per service, or stay modular |
| Full DDD or event sourcing for a CRUD-heavy product | Flagged as over-engineering |
| Polyrepo + shared contracts | Versioned packages needed; a monorepo is suggested |
| Monorepo with mixed languages + a JS-only task runner | Use Nx, moon, Bazel, or language-native workspaces |
| Monorepo with one deployable and no shared packages | Single repo until a second app appears |
| Runtime's package manager ≠ workspace manager | Must match (for example Bun runtime + Bun workspaces) |
| Event-driven or outbox without a queue/broker in the stack | Add one in B6, or drop the pattern |
| A feature not mapped to any module | Fix the boundary or the feature before the PRD is written |

## Precision rules

Before the PRD is written, the skill checks:

**Phase dependency check**
- A feature may not sit in an earlier phase than the features it depends on.
- A feature that **displays** data must be in the same phase as, or a later phase than, the feature that **creates** that data (or a planned seed must exist).
- Features that require login may not precede the auth feature.
- The core value from B1 must be present in Phase 1.
- The retention trigger from B1 must have a feature that delivers it.

**Spec quality**
- Every sub-feature has at least one Given/When/Then acceptance criterion.
- Every sub-feature maps to entities (B5), endpoints (if any), and roles (B2).
- No unmeasured adjectives: "fast" → `p95 < 500 ms`; "a lot" → `≤ 5,000 designs`.
- Every stack choice has a "Reason" that refers to a requirement, not taste.
- Every feature belongs to exactly one module / bounded context.
- Every design pattern names where it applies and the problem it solves.
- A feature with no role, no data source, or no link to the B1 job is proposed for removal or moved to Non-goals.

## Output

Two artifacts are produced:

1. **`PRD.md`**: the full document, with 13 sections (summary, problem and JTBD, goals and metrics, actors and role matrix, feature map, feature specifications, data model, API surface, architecture (domain, software, repository, application, patterns) and stack, NFRs, phase plan, decision log, assumptions and open questions).
2. **`feature-map.json`**: a structured schema for rendering a feature map, turning features into tickets, or scaffolding.

Inside a codebase they are saved to:

```
docs/prd/<slug>/PRD.md
docs/prd/<slug>/feature-map.json
```

Outside a codebase, both are delivered as documents in the chat.

### Example `feature-map.json` (abridged)

```json
{
  "project": { "name": "Billboard Design Portal", "slug": "billboard-design-portal", "status": "planning", "version": "0.1" },
  "phases": [
    { "id": 1, "name": "MVP Catalog & Pricing", "goal": "Village governments can browse designs with prices and contact the admin" }
  ],
  "stack": {
    "mode": "user",
    "frontend": { "choice": "Next.js", "source": "user" },
    "backend": { "choice": "Hono (Bun)", "source": "ai" },
    "database": { "choice": "PostgreSQL", "source": "ai" },
    "deployment": { "choice": "VPS (Coolify)", "source": "ai" }
  },
  "architecture": {
    "mode": "user",
    "domainDesign": { "choice": "DDD-lite", "source": "ai" },
    "softwareArchitecture": { "choice": "Modular monolith", "source": "ai" },
    "repositoryStrategy": { "choice": "Monorepo", "tooling": "Bun workspaces + Nx", "source": "user" },
    "applicationArchitecture": [
      { "deployable": "api", "choice": "Vertical slice (handler → service → repository)", "source": "ai" }
    ],
    "modules": [
      { "id": "catalog", "name": "Catalog", "owns": ["Design", "Category"] },
      { "id": "pricing", "name": "Pricing", "owns": ["DesignPrice", "PriceHistory"] }
    ],
    "designPatterns": [
      { "pattern": "State machine", "where": "Order.status", "problem": "Only valid status transitions" }
    ]
  },
  "roles": ["guest", "admin"],
  "features": [
    {
      "id": "F-GAL",
      "name": "Design Gallery",
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
- `status`: `planned | in_progress | done | dropped`
- `priority`: `must | should | could | wont`
- `icon`: a lucide icon name (e.g., `layout-grid`, `search`, `shopping-cart`)
- Stable IDs: `F-<CODE>` for features, `F-<CODE>-NN` for sub-features. The same ID is used in `PRD.md` and the JSON.
- `dependsOn` contains only existing feature IDs.
- `stack.mode`: `ai | user`. Each layer's `source`: `user | ai | assumption`.
- `architecture.mode`: `ai | user`. Each dimension's `source`: `user | ai | assumption`. `repositoryStrategy.tooling` is set only for a monorepo.
- Every feature's `module` matches an `architecture.modules[].id`.

## Skills

Skills are grouped into buckets under `skills/`. Only promoted buckets ship in the plugin.

### Productivity

General workflow tools, not code-specific.

**Model-invoked** (the agent can reach for them when a task fits):

- **[grill-prd](./skills/productivity/grill-prd/SKILL.md)**: Grill a product idea one question at a time, then write a precise PRD with stack, data model and a phased feature map.

Docs page: [docs/productivity/grill-prd.md](./docs/productivity/grill-prd.md).

## Repository structure

```
grill-prd/
├── .agents/                  # Shared notes for agents: install block, invocation rules, docs-writing guide
├── .changeset/               # Pending changesets for the next release
├── .claude-plugin/           # Claude Code plugin and marketplace manifests
│   ├── marketplace.json
│   └── plugin.json
├── .github/                  # Issue templates and workflows (release, triage, needs-info)
├── .out-of-scope/            # Requests this repo has decided not to take
├── docs/
│   └── productivity/
│       └── grill-prd.md      # Human-facing docs page for the skill
├── scripts/                  # link-skills.sh, list-skills.sh, sync-plugin-version.mjs
├── skills/
│   └── productivity/
│       ├── README.md         # Bucket index
│       └── grill-prd/
│           ├── SKILL.md      # Skill definition (frontmatter + full instructions)
│           └── agents/
│               └── openai.yaml   # Codex UI metadata
├── AGENTS.md                 # Symlink to CLAUDE.md
├── CHANGELOG.md
├── CLAUDE.md                 # Rules for working in this repo
├── CONTRIBUTING.md
├── GLOSSARY.md               # Vocabulary used by the skill
├── LICENSE                   # MIT license
├── README.md                 # This document
├── SCOPE.md                  # The bar every issue is judged against
├── package.json
└── package-lock.json
```

Contributors: read [CONTRIBUTING.md](./CONTRIBUTING.md) and [SCOPE.md](./SCOPE.md) before filing an issue. Version history is in [CHANGELOG.md](./CHANGELOG.md).

## FAQ

**Do I have to answer every question?**
No. Reply `ok` to accept a recommendation, or `skip` to have it recorded as an assumption. The skill stops grilling once the Definition of Ready is met, or when you ask it to write the PRD.

**What if I don't have a stack yet?**
Choose `Let AI pick`. The skill selects defaults that fit your requirements in B6 and records the reasons.

**What if I already have a stack in mind?**
Name your choices per layer in the TP stage. Your picks are treated as constraints. If there's a conflict, the skill asks you before changing anything.

**Why is architecture asked so late?**
Because a choice such as microservices or full DDD is only right if the scope, data and team justify it. By the time AR starts, the skill knows the features, rules and entities, so it can say *why* it recommends, for example, a modular monolith in a Bun workspaces + Nx monorepo.

**I picked "Monorepo". What happens next?**
The skill asks which tooling: a workspace manager (Bun, pnpm, npm, Yarn) and optionally a task runner or build system (Nx, Turborepo, moon, Bazel, …), recommended to match your runtime and languages.

**Does the skill write code?**
No. It produces the PRD and feature map only. Implementation comes afterward.

**What language is used?**
`SKILL.md` is in English, but you can answer in any language. The PRD's document language is not set explicitly in `SKILL.md`, so state the language you want at the start of the session.

## License and credits

- The interview method is adapted from the `grill-me` skill in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
- `grill-prd` is licensed under the [MIT License](./LICENSE) © 2026 rezkycodes.
- Parts adapted from `grill-me` remain subject to the original MIT license.
