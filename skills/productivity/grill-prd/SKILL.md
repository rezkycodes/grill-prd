---
name: grill-prd
description: Grill the user relentlessly, one question at a time with a recommended answer, then write a precise PRD with stack, architecture, data model and a phased feature map (feature -> sub-feature). Use when the user wants to write, refine, or validate a PRD or plan a new app/feature.
---

# Grill PRD

Interview the user relentlessly about every aspect of the product until you reach a shared understanding, THEN write the PRD.
Adapted from the `grill-me` skill (mattpocock/skills, MIT): walk down every branch of the design tree, resolve dependencies between decisions one by one, and provide a recommended answer for every question.

The goal is not a long document but a **precise** one: every feature has a role and a module, every sub-feature has testable acceptance criteria, every entity has an owner, every stack and architecture choice has a reason, and the phase order never violates a dependency.

## Files in this skill

Read each file when the step that needs it starts, not up front.

| File | Read when |
|---|---|
| [references/stack-catalog.md](./references/stack-catalog.md) | TP starts, and again in B6 — Default Stack Profile, layer catalog, stack compatibility check |
| [references/architecture-catalog.md](./references/architecture-catalog.md) | AR starts, and again in B6 — definitions, Default Architecture Profile, AR options, monorepo tooling, language mapping, architecture fit check |
| [references/prd-template.md](./references/prd-template.md) | Writing `PRD.md` |
| [schemas/feature-map.schema.json](./schemas/feature-map.schema.json) and [schemas/architecture.schema.json](./schemas/architecture.schema.json) | Writing `feature-map.json` |
| [examples/feature-map.example.json](./examples/feature-map.example.json) | Writing `feature-map.json` — a complete, valid example |
| [scripts/check-feature-map.mjs](./scripts/check-feature-map.mjs) | Checking `feature-map.json` before handing it over |

---

## 1. Grilling rules (mandatory)

1. **One question per turn.** Never stack questions. Exceptions: (a) the user asks for "batch mode" → at most 4 questions that are all on the current frontier (independent of each other); (b) the four tech-layer questions in TP may be asked together because they are independent. The AR dimensions are **not** independent — ask them one at a time.
2. **Every question MUST include a recommended answer** and the reason for it. The user can simply reply "ok" to accept.
3. **Follow dependency order**, not template order. Do not *recommend* a stack or an architecture before you know who the users are, the scope, the data, the scale, and the SEO/realtime/offline needs. The user's own stack preferences (TP) are asked early because they are constraints, not recommendations; architecture (AR) is asked after B5 because it must be justified by scope and data.
4. **Don't ask what you can look up or derive.** If the answer is in the codebase, documents, memory, or earlier answers → look it up first, share what you found, and only ask for confirmation. The same goes for values that follow from earlier answers (e.g. the execution model follows from the chosen host).
5. **Chase vague answers.** "Fast", "easy", "a lot", "secure", "later" are not answers. Turn them into numbers, rules, or concrete examples.
6. **Challenge contradictions directly.** Example: "Clear pricing" is the core value, but Set Pricing is in Phase 4 → point out the conflict and recommend a fix.
7. **Log every decision** in the Decision Log (see §4) as soon as it is confirmed.
8. **The user may skip.** A skipped question is filled with your recommendation, marked `[ASSUMPTION]`, and added to Open Questions.
9. Stop grilling only when the Definition of Ready (§5) is met or the user says "enough, write the PRD".

### Question format

```
❓ [B3.2] Who populates the design catalog for the first time?
Why it matters: Design Gallery (Phase 1) is empty without a data source.
➡️ Recommendation: Admin uploads via the Manage Designs panel, so Manage Designs + Admin Login move to Phase 1.
Alternatives: (a) manual seed via script in Phase 1, panel later; (b) import from a Google Drive folder.
```

The code `[B3.2]` = branch B3, question 2. Show a short progress line whenever you switch branches, e.g. `Branches done: B1 ✅ TP ✅ B2 ✅ | Now: B3`.

### Interactive questions

If an interactive multiple-choice tool is available (e.g. `AskUserQuestion`), use it for questions with discrete options: put the recommended option first and label it `(Recommended)`; the user can always type their own answer. Most such tools allow only ~4 options per question, so offer the 3–4 most relevant options from the catalogs and let the user type anything else. Use multi-select for AR.2b (communication) and AR.5 (design patterns). Without such a tool, ask in text with a numbered list.

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

