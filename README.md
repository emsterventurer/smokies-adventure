# Adventure Companion

**A family adventure-planning and memory platform designed to reduce stress, celebrate progress, preserve memories, and grow with our family for years to come.**

## Current Production Release

**M3-04.4C — Experience Completion**

Adventure Companion currently supports the family's August 7–14, 2026 Smoky Mountains adventure, based in Sevierville, Tennessee.

### Current experiences

- Daily Adventure dashboards and chronological Smart Stops
- Weather, adaptive guidance, and reliability diagnostics
- Reservation and booking details
- Individual packing for Emily, Jake, Kaseryn, Bubbe, and Papa
- Adventure phases, readiness milestones, and progress tracking
- Individual Adventure Ready celebrations before the family celebration
- Remy's Corner and Campfire experiences
- Progressive Web App and offline application-shell support

## Adventurers

The current adventure includes Emily, Jake, Kaseryn, Bubbe, and Papa. Bubbe and Papa are full adventurers and receive the same individual planning, packing, progress, and celebration consideration as everyone else.

## Project Philosophy

Every feature should support one or more of these goals:

1. Reduce stress.
2. Celebrate progress.
3. Preserve memories.
4. Grow with our family for years to come.

Individual accomplishments are celebrated before family accomplishments.

## Important Itinerary Rule

**Cades Cove is intentionally excluded and must not be added to the itinerary, recommendations, or future examples for this adventure.**

## Technology

Adventure Companion is a static Progressive Web App built with HTML, CSS, JavaScript, local browser storage, a service worker, GitHub Actions, and GitHub Pages. The project intentionally remains compatible with static hosting.

## Repository Guide

- Production application files currently remain in the repository root.
- Automated JavaScript tests remain beside the application during M3-05.0 modernization.
- Historical release records are stored under [`docs/releases/`](docs/releases/).
- The exact M3-05.0A repository audit is stored in [`docs/repository/REPOSITORY_AUDIT.md`](docs/repository/REPOSITORY_AUDIT.md).
- Notable project changes are summarized in [`CHANGELOG.md`](CHANGELOG.md).

## Development Standards

Every build must complete:

1. Code review
2. Automated testing
3. Manual visual verification

Changes are delivered through focused change packages rather than full-project ZIP replacements. Each change package includes `README_FIRST.md` and `CHANGED_FILES.md`. GitHub Pages or the live deployment is not considered verified until Emily confirms it after deployment.

## Current Modernization Work

**M3-05.0 — Foundation Modernization**

M3-05.0A organizes project history and establishes durable documentation without intentionally changing application behavior. Later sub-builds will address architecture, version management, and the long-term Adventurer foundation.
