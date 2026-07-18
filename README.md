# Adventure Companion — Commit #013.1

## Milestone 2 Bug-Fix Release

This build addresses the findings from the Commit #013 release test.

### Fixed

- **Start Adventure** now dismisses the welcome screen.
- **Don’t show this again** still dismisses the welcome screen and saves the preference.
- Reservation **Copy Details** now uses a clipboard fallback when needed.
- Copying shows a visible confirmation toast.
- Reservation placeholders now clearly identify private details that should be added locally rather than committed publicly.

### Added

- Optional **Anakeesta** Smart Stop Card on August 13.
- The card is visually marked as optional and should be used only when weather, timing, and family energy are favorable.

### Freeze status

Milestone 2 remains frozen. This is a bug-fix release, not a new feature milestone.

Suggested commit message:

`Commit #013.1 — Fix release-test findings`
