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
- **Phase dependency check**: a feature never sits in an earlier phase than a feature it depends on.
- **Decision Log** in a short ADR format, so every decision is recorded with its reason.
- **Two outputs**: `PRD.md` for humans and `feature-map.json` for rendering, ticket generation, or scaffolding.
- **`Let AI pick` mode**: if you have no stack yet, the skill chooses defaults that fit your requirements and explains why.

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

### Option 3: Manual copy

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
| `Let AI pick` | Hand one stack layer to the skill |

## Workflow

```
TP (tech preferences)
   │
   ▼
B1 Problem & users ─► B2 Actors & access ─► B3 Scope & feature map
                                                   │
   ┌───────────────────────────────────────────────┘
   ▼
B4 Flows & business rules ─► B5 Data model ─► B6 Stack & architecture
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
| **B6 — Stack & architecture** | Unchosen layers, ORM, auth, storage, topology, external integrations | Every component has a reason tied to a requirement; architecture diagram; folder structure |
| **B7 — NFRs** | Performance (p95), scale, availability, security, observability, deployment, cost estimate | Every NFR has a number or a verifiable rule |
| **B8 — Release phases** | Grouping features into phases; Phase 1 must be an end-to-end vertical slice | No dependency violations; each phase has a goal and a definition of done |

## Default stack and layer catalog

### Default stack (starting recommendation)

| Layer | Default | Choose an alternative when |
|---|---|---|
| Runtime & monorepo | Bun + TypeScript, Nx monorepo | Small single app → single repo |
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

| Layer | Options |
|---|---|
| Frontend | Next.js · React (Vite) · TanStack Start · React Router 7 / Remix · Astro · Vue.js · Nuxt · SvelteKit · Angular · None (API only) |
| Backend | Next.js Route Handlers / Server Actions · Nuxt server · Node.js (Express / Fastify / NestJS) · Hono · ElysiaJS (Bun) · Deno · Python (FastAPI / Django) · Go (Fiber / Echo) · Rust (Axum / Actix) · Laravel (PHP) · BaaS (Supabase / Firebase) |
| Database | PostgreSQL · Neon · Supabase · Prisma Postgres · MySQL · PlanetScale · SQLite / Turso · Cloudflare D1 · MongoDB · Firebase Firestore · Redis (cache/queue, not primary) |
| Deployment | Vercel · Netlify · Cloudflare (Workers / Pages) · Railway · Render · Fly.io · AWS · GCP (Cloud Run) · Azure (App Service) · Hetzner Cloud · DigitalOcean · VPS (manual) · Coolify · Docker / Kubernetes |

The catalog is not exhaustive. You can type any other technology, and the skill will verify that it is still maintained before recommending it.

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
- A feature with no role, no data source, or no link to the B1 job is proposed for removal or moved to Non-goals.

## Output

Two artifacts are produced:

1. **`PRD.md`**: the full document, with 13 sections (summary, problem and JTBD, goals and metrics, actors and role matrix, feature map, feature specifications, data model, API surface, architecture and stack, NFRs, phase plan, decision log, assumptions and open questions).
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
  "roles": ["guest", "admin"],
  "features": [
    {
      "id": "F-GAL",
      "name": "Design Gallery",
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

**Does the skill write code?**
No. It produces the PRD and feature map only. Implementation comes afterward.

**What language is used?**
`SKILL.md` is in English, but you can answer in any language. The PRD's document language is not set explicitly in `SKILL.md`, so state the language you want at the start of the session.

## License and credits

- The interview method is adapted from the `grill-me` skill in [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
- `grill-prd` is licensed under the [MIT License](./LICENSE) © 2026 rezkycodes.
- Parts adapted from `grill-me` remain subject to the original MIT license.
