# Architecture catalog

Read this file when you reach AR (architecture) and again in B6 (stack). Not exhaustive — the user may name any other approach.

## Definitions

The five AR dimensions sit at different levels. Keep them apart: a question about one level never answers another.

| Dimension | Level | Answers |
|---|---|---|
| AR.1 Domain design | Problem space | How is the business domain modelled and split into modules / bounded contexts? |
| AR.2 Software architecture | System level | Which deployable units exist, how are they composed, and how do they talk to each other? |
| AR.3 Repository strategy | Source-code organisation | How is the code of those deployables spread across repositories, and with which tooling? |
| AR.4 Application architecture | Code level, **inside one deployable** | How is the code of a single deployable structured into layers or slices? |
| AR.5 Design patterns | Local, inside the code | Which reusable solutions are applied, where, and to which problem? |

"Software architecture" here means *architecture style of the whole system* (monolith, microservices, …) and "application architecture" means *internal structure of one application* (layered, clean, hexagonal, …). Naming varies across books and teams; if the user uses the words the other way round, keep their words in the conversation but record the decisions under these definitions so the feature map stays consistent.

## Default Architecture Profile

The `➡️ Recommendation` when nothing in B1–B5 argues otherwise.

| Dimension | Default | Choose the alternative when |
|---|---|---|
| Domain design | DDD-lite: bounded contexts as modules, rich rules only where B4 found them | Pure CRUD / admin panel → transaction script; complex, evolving rules with domain experts → full DDD |
| Software architecture — topology | Modular monolith | Independent scaling or team ownership per context → microservices |
| Software architecture — communication | In-process calls between modules | Async flows found in B4 (notifications, imports, payments callbacks) → add async events / a queue |
| Repository strategy | Single repo for one deployable; monorepo once there are ≥ 2 deployables or shared packages | Separate teams with separate release cycles → polyrepo |
| Monorepo tooling | The project's package manager's workspaces (Bun → Bun workspaces, pnpm → pnpm workspaces, …), plus an orchestrator only when caching or a task graph is needed | See the language mapping below |
| Application architecture | Feature-based modules (vertical slices) with a thin layered split inside each: handler → service → repository | Heavy domain + many adapters → hexagonal / clean; framework-centric team (Laravel, Rails) → framework-idiomatic MVC + service classes |
| Design patterns | Repository, Service layer, DTO + schema validation, State machine for status fields | Add others only for a named problem (see AR.5) |

## AR.1 — Domain design

| Option | Fits when | Watch out |
|---|---|---|
| Transaction script / CRUD | Simple data entry, few rules | Logic scatters as rules grow |
| Anemic model + service layer | Moderate rules, small team, ORM-centric | Services become god classes |
| DDD-lite (bounded contexts as modules, aggregates only where needed) | Several sub-domains, some real business rules | Needs discipline on module boundaries |
| Full DDD (strategic + tactical: bounded contexts, context map, aggregates, value objects, domain events, ubiquitous language) | Complex, changing rules; access to domain experts | Heavy for CRUD products |
| Event storming (workshop technique to discover contexts) | Unclear boundaries, many actors | A technique, not an output — still record the resulting contexts |

## AR.2 — Software architecture

AR.2 is **not one single choice**. It has five sub-dimensions that combine freely (a modular monolith can use async events; microservices can run on serverless; micro-frontends can sit in front of a monolith). Two are **asked**; three are **derived** from TP and only confirmed, so the user is never asked the same thing twice.

| Sub-dimension | How it is set | Values |
|---|---|---|
| AR.2a Deployment topology | **Asked** (always) | Monolith · Modular monolith · Service-based (a few coarse services) · Microservices |
| AR.2b Communication | **Asked** only when there is more than one deployable, or B4 found async flows | In-process calls · Sync HTTP / RPC (REST, GraphQL, gRPC, tRPC) · Async events / queue (broker, outbox) · Realtime push (WebSocket, SSE) — multi-select |
| AR.2c Execution model | **Derived** from the TP Deployment layer | Long-running server (VPS, Coolify, Railway, Render, Fly.io, containers) · Serverless functions (Vercel, Netlify, Lambda, Cloud Run scale-to-zero) · Edge (Cloudflare Workers, Edge Functions, Deno Deploy) · Mixed |
| AR.2d Backend ownership | **Derived** from the TP Backend layer | Custom backend · BaaS (Convex, Supabase, Firebase, Appwrite, Pocketbase) · Hybrid (BaaS + custom functions/services) |
| AR.2e Frontend composition | **Derived** from the TP Frontend layer(s) | Single app · Several apps (e.g. public web + admin + mobile) · Micro-frontends |

