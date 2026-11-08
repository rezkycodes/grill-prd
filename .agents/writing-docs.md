# Writing docs pages

Every skill in `skills/productivity/` (and any future promoted bucket) has a human-facing **docs page** at `docs/<bucket>/<skill-name>.md`. The docs tree mirrors the bucket folders under `skills/`. The page is not the skill and not a copy of `SKILL.md`. Its job is to orient a reader so they know when to reach for the skill.

Act whenever a skill is added, renamed, moved between buckets, or has its behaviour changed: create or re-sync its docs page. A rename moves the file too. A promoted skill that is removed keeps its page, marked archived with a blockquote (`> **Archived.** ...`) naming the version it was removed in.

Links on docs pages are absolute (`https://github.com/rezkycodes/grill-prd/...`), so they keep working outside the repo.

## Page structure

Keep this order. Delete a section only if it does not apply.

1. **What it does**: one or two plain paragraphs. Lead with the one-sentence job, then the defining constraint: the fact that makes this skill behave differently from the obvious default.
2. **When to reach for it**: state the invocation mode (typed by you, or reached for automatically) and the trigger boundary: "reach for this when …".
3. **Prerequisites** (optional): anything it writes into or needs in place.
4. **Common questions** (optional): real questions, each in bold with the answer beneath. Size the section to what you actually know. Do not pad it.
5. **It's working if**: a few bullets a reader can check without opening `SKILL.md`.
6. **Where it fits**: the skill's role in the set and its neighbours.

## Conventions

- Explain the **why**, not the process. Do not reproduce the `SKILL.md` steps.
- Use the skill's own vocabulary (for `grill-prd`: _design tree_, _branch_, _feature map_, _Definition of Ready_).
- Branches (several cases, several outputs) go in a table or a list, not a paragraph.
- Do not put install commands on a docs page. Link to the README install section instead.