Read [references/stack-catalog.md](./references/stack-catalog.md).

**Step 1 — mode.** Ask one question:

```
❓ [TP.1] Do you already have a tech stack in mind, or should I pick it?
➡️ Recommendation: Let me pick (decided in B6 after scope and NFRs are clear) — unless your team already has an established stack.
Options: (1) Let AI pick  (2) Choose myself
```

- **Let AI pick** → record `stack.mode = "ai"`, skip Step 2, and decide every layer in B6 using the Default Stack Profile.
- **Choose myself** → go to Step 2.

**Step 2 — one question per layer.** Ask about these four layers (they are independent, so they may be asked together in one round):

| Layer | Question | Purpose |
|---|---|---|
| Frontend | Which frontend for the UI? | UI & user-facing screens |
| Backend | Which backend for logic & API? | Business logic & API server |
| Database | Which database for storage? | Data storage |
| Deployment | Where will it be hosted? | Hosting & infrastructure |

Rules:
- Offer options from the **Layer Catalog**; the user may also type anything not in the list. Accept the implicit answers listed there (full-stack "same as frontend", "none", several frontends, BaaS pre-filling the database).
- Each layer may be answered `Let AI pick` (or skipped). Partial answers are normal (e.g. only Frontend = Next.js, "1/4 chosen"): the remaining layers are decided in B6 and must be compatible with what the user picked.
- Still give a `➡️ Recommendation` per layer based on what B1 revealed (e.g. public catalog that needs SEO → Next.js or Astro).
- Immediately run the **Compatibility Check** on the chosen combination. Raise each conflict as its own grilling question with a recommended fix — do not silently change the user's choice.
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
- Note every **async flow** (notifications, imports, payment callbacks, scheduled jobs) — AR.2b needs it.
- **Exit criteria:** every sub-feature has testable Given/When/Then acceptance criteria; every status has its transitions and triggers.

