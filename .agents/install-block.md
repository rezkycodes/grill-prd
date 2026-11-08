# The canonical install block

One install story, one wording. `README.md` and every page under `docs/` must say **this** and nothing else. Change it here first, then propagate.

## Claude Code (plugin)

Claude Code installs from this repo's own marketplace, `.claude-plugin/marketplace.json`. Updates are picked up when the `version` in `.claude-plugin/plugin.json` changes.

<canonical-block name="claude-code">

```
/plugin install grill-prd --marketplace rezkycodes/grill-prd
```

Run this inside Claude Code (Claude Code 2.1.275 or later).

</canonical-block>

## Every other agent (skills.sh)

skills.sh copies editable skill files into your project. Run `update` to pull changes, and re-run `add` to pick up new skills.

<canonical-block name="skills-sh">

```bash
npx skills@latest add rezkycodes/grill-prd -a claude-code
```

```bash
npx skills@latest update grill-prd
```

</canonical-block>

## The two routes are exclusive

The plugin is a managed, read-only bundle. skills.sh writes files you own and edit. Installing both leaves you with the skill twice: pick one.
