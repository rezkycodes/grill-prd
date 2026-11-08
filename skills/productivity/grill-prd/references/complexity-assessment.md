# Complexity assessment

Read this **before AR.1**, once B3 (scope), B4 (flows) and B5 (data) are done. It turns what you already know into one number, and that number sets the starting point for every AR recommendation. Without it, "modular monolith" and "microservices" are both defensible for the same product and the choice comes down to taste.

Contents: [How to use it](#how-to-use-it) · [The rubric](#the-rubric) · [Tiers](#tiers) · [What each tier recommends](#what-each-tier-recommends) · [Spending above the tier](#spending-above-the-tier) · [Worked example](#worked-example)

## How to use it

1. Score the eight factors from the answers already given. **Do not ask the user to score anything** — you have the information; ask only for a factor B1–B5 genuinely left open (team size is the usual one).
2. Add the scores and read the tier.
3. Show the user one short block: the total, the tier, and the two or three factors that drove it. Ask for `ok`.
4. Use the tier as the `➡️ Recommendation` baseline for AR.1–AR.5.
5. Record the total and tier in the Decision Log, so later choices can refer to it.

The score is a **starting point, not a verdict**. The user may choose anything; the rubric only decides what you recommend first and what the fit check treats as over-engineering.

## The rubric

Score each factor 0–3. When a product sits between two columns, take the lower one: complexity that turns out to be real is easy to add later, and complexity that was never needed is expensive to remove.

| # | Factor | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| C1 | People building it | 1 developer | 2–3 | 4–8 | 9+, or separate teams per area |
| C2 | Modules / bounded contexts (AR.1) | 1–2 | 3–5 | 6–9 | 10+ |
| C3 | Business rules (B4) | CRUD only | A few rules, 1 state machine | Several state machines, pricing or scheduling rules | Regulated domain, many invariants, auditable decisions |
| C4 | Scale (B7 or B1 estimate) | < 100 users, hundreds of rows | < 10k users | < 1M users, or steady heavy load | Beyond that, or unpredictable spikes |
| C5 | Independent scaling or release | Everything ships together | One part has different load or a different cadence | Several parts do | Each context must scale and ship on its own |
| C6 | External integrations (B6) | 0–1 | 2–3 | 4–6 | 7+, or any that is unreliable and critical |
| C7 | Async & background work (B4) | None | 1–2 simple jobs or notifications | Several flows where retries and failures matter | Ordering, exactly-once, or multi-step compensation |
| C8 | Lifetime & change rate | Pilot or throwaway | 1–2 years, occasional change | Multi-year, steady change | Long-lived platform, constant change, many contributors |

Total: 0–24.

## Tiers

| Total | Tier | Reading |
|---|---|---|
| 0–5 | **Minimal** | Ship the simplest thing that works. Structure is a cost here. |
| 6–11 | **Standard** | Clear boundaries inside one deployable. The usual tier for a real product with one small team. |
| 12–17 | **Elevated** | Boundaries now need enforcement, and some parts may deserve their own deployable. |
| 18–24 | **High** | Distribution and explicit contracts are justified by load, teams, or regulation. |

Most products a single developer or a small team builds land in **Minimal** or **Standard**. If you compute **Elevated** or **High** for a small team, re-check C4 and C5 — those are the two factors people inflate from ambition rather than evidence.

## What each tier recommends

Use this as the baseline for the AR questions; the architecture catalog's own tables then refine it.

| Dimension | Minimal (0–5) | Standard (6–11) | Elevated (12–17) | High (18–24) |
|---|---|---|---|---|
| AR.1 Domain design | Transaction script / CRUD | DDD-lite | DDD-lite, aggregates where invariants are real | Full DDD with a context map |
| AR.2a Topology | Monolith | Modular monolith | Modular monolith, or service-based for the parts C5 named | Microservices along context boundaries |
| AR.2b Communication | In-process | In-process (+ sync HTTP if the frontend is separate) | Add async events for the flows C7 named | Async events as the default between contexts |
| AR.3 Repository | Single repo | Single repo, or monorepo once there are ≥ 2 deployables | Monorepo with enforced boundaries | Monorepo with boundary rules, or polyrepo if teams are separate |
| Monorepo orchestrator | None | None, or a light one (Turborepo) | Nx or moon (task graph, boundary rules) | Nx, moon or Bazel |
| AR.4 Application architecture | Framework-idiomatic | Vertical slice with thin layers | Vertical slice; clean/hexagonal where C6 is high | Clean or hexagonal in the core contexts |
| AR.5 Patterns | Framework defaults only | Repository, Service layer, DTO + validation, State machine | Add Outbox, Idempotency key, Anti-corruption layer as C6/C7 require | Add Saga, CQRS, Event sourcing only where a named requirement demands it |

## Spending above the tier

A product is rarely uniform: one part can be genuinely harder than the rest. So treat complexity as a budget.

- **One step up on one dimension is free** when a single factor scored 3 and points straight at it. Example: C7 = 3 (payment callbacks must not double-charge) justifies async events and an Idempotency key at Standard tier, without moving anything else.
- **Two steps up, or a whole tier jump, needs a named requirement** written into the Decision Log — a number, a rule, or a constraint from B1–B7, not an expectation of growth.
- **Growth is not a requirement.** "We might scale later" is answered by keeping module boundaries clean, not by distributing now. Say that in one line and move on.
- **Below the tier is fine** when the user prefers it and accepts the consequence; record it as a decision.
- Anything that ends up more than one step above its tier without a named requirement is an **over-engineering hit** in the Architecture Fit Check, and is raised as a question.

## Worked example

Billboard design portal: one developer; catalog, pricing, ordering and identity; prices and an order status machine; a few hundred village governments; everything ships together; WhatsApp only; one notification job; expected to run for years with occasional changes.

C1 0 · C2 1 · C3 2 · C4 0 · C5 0 · C6 1 · C7 1 · C8 2 → **total 7, Standard**.

Recommend: DDD-lite, modular monolith, in-process plus sync HTTP from the web app, single repo until the admin becomes its own app, vertical slice inside the API, and the Standard pattern set. Microservices would sit three steps above the tier with nothing in C1, C4 or C5 to pay for it, so the fit check raises it.
