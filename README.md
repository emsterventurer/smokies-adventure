# Adventure Companion — Commit #013

## Family Release Candidate — Milestone 2 Frozen

Commit #013 is the final feature build for Milestone 2.

### Column-first Smart Stop Cards

On desktop, stop cards now read:

1. Down the left column
2. Then from the top of the right column

Columns are balanced automatically:

- 8 stops → 4 + 4
- 7 stops → 4 + 3
- 5 stops → 3 + 2

On phones, stop cards remain one continuous vertical timeline.

### Family-release polish

- Chronological numbering remains continuous across columns
- A visible continuation cue appears after the first desktop column
- Final Wyndham cards are visually distinct
- Final route message says the family is done for the day
- Build badge identifies Commit #013
- Milestone 2 is labeled Frozen

### Feature freeze

After publishing this build:

- Add no new Milestone 2 features
- Record findings with Feedback Mode
- Fix only release blockers, bugs, and approved cosmetic defects
- Number fixes as Commit #013.1, #013.2, and so forth
- Tag the approved family version as `milestone-2-family-release`

### Testing

Use `MILESTONE_2_TEST_SCRIPT.md`, included in this package, for the complete desktop, phone, offline, navigation, reservation, persistence, and family-usability test.

## Publish

Upload every file to the root of the existing `smokies-adventure` repository, replacing the current files.

Suggested commit message:

`Commit #013 — Freeze Milestone 2 Family Release Candidate`
