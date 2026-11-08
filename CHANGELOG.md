# grill-prd

## 0.2.0

### Minor Changes

- [#1](https://github.com/rezkycodes/grill-prd/pull/1) [`6089544`](https://github.com/rezkycodes/grill-prd/commit/60895443789655a188338f472b7237c8980186a7) Thanks [@rezkycodes](https://github.com/rezkycodes)! - Add the AR (architecture) branch, asked after the data model and before the stack: domain design, software architecture, repository strategy (with a monorepo tooling follow-up such as Bun workspaces, pnpm + Turborepo, or Nx), application architecture, and design patterns, each with a catalog, a default profile, and an architecture fit check. Every feature now belongs to a module, and `feature-map.json` gains an `architecture` block and a `module` field per feature. The TP layer catalog is expanded (mobile, desktop, BaaS, edge, and more hosts and databases), with new compatibility checks for them.

- [#2](https://github.com/rezkycodes/grill-prd/pull/2) [`0b6513e`](https://github.com/rezkycodes/grill-prd/commit/0b6513e9128e411ba1808bdb91b677d14ca5ad25) Thanks [@rezkycodes](https://github.com/rezkycodes)! - Rework the AR branch after review and make `feature-map.json` verifiable.

  - Software architecture (AR.2) is now a combination instead of one dropdown: topology and communication are asked; execution model, backend ownership and frontend composition are derived from the stack and confirmed. AR.2 (system level) and AR.4 (code level, one per deployable) are now defined explicitly, and the architecture lists its deployables.
  - Runtime and package manager are separate decisions (Bun runtime + pnpm workspaces is valid). The fit check now validates one package manager, lockfile and install command per repo instead of forcing them to match, and the default profile no longer assumes Bun workspaces.
  - Monorepo tooling is filtered by the languages derived from the stack, with polyglot repos getting a polyglot orchestrator and a language-neutral contract.
  - New JSON Schemas (`schemas/feature-map.schema.json`, `schemas/architecture.schema.json`), a complete example, and a dependency-free checker (`scripts/check-feature-map.mjs`) inside the skill. Every stack and architecture decision now requires `choice`, `source` and `reason`; the `architecture` block changed shape (unreleased since the previous changeset).
  - Catalogs and the PRD template moved to `references/`, bringing `SKILL.md` under 300 lines. Manual installs must now copy the whole skill folder.
  - Repo: fixtures under `tests/fixtures/`, `npm run validate`, and a Validate workflow on pull requests.

- [#3](https://github.com/rezkycodes/grill-prd/pull/3) [`b4b8706`](https://github.com/rezkycodes/grill-prd/commit/b4b8706bb2309644782bf942939543a5e886f78b) Thanks [@rezkycodes](https://github.com/rezkycodes)! - Add a complexity assessment and output templates.

  - **AR.C**: before AR.1, the skill scores eight factors it already knows from B1–B5 (team, modules, rules, scale, independent scaling, integrations, async work, lifetime) and maps the total to a tier — Minimal, Standard, Elevated or High. The tier is the baseline for every AR recommendation and the yardstick the fit check uses: one step above is free when a single factor justifies it, further above needs a named requirement. `feature-map.json` records the factors, total and tier, and the checker verifies they agree.
  - **Templates** in `assets/templates/`: the PRD template moves there from `references/`, joined by an ADR template for decisions that are expensive to reverse, and repository-structure trees per repository strategy and application architecture.
  - References over ~100 lines now open with a table of contents.

## 0.1.0

### Minor Changes

- Initial release: the `grill-prd` skill. It interviews you one question at a time, with a recommended answer for each, through tech preferences, actors, scope, flows, data model, stack, NFRs and release phases. It then writes `PRD.md` and `feature-map.json`.
