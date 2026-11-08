# Architecture decision template

Most decisions belong in the Decision Log in its short form (context, decision, consequences, status). Use the longer form below only for a decision that is **expensive to reverse and was genuinely contested**: typically the deployment topology, the repository strategy, a database that shapes the data model, or a pattern that changes how every module is written.

Expect one to three of these in a PRD. If you are writing a fifth, the rest belong in the short form.

Copy the block into the PRD's Decision Log, right after the short entries, or into `docs/adr/NNNN-<slug>.md` when the codebase keeps ADRs of its own.

```markdown
# ADR-<NNNN>: <decision in one line, written as a result — "Orders are processed asynchronously", not "Choose a queue">

- **Date:** <YYYY-MM-DD>
- **Status:** Proposed | Accepted | Superseded by ADR-<NNNN>
- **Dimension:** <AR.1 domain design | AR.2a topology | AR.2b communication | AR.3 repository strategy | AR.4 application architecture | AR.5 pattern | stack layer>
- **Complexity tier:** <tier> (total <n>) — <at tier | one step above, paid for by C<n> | below tier by choice>

## Context

<What in B1–B7 forces a decision here. Name the requirement, with its number or rule: "C7 = 3: payment callbacks arrive more than once and must not double-charge." Facts only — no option is argued yet.>

## Options considered

| Option | What it costs | Why it was or wasn't chosen |
|---|---|---|
| <Option A> | | |
| <Option B> | | |
| <Do nothing / simplest thing> | | |

<Always include the simplest option, even when it loses. An ADR whose alternatives were never plausible is a justification, not a decision.>

## Decision

<The option taken, in one or two sentences, in the present tense.>

## Consequences

- **Gained:** <what this makes possible>
- **Paid:** <new infrastructure, new failure modes, more code to maintain, a skill the team needs>
- **Locked in:** <what becomes hard to change, and what it would take to reverse this>

## Revisit when

<The observable signal that would reopen this — "a second team owns ordering", "p95 write latency passes 800 ms", "a third integration needs the same retry logic". If nothing would ever reopen it, say so.>
```

## Rules

- One decision per ADR. Two decisions that merely arrived together are two ADRs.
- The title states the outcome, not the activity.
- Every claim in **Context** traces to something in B1–B7 or to a complexity factor. An ADR that argues from best practice alone has no context.
- **Consequences** must name a real cost. A decision with no downside was not contested, so it belongs in the short form.
- Never edit an accepted ADR to change its decision. Write a new one and set the old one's status to `Superseded by ADR-<NNNN>`.
