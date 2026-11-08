# grill-prd

A Claude Code skill that grills a product idea until it is precise, then writes a PRD and a feature map. The vocabulary below is the one the skill uses.

## Language

**Grilling**:
The interview method: one question per turn, each with a recommended answer, walking every branch of the design tree until its exit criteria are met.
_Avoid_: quiz, questionnaire (a questionnaire is a batch of questions answered async)

**Design tree**:
The ordered set of branches the grilling walks: B1 (problem and users), TP (tech preferences), B2 (actors), B3 (scope), B4 (flows), B5 (data), B6 (stack), B7 (NFRs), B8 (release phases).
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

**Feature**:
A capability in the feature map, with an ID of the form `F-<CODE>`, a role, a priority, a phase, and dependencies.

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
The structured `feature-map.json` output: phases, stack, roles, and features with sub-features.

## Relationships

- A **Grilling** session walks the **Design tree** branch by branch
- Each question has one **Recommended answer**, and a skipped question becomes an **Assumption**
- A **Stack mode** of `user` fixes the layers the user chose; the rest are filled by the **Compatibility check**
- A **Feature** has one or more **Sub-features**, each with **Acceptance criteria**
- The **Phase dependency check** runs over the **Phases** of all features before the PRD is written

## Flagged ambiguities

- "ticket" is not used for a feature or sub-feature. The feature map is turned into tickets only by a separate tool.
