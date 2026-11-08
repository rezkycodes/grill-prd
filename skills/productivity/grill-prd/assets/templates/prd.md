# PRD.md template

Read this file when the Definition of Ready is met and you are writing the PRD. For section 9.3 use [repository-structure.md](./repository-structure.md); for a decision that is expensive to reverse and was contested, use [architecture-decision.md](./architecture-decision.md) in section 12.

```markdown
# PRD — <Product Name>
Version: 0.1 · Status: Draft · Date: <YYYY-MM-DD> · Owner: <name>

## 1. Summary
<3–4 sentences: who it is for, what problem, core value, Phase 1 scope>

## 2. Problem & Jobs-to-be-Done
- Current situation:
- Primary job (first session):
- Core value:
- Retention trigger:

## 3. Goals, Metrics & Non-goals
| Goal | Metric | Target |
|---|---|---|
Non-goals:
-

## 4. Actors & Role Matrix
| Capability | Guest | Admin | ... |
|---|---|---|---|

## 5. Feature Map
<mermaid diagram: root → feature [Phase N] → sub-feature>
| ID | Feature | Module | Phase | Priority | Role | Depends on |
|---|---|---|---|---|---|---|

## 6. Feature Specifications
### F-XXX <Feature Name> (Phase N)
- Goal:
- Roles:
- Sub-features:
  - F-XXX-01 <name>
    - AC1: Given … When … Then …
    - Entities: … · Endpoints: …
- Business rules:
- Edge cases:
- State machine (if any):

## 7. Data Model
<mermaid erDiagram>
| Entity | Key fields | Owner | Lifecycle |
|---|---|---|---|

## 8. API Surface
| Method | Path | Role | Sub-feature |
|---|---|---|---|

## 9. Architecture & Stack
<mermaid architecture diagram>

### 9.1 Architecture
Architecture mode: <ai | user>

Complexity: **<total>/24 — <tier>** (C1 <n> · C2 <n> · C3 <n> · C4 <n> · C5 <n> · C6 <n> · C7 <n> · C8 <n>)
<one line: the factors that drove the tier, and anything deliberately placed above or below it>

| Dimension | Choice | Source (user / ai) | Reason (requirement it satisfies) |
|---|---|---|---|
| Domain design | | | |
| Software architecture — topology | | | |
| Software architecture — communication | | | |
| Software architecture — execution model (derived from deployment) | | | |
| Software architecture — backend ownership (derived from backend) | | | |
| Software architecture — frontend composition (derived from frontend) | | | |
| Repository strategy | | | |
| Monorepo tooling (if monorepo): workspace manager · orchestrator · language workspaces · shared contracts | | | |

Deployables and their application architecture (one row per deployable):
| Deployable | Kind | Stack | Application architecture | Reason |
|---|---|---|---|---|

Modules / bounded contexts:
| Module | Responsibility | Owns entities | Features |
|---|---|---|---|
<mermaid context map, if more than one module>

Design patterns:
| Pattern | Where | Problem it solves |
|---|---|---|
Architecture Fit Check: ✅ passed / resolved conflicts (see Decision Log)

### 9.2 Stack
Tech preference mode: <ai | user>
| Layer | Choice | Source (user / ai) | Reason (requirement it satisfies) |
|---|---|---|---|
| Frontend | | | |
| Backend | | | |
| Database | | | |
| Deployment | | | |
| Package manager / ORM / Auth / Storage / Queue | | | |
Compatibility Check: ✅ passed / resolved conflicts (see Decision Log)

### 9.3 Folder structure
<tree, consistent with 9.1>

## 10. Non-functional Requirements
| Category | Requirement | How to verify |
|---|---|---|

## 11. Phase Plan
| Phase | Goal | Features | Definition of done |
|---|---|---|---|
Phase Dependency Check: ✅ passed / list of approved exceptions

## 12. Decision Log
<D-01 … D-NN>

## 13. Assumptions & Open Questions
- [ASSUMPTION] …
- [OPEN] …
```
