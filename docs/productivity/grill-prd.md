## What it does

`grill-prd` interviews you about a product idea until every branch of the design is resolved, then writes a precise PRD. It asks one question per turn, and each question comes with a recommended answer you can accept with `ok`. The output is a `PRD.md` document and a `feature-map.json` file, where every feature has a role, a data source, and testable acceptance criteria.

The defining constraint: it does not write the PRD until you confirm a shared-understanding summary. The interview is the product; the document is what it leaves behind.

## When to reach for it

Type `/grill-prd`, or describe a product or feature you want to write, refine, or validate. The agent also reaches for it on its own when a request matches, such as "write a PRD for…" or "plan a new app".

Reach for this when the idea is still fuzzy and you want the gaps found before code exists. For stress-testing a plan or design that already exists, without producing a PRD, look at [grill-me in mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me), the skill this one is adapted from.

## Common questions

**Can I bring my own stack and architecture?**
Yes. Pick per layer (frontend, backend, database, deployment) early in the interview, and per architecture dimension (domain design, software architecture, repository strategy, application architecture, design patterns) once the data model is known. Your picks are kept as constraints; a conflict is raised as a question, never changed silently.

**Why does it question my architecture choices?**
Architecture is asked after scope and data on purpose: a recommendation must point at a requirement. Choices that the scope does not justify, such as microservices for one developer or full DDD for a CRUD catalog, are flagged as over-engineering.

**Why doesn't it ask me about serverless or BaaS in the architecture step?**
Because you already answered it when you picked the host and backend. Architecture is a combination of decisions, not one dropdown: the skill asks for the topology and, when it matters, how the parts communicate, and derives the rest from your stack for you to confirm.

**What does "monorepo" lead to?**
A follow-up on tooling: the package / workspace manager, an optional orchestrator (Nx, Turborepo, moon, Bazel), and how apps share contracts. The recommendation follows the languages in your stack, so a repo that mixes TypeScript and Go gets a polyglot setup. Your runtime and package manager are separate choices.

**Can I trust the `feature-map.json`?**
It follows a published [JSON Schema](https://github.com/rezkycodes/grill-prd/tree/main/skills/productivity/grill-prd/schemas), and the skill checks its cross-references (modules, phases, dependencies, deployables) with a [dependency-free checker](https://github.com/rezkycodes/grill-prd/blob/main/skills/productivity/grill-prd/scripts/check-feature-map.mjs) before handing it over.

## Where it fits

A **run-once planning step**. It sits before implementation: the `feature-map.json` it produces can become tickets or a scaffold. It runs standalone and needs no prior setup.

## It's working if

- Every question carries a recommendation, and you can reply `ok` to most of them.
- Each feature in `feature-map.json` names a role, a data source, and a phase.
- Acceptance criteria are Given/When/Then, and vague words such as "fast" have been replaced with numbers.
- Conflicts between the stack you chose and the requirements show up as questions, before the PRD is written.
- Every feature belongs to one module, every design pattern names the problem it solves, and the folder structure matches the repository strategy you chose.
- The checker reports no errors on the `feature-map.json` you receive.