How to derive: read the TP answer, state the derived value in one line, and ask for `ok` (e.g. "Deployment = Vercel → execution model: serverless functions. ok?"). If the TP layer was left to AI, derive it in B6 after the stack is chosen, then come back and confirm.

| Topology | Fits when | Watch out |
|---|---|---|
| Monolith | One small team, one product, early stage | Boundaries erode without module rules |
| Modular monolith | One deployable but clear modules; the usual default | Enforce module boundaries (lint rules, package boundaries) |
| Service-based | A few coarse services with different runtimes or scaling needs | Shared database temptation |
| Microservices | Independent teams, independent scaling/release per context | Distributed data, network failures, ops cost |

## AR.3 — Repository strategy

| Option | Fits when | Watch out |
|---|---|---|
| Single repo (one app) | One deployable | Re-evaluate when a second app appears |
| Monorepo | Several apps/packages sharing contracts, types, UI | Needs tooling for tasks, caching, boundaries |
| Polyrepo (one repo per app/service) | Separate teams, separate release cycles | Shared contracts need versioned packages |
| Hybrid | Monorepo for the product + separate repos for infra or public SDKs | Two workflows to maintain |

Avoid git submodules as the sharing mechanism unless the user insists — they make every clone and update error-prone.

### Monorepo tooling

Asked only when AR.3 = Monorepo (or Hybrid with a monorepo part). Record three things separately:

1. **Package manager / workspace manager** — links packages, owns the single lockfile. This is *not* the runtime: Bun can be the runtime while pnpm is the package manager, and Node.js can run code installed with Bun.
2. **Orchestrator (optional)** — task graph, caching, affected-only runs, module-boundary rules.
3. **Language-native workspaces (optional)** — for non-JS code living in the same repo.

| Tooling | Type | Fits when |
|---|---|---|
| Bun workspaces | Workspace manager (JS/TS) | Bun is the package manager; simple setups |
| pnpm workspaces | Workspace manager (JS/TS) | Strict dependency isolation, fast installs, broad CI support |
| npm workspaces | Workspace manager (JS/TS) | No extra tooling wanted |
| Yarn workspaces | Workspace manager (JS/TS) | Team already on Yarn |
| Nx | Orchestrator + build system + generators, project graph, module-boundary rules | Many apps/libs, caching, enforced boundaries; works on top of any JS workspace manager; polyglot via plugins |
| Turborepo | Task orchestrator + caching (JS/TS focused) | JS/TS monorepo that wants caching with minimal config |
| moon (moonrepo) | Polyglot orchestrator + toolchain manager | Mixed languages, pinned toolchains |
| Lerna (powered by Nx) | Versioning and publishing of packages | Publishing many npm packages |
| Rush | Monorepo management with strict policies (JS/TS) | Big organisations |
| Bazel / Buck2 / Pants | Hermetic, polyglot build systems | Very large or multi-language codebases; steep learning curve |
| Cargo workspaces | Language-native (Rust) | Rust crates |
| Go workspaces (`go.work`) | Language-native (Go) | Several Go modules |
| uv workspaces | Language-native (Python) | Several Python packages |
| Gradle multi-project / Maven multi-module | Language-native (JVM) | Spring Boot services |
| .NET solution (multi-project) | Language-native (.NET) | ASP.NET Core services |
| Composer path repositories | Language-native (PHP) | Shared Laravel packages |

Verify current versions and support before recommending.

### Language → tooling mapping

**Derive the languages from TP** (each frontend and backend choice implies a language) instead of asking. Then filter the tooling table with this mapping:

