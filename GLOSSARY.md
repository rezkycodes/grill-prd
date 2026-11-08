# grill-prd

A Claude Code skill that grills a product idea until it is precise, then writes a PRD and a feature map. The vocabulary below is the one the skill uses.

## Language

**Grilling**:
The interview method: one question per turn, each with a recommended answer, walking every branch of the design tree until its exit criteria are met.
_Avoid_: quiz, questionnaire (a questionnaire is a batch of questions answered async)

**Design tree**:
The ordered set of branches the grilling walks: B1 (problem and users), TP (tech preferences), B2 (actors), B3 (scope), B4 (flows), B5 (data), AR (architecture), B6 (stack), B7 (NFRs), B8 (release phases).
_Avoid_: question list, checklist

**Branch**:
One node of the design tree, identified by a code such as `B3`. A branch is done when its **exit criteria** are met.

**Recommended answer**:
The answer the skill proposes for every question, with a reason. Accepting it is a reply of `ok`.
_Avoid_: default (a default is a value the tool uses silently; a recommendation is proposed and visible)

**Assumption**:
An answer the user skipped and the skill filled in with its recommendation, marked `[ASSUMPTION]` and listed under Open Questions.

**Stack mode**:
Either `ai` (the skill picks every layer) or `user` (the user picked at least one layer). Each layer records its **source**: `user`, `ai`, or `assumption`.

**Compatibility check**:
The pass over a chosen stack that flags conflicting combinations (for example, a long-running backend on a serverless host) and turns each conflict into a question.

**Architecture dimension**:
One of the five decisions in branch AR, asked in this order because each depends on the one before: domain design, software architecture, repository strategy, application architecture, design patterns. Like stack layers, each records a **source** and a reason; **Architecture mode** is `ai` or `user` on the same rule as stack mode.

**Module**:
A bounded context or module from the domain design. Every feature belongs to exactly one module, and a module owns its entities.
_Avoid_: service (a service is a deployable unit, decided by the software architecture)

**Software architecture**:
The system-level dimension (AR.2): which deployables exist and how they talk. It combines five sub-dimensions: topology and communication (asked), and execution model, backend ownership and frontend composition (**derived** from the stack and confirmed).
_Avoid_: using it for layered/clean/hexagonal; those are application architecture

**Application architecture**:
The code-level dimension (AR.4): how the code inside one **deployable** is structured (layered, vertical slice, clean, hexagonal, …). Recorded once per deployable.

**Deployable**:
A unit that is built and deployed on its own (for example `web`, `api`, `mobile`, `worker`), listed after AR.2.

**Derived value**:
An answer the skill infers from an earlier one instead of asking again (for example, a Vercel deployment implies a serverless execution model). It is stated and confirmed with `ok`, and records which stack layer it came from.

**Repository strategy**:
How code is split across repositories: single repo, monorepo, polyrepo, or hybrid. A monorepo also records its **monorepo tooling**: the package / workspace manager that owns the lockfile (Bun, pnpm, npm, Yarn, or a language-native one such as `go.work`), an optional orchestrator (Nx, Turborepo, moon, Bazel), language-native workspaces, and how apps share contracts.
_Avoid_: treating the runtime and the package manager as one choice (Bun runtime + pnpm workspaces is valid)

**Architecture fit check**:
The pass over the architecture that flags choices the scope does not justify (for example, microservices for a single developer) and turns each into a question.

**Feature**:
A capability in the feature map, with an ID of the form `F-<CODE>`, a module, a role, a priority, a phase, and dependencies.

**Sub-feature**:
A testable slice of a feature, with an ID of the form `F-<CODE>-NN` and at least one acceptance criterion.

**Acceptance criterion**:
A Given/When/Then statement that a sub-feature must satisfy.

**Phase**:
A release stage. Phase 1 must be an end-to-end vertical slice.

**Phase dependency check**:
The rule that a feature may not sit in an earlier phase than a feature it depends on, and that a feature displaying data may not precede the feature that creates it.

**Decision log**:
The list of confirmed decisions, each in a short ADR form (context, decision, consequences, status).

**Definition of Ready**:
The checklist that must pass before the PRD is written.

**Feature map**:
The structured `feature-map.json` output: phases, stack, architecture, roles, and features with sub-features. Its structure is defined by the JSON Schemas in the skill's `schemas/` folder.

**Feature map checker**:
The dependency-free script (`scripts/check-feature-map.mjs` in the skill) that checks what the schema cannot: cross-references between modules, phases, features, roles and deployables, dependency cycles, and the phase dependency check.

## Relationships

- A **Grilling** session walks the **Design tree** branch by branch
- Each question has one **Recommended answer**, and a skipped question becomes an **Assumption**
- A **Stack mode** of `user` fixes the layers the user chose; the rest are filled in B6 from the default stack profile, and the **Compatibility check** validates the combination
- A **Feature** has one or more **Sub-features**, each with **Acceptance criteria**
- The **Phase dependency check** runs over the **Phases** of all features before the PRD is written
- The domain design defines the **Modules**; each **Feature** belongs to one **Module**
- **Software architecture** produces the **Deployables**; each **Deployable** has exactly one **Application architecture**
- A **Repository strategy** of monorepo requires a choice of monorepo tooling; the **Architecture fit check** runs once all five **Architecture dimensions** are set
- The **Feature map checker** runs on the **Feature map** before it is handed over

## Flagged ambiguities

- "ticket" is not used for a feature or sub-feature. The feature map is turned into tickets only by a separate tool.