### B5 — Data model
- Core entities, relations, cardinality, data owner (who creates/updates).
- Lifecycle: soft delete vs. hard delete, archiving, audit trail (e.g. price change history).
- Files/media: max size, formats, compression, watermarking, storage location.
- What personal data is stored (relevant to data protection laws such as GDPR / Indonesia's PDP Law) and for how long.
- **Exit criteria:** final ERD; every sub-feature maps to the entities it reads/writes.

### AR — Architecture (asked after B5, before B6)

Read [references/architecture-catalog.md](./references/architecture-catalog.md), starting with its **Definitions**: AR.2 *software architecture* is the system level (deployables and how they talk); AR.4 *application architecture* is the code level inside one deployable. Keep the two apart.

Architecture is decided after scope (B3), flows (B4) and data (B5) are known, because each choice must answer a real need: domain complexity, number of deployables, team size, scale. It is a **combination of decisions with dependencies**, not one dropdown. Walk it in this order:

| # | Dimension | How it is set | Depends on |
|---|---|---|---|
| AR.1 | Domain design → modules / bounded contexts | Asked | B3 features, B4 rules, B5 entities |
| AR.2a | Software architecture — deployment topology | Asked | AR.1 modules, team size, scale |
| AR.2b | Software architecture — communication | Asked only with > 1 deployable or async flows from B4 (multi-select) | AR.2a, B4 |
| AR.2c | Software architecture — execution model | **Derived** from TP Deployment, confirmed with `ok` | TP |
| AR.2d | Software architecture — backend ownership | **Derived** from TP Backend, confirmed with `ok` | TP |
| AR.2e | Software architecture — frontend composition | **Derived** from TP Frontend(s), confirmed with `ok` | TP |
| AR.3 | Repository strategy (+ monorepo tooling) | Asked | AR.2 deployables, languages from TP |
| AR.4 | Application architecture, **one per deployable** | Asked | AR.1, AR.2, chosen frameworks |
| AR.5 | Design patterns (multi-select) | Asked | AR.4 plus problems found in B4/B5 |

Before AR.1, ask the mode once (same as TP):

```
❓ [AR.0] Do you already have an architecture in mind, or should I recommend it?
➡️ Recommendation: Let me recommend each dimension from what we have so far — you can override any of them.
Options: (1) Let AI pick  (2) Choose myself
```

- **Let AI pick** → still walk every row, but present each as a recommendation the user confirms with `ok` (one line per dimension is enough). Record `architecture.mode = "ai"`.
- **Choose myself** → ask each asked dimension with options from the catalog. Record `architecture.mode = "user"` (also when the user picks only some dimensions).

Rules:
- Every recommendation names the requirement that justifies it (e.g. "modular monolith: one developer, 4 bounded contexts, no independent scaling need").
- **AR.1** must produce a list of **modules / bounded contexts**, and every feature from B3 must belong to exactly one of them. A feature that fits none → rethink the boundary or the feature.
- **AR.2c–e are never asked from scratch.** State the value derived from TP in one line and ask for `ok`. If the TP layer was left to AI, derive it in B6 once the stack is chosen, then confirm. A derived value that contradicts a TP answer is shown with both sides and asked — never overridden silently.
- **AR.2 → deployables.** After AR.2, list the deployable units (e.g. `web`, `admin`, `api`, `mobile`, `worker`) with their kind and stack. AR.4 is asked once per deployable.
- **AR.3:** if the answer is *monorepo* (or hybrid with a monorepo part), immediately ask the follow-up **"Which monorepo tooling?"**. Derive the languages from TP, filter with the **Language → tooling mapping**, and record the package/workspace manager, the optional orchestrator, and any language-native workspaces separately. The runtime and the package manager are different decisions (Bun runtime + pnpm workspaces is valid).
- **AR.5** is multi-select. Each pattern must name **where** it applies and **which problem** it solves. A pattern with no concrete problem is dropped.
- Run the **Architecture Fit Check** after AR.5 and raise each hit as a grilling question.
- Choices made here are constraints for B6 (folder structure, deployment) — just like TP picks.
- **Exit criteria:** every dimension recorded with source (`user`, `ai`, `assumption`) and reason; deployables listed, each with one AR.4 entry; every feature mapped to a module; monorepo tooling recorded if monorepo; no unresolved fit-check hits.

### B6 — Stack & architecture
- Re-read [references/stack-catalog.md](./references/stack-catalog.md). Start from the TP answers: layers the user chose are fixed constraints; layers marked `ai` or skipped are filled from the **Default Stack Profile**, choosing options compatible with the user's picks.
- Re-test the full stack against the needs from B1–B5: public SEO? realtime? offline? large file volume? hosting budget? who will maintain it? If a user-chosen layer no longer fits a requirement found later (e.g. realtime discovered in B4 on a serverless host), raise it as a grilling question.
- Then ask the supporting choices that depend on the four layers: package manager (JS/TS stacks — independent of the runtime), ORM / query layer (must match the backend language), auth, file storage, cache/queue/broker if AR.2b needs one.
- Confirm any AR.2c–e value that could not be derived during AR.
- Re-run the **Compatibility Check** and the **Architecture Fit Check** on the complete stack.
- Apply the AR decisions: deployment follows AR.2; the folder structure follows the repository strategy and monorepo tooling (AR.3) and the application architecture per deployable (AR.4); module folders follow the bounded contexts (AR.1).
- External integrations: payments (QRIS/virtual accounts), notifications (WhatsApp/Telegram/email), storage, maps.
- Before naming a framework version, verify the latest stable version (official docs or an MCP such as Context7). Don't rely on memory.
- **Exit criteria:** every stack component has a reason tied to a requirement; architecture diagram; folder structure consistent with AR.

### B7 — Non-functional requirements
- Performance (p95 targets, page weight), scale (active users, item count, growth), availability.
- Security: per-endpoint authorization, rate limiting, upload validation, secrets, OWASP basics, backup & restore.
- Observability: logging, error tracking, business metrics.
- Deployment: environments (dev/staging/prod), CI/CD (install with the chosen package manager), domain, estimated monthly cost.
- **Exit criteria:** every NFR has a number or a verifiable rule.

### B8 — Release phases & dependency validation
- Group features into phases. **Phase 1 must be a usable end-to-end vertical slice**, not "frontend first, backend later".
- Run the **Phase Dependency Check (§3)** and fix violations with the user.
- **Exit criteria:** no dependency violations; every phase has a goal and a definition of done.

---

## 3. Precision rules (checked before writing the PRD)

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
- Every stack and architecture decision has a reason that refers to a requirement, not taste.
- Every feature belongs to exactly one module / bounded context (AR.1).
- Every deployable has exactly one application architecture (AR.4).
- Every design pattern names where it applies and the problem it solves (AR.5).
- The folder structure in the PRD matches the repository strategy, monorepo tooling, and application architecture (AR.3, AR.4).
- A feature with no role, no data source, or no link to the B1 job → propose removing it or moving it to Non-goals.

---

## 4. Decision Log (filled during the session)

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

## 5. Definition of Ready (required before writing the PRD)

- [ ] Problem statement, core value, first-session job, retention trigger, success metrics
- [ ] Tech preferences recorded (mode + four layers) and Compatibility Check passed
- [ ] Complete role matrix, clear auth method
- [ ] Every feature: goal, role, priority, data source, 2–5 sub-features
- [ ] Every sub-feature: acceptance criteria + entities
- [ ] ERD + state machines for entities with a status
- [ ] Architecture recorded (domain design, software architecture with all five sub-dimensions, repository strategy + monorepo tooling if any, application architecture per deployable, design patterns) and Architecture Fit Check passed
- [ ] Every feature mapped to a module; every deployable has one application architecture
- [ ] Stack with reasons, architecture diagram, folder structure
- [ ] Measurable NFRs
- [ ] Phases pass the Phase Dependency Check
- [ ] Non-goals & Open Questions written down

---

## 6. Output

Produce **two artifacts**:
1. `PRD.md` — the human-readable document. Follow [references/prd-template.md](./references/prd-template.md).
2. `feature-map.json` — a structured feature schema to render as a feature map (root → phased features → sub-features), turn into tickets, or scaffold from. It must validate against [schemas/feature-map.schema.json](./schemas/feature-map.schema.json) (which references [schemas/architecture.schema.json](./schemas/architecture.schema.json)). Use [examples/feature-map.example.json](./examples/feature-map.example.json) as the model.

When working in a codebase, save to `docs/prd/<slug>/PRD.md` and `docs/prd/<slug>/feature-map.json`. In chat, create them as a document.

**Check `feature-map.json` before handing it over.** If you can run a shell with Node.js 18+ or Bun, run:

```bash
node <this skill's folder>/scripts/check-feature-map.mjs docs/prd/<slug>/feature-map.json
```

It needs no dependencies and checks the cross-references a JSON Schema cannot: features point to existing modules, phases and features; sub-feature IDs match their feature; the Phase Dependency Check; one application architecture per deployable; monorepo tooling present only for a monorepo. Fix every error it reports. Without a shell, walk the same list by hand.

Schema essentials (the schema files are authoritative):
- Stable IDs: `F-<CODE>` for features, `F-<CODE>-NN` for sub-features, the same in `PRD.md` and the JSON.
- `status`: `planned | in_progress | done | dropped`. `priority`: `must | should | could | wont`. `icon`: a lucide icon name.
- Every stack layer and architecture decision is `{ "choice", "source", "reason" }` with `source`: `user | ai | assumption`. `choice` is free text in the user's words, except `repositoryStrategy.choice`: `Single repo | Monorepo | Polyrepo | Hybrid`.
- `stack.mode` and `architecture.mode`: `ai | user` (`user` as soon as the user picked at least one item).
- `repositoryStrategy.tooling` is required for `Monorepo` and `Hybrid`, and absent otherwise.
- Every feature's `module` matches an `architecture.modules[].id`; every `architecture.deployables[].id` has exactly one `applicationArchitecture` entry.

---

## 7. Example: catching precision problems

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

Architecture in the same example — user chose "Choose myself" in AR and answered: microservices, full DDD, monorepo, Bun workspaces:
10. **Over-engineering:** One developer, four small modules, no independent scaling need → recommend a modular monolith with DDD-lite; keep the module boundaries so a context can be split out later.
11. **Derived values:** Next.js on Vercel + Laravel on Coolify → execution model "mixed" (serverless web, long-running API); backend ownership "custom"; frontend composition "single app". State these and ask for `ok` instead of asking three new questions.
12. **Polyglot monorepo:** TypeScript (Next.js) + PHP (Laravel) → Bun workspaces covers only the JS app. Recommend the JS package manager for `apps/web`, Composer for `apps/api`, an orchestrator that can run both (Nx or moon), and OpenAPI as the shared contract with a generated TS client.
13. **Unmapped feature:** "Contact Admin" fits no module → put it in Ordering (it starts an order conversation) or make it a thin integration module; ask which.
