# Repository structure templates

Starting points for the PRD's folder-structure section. Pick the tree that matches the recorded **repository strategy** (AR.3), then arrange each deployable's inside according to its **application architecture** (AR.4). Rename everything to the product's own modules — these use the billboard-portal example.

Contents: [Single repo](#single-repo) · [Monorepo, one language](#monorepo-one-language) · [Monorepo, polyglot](#monorepo-polyglot) · [Polyrepo](#polyrepo) · [Inside a deployable](#inside-a-deployable) · [Rules](#rules)

## Single repo

One deployable, no shared packages yet. A full-stack framework owns both the UI and the API.

```
billboard-portal/
├── src/
│   ├── app/                     # routes / pages
│   ├── modules/                 # one folder per bounded context (AR.1)
│   │   ├── catalog/
│   │   ├── pricing/
│   │   ├── ordering/
│   │   └── identity/
│   ├── shared/                  # cross-module utilities, UI primitives
│   └── db/                      # schema, migrations, seed
├── docs/prd/<slug>/             # PRD.md and feature-map.json
├── tests/
└── <package manifest>
```

## Monorepo, one language

Several deployables sharing contracts. The workspace manager owns the single lockfile; the orchestrator is optional.

```
billboard-portal/
├── apps/
│   ├── web/                     # public site
│   ├── admin/                   # admin dashboard
│   └── api/                     # API server
├── packages/
│   ├── contracts/               # schemas and types shared by apps
│   ├── db/                      # schema, migrations, seed
│   └── ui/                      # shared components
├── docs/prd/<slug>/
├── <workspace config>           # workspaces field, or pnpm-workspace.yaml
├── <orchestrator config>        # nx.json / turbo.json / .moon — omit if none
└── <single lockfile>
```

Boundary rule to state in the PRD: `apps/*` may depend on `packages/*`; `packages/*` never depend on `apps/*`; one app never imports another app's internals. With Nx or moon, write it as a boundary rule rather than a convention.

## Monorepo, polyglot

Each language keeps its native workspace; one orchestrator runs across them; the contract is language-neutral.

```
billboard-portal/
├── apps/
│   ├── web/                     # TypeScript
│   └── api/                     # Go, Rust, PHP, …
├── packages/
│   └── api-client/              # generated from the contract, not hand-written
├── contracts/
│   └── openapi.yaml             # or .proto — the single source of truth
├── docs/prd/<slug>/
├── <js workspace config>        # covers apps/web and packages/*
├── <native workspace>           # go.work · Cargo.toml · composer.json · pyproject.toml
├── <orchestrator config>        # Nx, moon or Bazel — a JS-only runner cannot run the native side
└── <lockfile per ecosystem>
```

Say in the PRD how the client is generated and when (a `generate` task, run in CI), so the contract cannot drift from the code.

## Polyrepo

One repo per deployable, with contracts published as versioned packages.

```
billboard-portal-web/            # repo 1
billboard-portal-api/            # repo 2
billboard-portal-contracts/      # repo 3 — published, semver'd, consumed by both
```

Say which repo owns the contract, how a breaking change is rolled out across repos, and where the PRD lives (usually the contract repo or a separate docs repo).

## Inside a deployable

Pick the layout that matches AR.4; `modules/` in the trees above expands to one of these.

**Vertical slice** (default at Standard tier) — one folder per module, thin layers inside:

```
modules/pricing/
├── pricing.routes.ts            # HTTP handlers, validation at the edge
├── pricing.service.ts           # business rules
├── pricing.repository.ts        # data access
├── pricing.schema.ts            # DTOs and validation schemas
└── pricing.test.ts
```

**Layered** — folders by technical role, modules inside each. Simple, but one change touches every layer:

```
src/
├── controllers/
├── services/
├── repositories/
└── models/
```

**Clean / hexagonal** — the domain depends on nothing; adapters point inward. Only at Elevated tier or above, or with many integrations:

```
modules/ordering/
├── domain/                      # entities, value objects, domain events — no imports from outside
├── application/                 # use cases, ports (interfaces)
└── infrastructure/              # adapters: db, http, queue, third-party clients
```

**Frontend, feature-based** — mirror the backend modules so a feature has the same name on both sides:

```
src/features/catalog/
├── components/
├── hooks/
├── api.ts
└── types.ts
```

**Frontend, Feature-Sliced Design** — only for large frontends; the layer order is the rule:

```
src/
├── app/ → pages/ → widgets/ → features/ → entities/ → shared/
```

A layer may import only from layers to its right.

## Rules

- Module folder names come from AR.1 and match `architecture.modules[].id` in `feature-map.json`.
- App folder names match `architecture.deployables[].id`.
- Show only folders that will exist in Phase 1. A tree full of empty folders for later phases is a wish, not a structure.
- Name the config files by their real names once the tooling is chosen (`nx.json`, `pnpm-workspace.yaml`, `go.work`), not as placeholders.
- State the boundary rule in words next to the tree. A tree alone does not stop `apps/web` from importing `apps/api`.
