# New skill proposals

This repo ships one skill, `grill-prd`. Proposals for other skills are out of scope here.

## Why this is out of scope

Every skill is permanent maintenance surface: it has to stay in step with the docs page, the README, and the plugin manifest. If a behaviour can be composed from `grill-prd` and your own prompts, it does not need a new skill.

You are welcome to publish a skill of your own in your own repo, for example with `npx skills init`.

This covers *new* skills only. A concrete failure in `grill-prd` is judged against the bar in [`SCOPE.md`](../SCOPE.md) like any other issue.
