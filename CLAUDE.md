Skills are organized into bucket folders under `skills/`:

- `engineering/`: daily code work (none yet)
- `productivity/`: daily non-code workflow tools (`grill-prd`)

Every skill in `engineering/` or `productivity/` (the **promoted** buckets) must have a reference in the top-level `README.md` and an entry in `.claude-plugin/plugin.json`'s `skills` array. The Claude Code plugin ships exactly the promoted set. Retired skills are deleted, not moved to a bucket, and the changeset that removes one names its replacement.

Install commands are copied verbatim from [.agents/install-block.md](./.agents/install-block.md). `.claude-plugin/marketplace.json` is the repo's own marketplace. Run `claude plugin validate . --strict` after touching either manifest.

Each skill entry in the top-level `README.md` must link the skill name to its `SKILL.md`.

Each bucket folder has a `README.md` that lists every skill in the bucket with a one-line description, with the skill name linked to its `SKILL.md`. Promoted bucket `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**.

Skills in `engineering/` and `productivity/` also have a docs page at `docs/<bucket>/<skill-name>.md`. When you add, rename, or change the behaviour of a promoted skill, create or re-sync its docs page following [.agents/writing-docs.md](./.agents/writing-docs.md).

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true` plus `policy.allow_implicit_invocation: false` in `agents/openai.yaml`) or model-invoked (the default). See [.agents/invocation.md](./.agents/invocation.md).

Every skill that dispatches a subagent says to start it with a fresh context window.

To (re)link every skill into the local harness skill directories (`~/.claude/skills`, `~/.agents/skills`), run `scripts/link-skills.sh`. Each entry is a symlink into this repo, so a `git pull` keeps installed skills current. Re-run the script after adding, removing, or renaming a skill.

## Versioning

Changes are recorded with changesets (`npm run changeset`). The Release workflow opens a "chore: version skills" pull request, which runs `npm run version`. That command bumps `package.json` and copies the version into `.claude-plugin/plugin.json` (`scripts/sync-plugin-version.mjs`). Do not edit the `version` field in `plugin.json` by hand.

## Agent skills

### Triage labels

Canonical names, unchanged. Issues are judged against [`SCOPE.md`](./SCOPE.md).
