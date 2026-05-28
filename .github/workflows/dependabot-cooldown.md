---
description: |
  Enforces npm publish cooldown on Dependabot pull requests. For each package bumped
  in the PR, fetches its publish date from the npm registry and compares it against
  cooldown.default-days configured in .github/dependabot.yml. Posts a REQUEST_CHANGES
  review listing violations; supersedes any prior blocking review when all packages
  comply. Triggered automatically on Dependabot PRs and on demand via
  /dependabot-cooldown on any PR.

on:
  pull_request:
    types: [opened, reopened, synchronize]
  slash_command:
    name: dependabot-cooldown
  reaction: eyes

if: github.repository_owner == 'rancher' || vars.ENABLE_AGENTIC_WORKFLOWS == 'true'

permissions: read-all

network: defaults

safe-outputs:
  submit-pull-request-review:
    allowed-events: [REQUEST_CHANGES, COMMENT]
    supersede-older-reviews: true
  add-labels:
    allowed: [bot/dependency-cooldown]
  remove-labels:
    allowed: [bot/dependency-cooldown]

tools:
  web-fetch:
  bash: true
  github:
    min-integrity: none

timeout-minutes: 10

engine: copilot
---

# Dependabot Cooldown Check

You enforce npm publish cooldown periods on Dependabot pull requests. Verify that every
npm package bumped in the PR was published long enough ago to satisfy the cooldown window
in `.github/dependabot.yml`.

## Step 1 — Determine the PR and verify scope

- If triggered by `slash_command`: the PR number is `${{ github.event.issue.number }}`.
  Confirm it is a pull request, not a plain issue. If it is not a PR, post a comment
  saying "This command only works on pull requests." and stop.

- If triggered by `pull_request`: the PR author is
  `${{ github.event.pull_request.user.login }}`. If the author does not start with
  `dependabot`, stop without posting a review.

## Step 2 — Read the cooldown configuration

Read `.github/dependabot.yml` and find the `package-ecosystem: npm` entry. Extract:

- `cooldown.default-days` (default to `7` if absent)
- `cooldown.semver-patch-days` (optional per-type override)
- `cooldown.semver-minor-days` (optional per-type override)

## Step 3 — Find bumped npm package versions

Compare the base and head versions of every `package.json` changed in the PR (excluding
`node_modules`). Collect every package where the version changed, stripping any leading
range specifiers (`^`, `~`, `>=`, etc.) to get the bare version. Skip entries that are
not semver (e.g. `workspace:*`, `file:`, `git+`).

If no `package.json` files changed, or no version bumps are found, stop without posting
a review.

## Step 4 — Check npm registry publish dates

For each bumped package, fetch its metadata from `https://registry.npmjs.org/<package>`
and read the publish timestamp for the specific version from the `time` field. Calculate
its age in whole days from today. If the registry cannot be reached or the version has no
publish time, log a warning and skip that package — do not treat it as a violation.

## Step 5 — Determine violations

Select the applicable threshold for each package:
- Patch bump: use `semver-patch-days` if configured, otherwise `default-days`
- Minor bump: use `semver-minor-days` if configured, otherwise `default-days`
- Major or ambiguous bump: use `default-days`

A package **violates** the cooldown when its age in days is less than the threshold.

## Step 6 — Post the review

**If there are violations**, submit a `REQUEST_CHANGES` review listing each offending
package in a table with its version, publish date, current age, and required age.
Inform the author that they can re-run this check by commenting `/dependabot-cooldown`
once the cooldown has elapsed. Add the label `bot/dependency-cooldown` to the PR.

**If there are no violations**:
- Remove the label `bot/dependency-cooldown` from the PR if it is present.
- If triggered by `slash_command`: submit a `COMMENT` review confirming all packages
  comply. The `supersede-older-reviews` setting will automatically dismiss any prior
  blocking review from this workflow.
- If triggered by `pull_request` and all packages passed on first check: take no action —
  the passing workflow run is sufficient signal.
