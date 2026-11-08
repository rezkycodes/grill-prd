#!/usr/bin/env node
// Validates grill-prd feature maps in two passes:
//   1. JSON Schema (skills/productivity/grill-prd/schemas/*.schema.json) via ajv
//   2. cross-reference checks (skills/productivity/grill-prd/scripts/check-feature-map.mjs)
//
// Every file in examples/ and tests/fixtures/valid/ must pass both.
// Every file in tests/fixtures/invalid/ must fail with the error code in its file name:
//   phase-inversion.json      → checker code "phase-inversion"
//   schema-<anything>.json    → a JSON Schema error
//
// Run with: npm run validate

import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { checkFeatureMap } from "../skills/productivity/grill-prd/scripts/check-feature-map.mjs";

const SKILL = "skills/productivity/grill-prd";
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const jsonFiles = (dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => join(dir, f));

// strictRequired is off because `if/then` legitimately requires a property declared outside the branch.
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
ajv.addSchema(readJson(join(SKILL, "schemas/architecture.schema.json")), "architecture.schema.json");
const validateSchema = ajv.compile(readJson(join(SKILL, "schemas/feature-map.schema.json")));

function problemsFor(file) {
  const map = readJson(file);
  const problems = [];
  if (!validateSchema(map)) {
    for (const e of validateSchema.errors) {
      problems.push({ code: "schema", severity: "error", path: e.instancePath || "$", message: e.message });
    }
  }
  problems.push(...checkFeatureMap(map));
  return problems;
}

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`✗ ${msg}`);
};

const mustPass = [...jsonFiles(join(SKILL, "examples")), ...jsonFiles("tests/fixtures/valid")];
for (const file of mustPass) {
  const errors = problemsFor(file).filter((p) => p.severity === "error");
  if (errors.length) {
    fail(`${file} should be valid but has ${errors.length} error(s):`);
    errors.forEach((e) => console.error(`    [${e.code}] ${e.path}: ${e.message}`));
  } else {
    console.log(`✓ ${file}`);
  }
}

for (const file of jsonFiles("tests/fixtures/invalid")) {
  const name = basename(file, ".json");
  const expected = name.startsWith("schema-") ? "schema" : name;
  const codes = new Set(problemsFor(file).filter((p) => p.severity === "error").map((p) => p.code));
  if (codes.has(expected)) {
    console.log(`✓ ${file} rejected with [${expected}]`);
  } else {
    fail(`${file} should be rejected with [${expected}], got: ${[...codes].join(", ") || "no errors"}`);
  }
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${mustPass.length} valid file(s) pass and every invalid fixture is rejected.`);
