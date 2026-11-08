## What it does

`grill-prd` interviews you about a product idea until every branch of the design is resolved, then writes a precise PRD. It asks one question per turn, and each question comes with a recommended answer you can accept with `ok`. The output is a `PRD.md` document and a `feature-map.json` file, where every feature has a role, a data source, and testable acceptance criteria.

The defining constraint: it does not write the PRD until you confirm a shared-understanding summary. The interview is the product; the document is what it leaves behind.

## When to reach for it

Type `/grill-prd`, or describe a product or feature you want to write, refine, or validate. The agent also reaches for it on its own when a request matches, such as "write a PRD for…" or "plan a new app".

Reach for this when the idea is still fuzzy and you want the gaps found before code exists. For stress-testing a plan or design that already exists, without producing a PRD, look at [grill-me in mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me), the skill this one is adapted from.

## Where it fits

A **run-once planning step**. It sits before implementation: the `feature-map.json` it produces can become tickets or a scaffold. It runs standalone and needs no prior setup.

## It's working if

- Every question carries a recommendation, and you can reply `ok` to most of them.
- Each feature in `feature-map.json` names a role, a data source, and a phase.
- Acceptance criteria are Given/When/Then, and vague words such as "fast" have been replaced with numbers.
- Conflicts between the stack you chose and the requirements show up as questions, before the PRD is written.
