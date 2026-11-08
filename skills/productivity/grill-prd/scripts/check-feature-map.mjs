#!/usr/bin/env node
// Cross-reference checks for grill-prd's feature-map.json.
// JSON Schema (schemas/feature-map.schema.json) covers structure; this script covers
// what a schema cannot: references between parts of the file and the phase order.
// No dependencies: runs with Node.js 18+ or Bun.
//
// Usage: node check-feature-map.mjs <feature-map.json> [more files...]
// Exit code 0 when every file passes, 1 otherwise.

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const MONOREPO_CHOICES = new Set(["Monorepo", "Hybrid"]);

const arr = (v) => (Array.isArray(v) ? v : []);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Collect every `source` value found in a stack or architecture block. */
function sources(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => sources(n, out));
  else if (isObj(node)) {
    if (typeof node.source === "string") out.push(node.source);
    Object.values(node).forEach((n) => sources(n, out));
  }
  return out;
}

/**
 * Check a parsed feature map.
 * @returns {{code: string, severity: "error" | "warning", path: string, message: string}[]}
 *   problems found; the map is valid when none has severity "error"
 */
export function checkFeatureMap(map) {
  const errors = [];
  const err = (code, path, message) => errors.push({ code, severity: "error", path, message });
  const warn = (code, path, message) => errors.push({ code, severity: "warning", path, message });

  if (!isObj(map)) {
    err("structure", "$", "feature map must be a JSON object");
    return errors;
  }
  for (const key of ["phases", "roles", "features"]) {
    if (!Array.isArray(map[key])) err("structure", key, `"${key}" must be an array`);
  }
  if (!isObj(map.architecture)) err("structure", "architecture", '"architecture" must be an object');
  if (errors.length) return errors;

  const arch = map.architecture;
  const phaseIds = new Set(arr(map.phases).map((p) => p.id));
  const roles = new Set(arr(map.roles));
  const modules = arr(arch.modules);
  const moduleIds = new Set();
  modules.forEach((m, i) => {
    if (moduleIds.has(m.id)) err("duplicate-id", `architecture.modules[${i}]`, `module id "${m.id}" is used twice`);
    moduleIds.add(m.id);
  });

  // ---- features ----
  const features = arr(map.features);
  const byId = new Map();
  const subIds = new Set();
  features.forEach((f, i) => {
    const at = `features[${i}] (${f.id})`;
    if (byId.has(f.id)) err("duplicate-id", at, `feature id "${f.id}" is used twice`);
    byId.set(f.id, f);
    if (!moduleIds.has(f.module)) err("unknown-module", at, `module "${f.module}" is not in architecture.modules`);
    if (!phaseIds.has(f.phase)) err("unknown-phase", at, `phase ${f.phase} is not in phases`);
    arr(f.roles).forEach((r) => {
      if (!roles.has(r)) err("unknown-role", at, `role "${r}" is not in roles`);
    });
    arr(f.subFeatures).forEach((s, j) => {
      const sat = `${at}.subFeatures[${j}]`;
      if (typeof s.id !== "string" || !s.id.startsWith(`${f.id}-`)) {
        err("subfeature-id", sat, `sub-feature id "${s.id}" must start with "${f.id}-"`);
      }
      if (subIds.has(s.id)) err("duplicate-id", sat, `sub-feature id "${s.id}" is used twice`);
      subIds.add(s.id);
    });
  });

  // ---- dependencies and the Phase Dependency Check ----
  features.forEach((f, i) => {
    const at = `features[${i}] (${f.id})`;
    arr(f.dependsOn).forEach((d) => {
      if (d === f.id) return err("self-dependency", at, "a feature cannot depend on itself");
      const dep = byId.get(d);
      if (!dep) return err("unknown-dependency", at, `dependsOn "${d}" is not a feature`);
      if (typeof f.phase === "number" && typeof dep.phase === "number" && f.phase < dep.phase) {
        err("phase-inversion", at, `phase ${f.phase} is earlier than its dependency ${d} (phase ${dep.phase})`);
      }
    });
  });
  // cycle detection (depth-first)
  const state = new Map(); // id -> 1 visiting, 2 done
  const visit = (id, trail) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      err("dependency-cycle", "features", `dependency cycle: ${[...trail, id].join(" → ")}`);
      return;
    }
    state.set(id, 1);
    arr(byId.get(id)?.dependsOn).forEach((d) => byId.has(d) && d !== id && visit(d, [...trail, id]));
    state.set(id, 2);
  };
  byId.forEach((_, id) => visit(id, []));

  // ---- architecture ----
  const deployables = arr(arch.deployables);
  const deployableIds = new Set();
  deployables.forEach((d, i) => {
    if (deployableIds.has(d.id)) err("duplicate-id", `architecture.deployables[${i}]`, `deployable id "${d.id}" is used twice`);
    deployableIds.add(d.id);
  });
  const appArchCount = new Map();
  arr(arch.applicationArchitecture).forEach((a, i) => {
    if (!deployableIds.has(a.deployable)) {
      err("deployable-architecture", `architecture.applicationArchitecture[${i}]`, `deployable "${a.deployable}" is not in architecture.deployables`);
    }
    appArchCount.set(a.deployable, (appArchCount.get(a.deployable) ?? 0) + 1);
  });
  deployableIds.forEach((id) => {
    const n = appArchCount.get(id) ?? 0;
    if (n !== 1) err("deployable-architecture", "architecture.applicationArchitecture", `deployable "${id}" has ${n} application architecture entries (expected exactly 1)`);
  });

  const repo = arch.repositoryStrategy;
  if (isObj(repo)) {
    const needsTooling = MONOREPO_CHOICES.has(repo.choice);
    if (needsTooling && !isObj(repo.tooling)) {
      err("monorepo-tooling", "architecture.repositoryStrategy", `"${repo.choice}" needs tooling (workspace manager, optional orchestrator)`);
    }
    if (!needsTooling && repo.tooling !== undefined) {
      err("monorepo-tooling", "architecture.repositoryStrategy", `"${repo.choice}" must not declare monorepo tooling`);
    }
  }

  const unusedModules = [...moduleIds].filter((id) => !features.some((f) => f.module === id));
  unusedModules.forEach((id) => warn("empty-module", "architecture.modules", `module "${id}" has no features — merge it or say why it exists`));

  // ---- mode consistency ----
  for (const [block, value] of [["stack", map.stack], ["architecture", arch]]) {
    if (!isObj(value)) continue;
    const picked = sources(value).includes("user");
    if (value.mode === "ai" && picked) err("mode-mismatch", `${block}.mode`, `mode is "ai" but some ${block} items have source "user"`);
    if (value.mode === "user" && !picked) err("mode-mismatch", `${block}.mode`, `mode is "user" but no ${block} item has source "user"`);
  }

  return errors;
}

function main(files) {
  if (files.length === 0) {
    console.error("Usage: node check-feature-map.mjs <feature-map.json> [more files...]");
    return 2;
  }
  let failed = 0;
  for (const file of files) {
    let map;
    try {
      map = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      console.error(`✗ ${file}: cannot read JSON (${e.message})`);
      failed++;
      continue;
    }
    const problems = checkFeatureMap(map);
    const errors = problems.filter((p) => p.severity === "error");
    const warnings = problems.filter((p) => p.severity === "warning");
    if (errors.length === 0) {
      console.log(`✓ ${file}${warnings.length ? ` (${warnings.length} warning(s))` : ""}`);
    } else {
      failed++;
      console.error(`✗ ${file}: ${errors.length} error(s)`);
    }
    problems.forEach((p) => console.error(`  ${p.severity === "error" ? "error" : "warn "} [${p.code}] ${p.path}: ${p.message}`));
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