| Languages in the repo | Workspace / package manager | Orchestrator (optional) | Shared contracts between apps |
|---|---|---|---|
| TypeScript / JavaScript only | The package manager already in use (Bun, pnpm, npm, Yarn) | Turborepo (light) or Nx (boundaries, generators) | Shared TS package with Zod schemas, or tRPC |
| Go only | `go.work` | Usually none; Make / Task / moon if needed | Go packages; OpenAPI or protobuf for external clients |
| Rust only | Cargo workspaces | Usually none; moon or Bazel at scale | Shared crates |
| Python only | uv workspaces | Usually none; Pants at scale | Shared packages; OpenAPI |
| PHP only | Composer path repositories | Usually none | Shared Composer packages; OpenAPI |
| Java / Kotlin only | Gradle multi-project or Maven multi-module | The build tool itself | Shared modules; OpenAPI or protobuf |
| C# / .NET only | .NET solution | The build tool itself | Shared projects; OpenAPI |
| Polyglot (e.g. Next.js + Go Fiber, Expo + Laravel) | JS package manager for the JS apps + the native workspace for each other language | Nx (with plugins), moon, or Bazel — not a JS-only runner | **Language-neutral contract**: OpenAPI, protobuf/gRPC, or JSON Schema, with generated clients |

Example — Frontend: Next.js · Backend: Go (Fiber) · Repository: Monorepo → languages TS + Go (polyglot) → recommend: the project's JS package manager (e.g. pnpm) for `apps/web`, `go.work` for the Go services, Nx or moon as orchestrator, OpenAPI as the shared contract with a generated TS client.

## AR.4 — Application architecture

Asked **per deployable** (from AR.2a/AR.2e). A product usually mixes one backend option and one frontend option.

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

## AR.5 — Design patterns

Multi-select. Each chosen pattern needs **where** it applies and **which problem** it solves; a pattern with no concrete problem is dropped.

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

## Architecture Fit Check

Run after AR.5 and again in B6. Each hit becomes a grilling question with a recommended fix.

| If the architecture has… | Then check / ask |
|---|---|
| Microservices + 1–3 developers or no independent scaling need | Flag over-engineering → recommend a modular monolith with clean module boundaries (can be split later). |
| Microservices or service-based sharing one database | Anti-pattern (distributed monolith) → one database or schema per service, or stay modular monolith. |
| Full DDD or event sourcing for a CRUD-heavy product | Flag over-engineering → DDD-lite; event sourcing only with a real audit/replay requirement. |
| CQRS without a read/write asymmetry | Drop it, or limit it to the specific read model that needs it. |
| Communication includes async events / queue, or the Outbox pattern is chosen, but no broker/queue is in the stack | Add the broker/queue to the stack (B6) or drop the async part. |
| Communication includes realtime push + execution model is serverless functions | Persistent connections don't fit → managed realtime service or a long-running service for that part. |
| Derived execution model, backend ownership, or frontend composition contradicts a TP answer | Never override silently — show both and ask which one stands. |
| Micro-frontends with one frontend team | Flag over-engineering → single app with feature folders. |
| Polyrepo + shared contracts/types | Versioned packages and release coordination needed → consider a monorepo. |
| Monorepo with mixed languages + a JS-only orchestrator (e.g. Turborepo alone) | Use a polyglot orchestrator (Nx with plugins, moon, Bazel) or orchestrate each native workspace separately, and pick a language-neutral contract (OpenAPI, protobuf). |
| Monorepo with only one deployable and no shared packages | Tooling overhead without benefit → single repo until a second app appears. |
| More than one package manager or lockfile in the repo, or CI / Dockerfile installs with a different package manager than the chosen one | Pick one package manager per repo; make the lockfile, install command, CI cache and Docker build use it. (Runtime and package manager may differ: Bun runtime + pnpm workspaces and Node.js + Bun workspaces are both valid.) |
| Bun workspaces chosen and a deploy target or CI image can't install with Bun | Install Bun in CI/build images, or use pnpm/npm workspaces with Bun as the runtime only. |
| Hexagonal/clean architecture on a framework-centric stack (Laravel, Rails, Django) | Fighting the framework → confirm the team accepts the extra layers, or use framework-idiomatic + service layer. |
| Topology is microservices / service-based + execution model is edge only | Check CPU-time, memory, and database-access limits per service. |
| A feature not mapped to any module/bounded context | Fix the boundary or the feature before writing the PRD. |
| A deployable without an AR.4 entry, or an AR.4 entry for an unknown deployable | Every deployable gets exactly one application architecture. |
| Repository pattern on top of an ORM that already is one (e.g. Eloquent, Active Record) for simple CRUD | Ask whether the abstraction pays off (testing, multiple data sources) or is ceremony. |
