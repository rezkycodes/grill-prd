# Model-invoked vs user-invoked

Every `SKILL.md` in this repo is a skill. The one axis that splits them is **invocation**: who can reach it.

- **User-invoked**: reachable **only by the human typing its name**. Set `disable-model-invocation: true` in the frontmatter (Claude Code) and `policy.allow_implicit_invocation: false` in `agents/openai.yaml` (Codex). The `description` is human-facing and short. Strip trigger lists.
- **Model-invoked**: reachable by model or user. The default: omit `disable-model-invocation` and the `policy` block. The `description` is model-facing and keeps rich trigger phrasing ("Use when the user wants…") so auto-invocation fires.

Every skill carries an `agents/openai.yaml` beside its `SKILL.md` with the Codex UI metadata (`interface.display_name`, `interface.short_description`). For user-invoked skills, it also holds the `policy` block. Keep the two harnesses in sync: a skill is user-invoked in both or neither.

Bucket `README.md`s and the top-level `README.md` group entries into **User-invoked** and **Model-invoked**.
