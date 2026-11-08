# Contributing

Every issue is judged against the bar in [`SCOPE.md`](./SCOPE.md). Read it first.

## Where each request goes

| You have | Go to |
| --- | --- |
| A bug in the skill | [Bug issue](https://github.com/rezkycodes/grill-prd/issues/new?template=bug.yml) |
| A change to the existing skill | [Idea or feedback issue](https://github.com/rezkycodes/grill-prd/issues/new?template=idea.yml) |
| A question, or "how do I...?" | [Discussions](https://github.com/rezkycodes/grill-prd/discussions) |
| A new skill idea | [Discussions](https://github.com/rezkycodes/grill-prd/discussions), after you read [`.out-of-scope/`](./.out-of-scope) |

Pull requests are open to collaborators only, so describe the fix in an issue first.

## Local setup

```bash
npm ci                         # installs the changesets CLI
npm run changeset              # describe a change for the next release
bash scripts/list-skills.sh    # list every SKILL.md in the repo
```

## Issues written with AI

Agents are welcome to help, but you post the issue, so you own it:

- **One problem per issue.** Several findings from one session are several issues, or none.
- **Short.** If it does not fit on one screen, cut it.
- **Repro first.** The steps that show the problem come before any analysis.
- **No pasted specs.** No full proposals, plans, or rewritten `SKILL.md` files. Describe the problem; the fix is ours to design.
