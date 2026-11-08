---
"grill-prd": minor
---

Rework the AR branch after review and make `feature-map.json` verifiable.

- Software architecture (AR.2) is now a combination instead of one dropdown: topology and communication are asked; execution model, backend ownership and frontend composition are derived from the stack and confirmed. AR.2 (system level) and AR.4 (code level, one per deployable) are now defined explicitly, and the architecture lists its deployables.
- Runtime and package manager are separate decisions (Bun runtime + pnpm workspaces is valid). The fit check now validates one package manager, lockfile and install command per repo instead of forcing them to match, and the default profile no longer assumes Bun workspaces.
- Monorepo tooling is filtered by the languages derived from the stack, with polyglot repos getting a polyglot orchestrator and a language-neutral contract.
- New JSON Schemas (`schemas/feature-map.schema.json`, `schemas/architecture.schema.json`), a complete example, and a dependency-free checker (`scripts/check-feature-map.mjs`) inside the skill. Every stack and architecture decision now requires `choice`, `source` and `reason`; the `architecture` block changed shape (unreleased since the previous changeset).
- Catalogs and the PRD template moved to `references/`, bringing `SKILL.md` under 300 lines. Manual installs must now copy the whole skill folder.
- Repo: fixtures under `tests/fixtures/`, `npm run validate`, and a Validate workflow on pull requests.
