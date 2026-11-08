---
"grill-prd": minor
---

Add a complexity assessment and output templates.

- **AR.C**: before AR.1, the skill scores eight factors it already knows from B1–B5 (team, modules, rules, scale, independent scaling, integrations, async work, lifetime) and maps the total to a tier — Minimal, Standard, Elevated or High. The tier is the baseline for every AR recommendation and the yardstick the fit check uses: one step above is free when a single factor justifies it, further above needs a named requirement. `feature-map.json` records the factors, total and tier, and the checker verifies they agree.
- **Templates** in `assets/templates/`: the PRD template moves there from `references/`, joined by an ADR template for decisions that are expensive to reverse, and repository-structure trees per repository strategy and application architecture.
- References over ~100 lines now open with a table of contents.
