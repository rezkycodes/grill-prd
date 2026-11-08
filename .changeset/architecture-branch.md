---
"grill-prd": minor
---

Add the AR (architecture) branch, asked after the data model and before the stack: domain design, software architecture, repository strategy (with a monorepo tooling follow-up such as Bun workspaces, pnpm + Turborepo, or Nx), application architecture, and design patterns, each with a catalog, a default profile, and an architecture fit check. Every feature now belongs to a module, and `feature-map.json` gains an `architecture` block and a `module` field per feature. The TP layer catalog is expanded (mobile, desktop, BaaS, edge, and more hosts and databases), with new compatibility checks for them.
