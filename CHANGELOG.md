# Changelog

All notable changes to Adventure Companion are documented in this file.

Adventure Companion uses milestone-based release names. Detailed release records and historical manual test scripts are preserved under `docs/releases/`.

## [Unreleased]

### Added

### Changed

### Fixed

## [M3-05.0A] - 2026-07-22

### Added

- Professional root `CHANGELOG.md`.
- Exact repository audit and approved file-move map.
- Indexed historical release archive under `docs/releases/`.

### Changed

- Replaced the outdated M3-02.5 repository README with a current project overview.
- Moved historical release and test documentation out of the repository root while preserving its original contents.

### Removed

- Obsolete empty root file `download`.
- Obsolete root copy of `quality-checks.yml`; the active workflow remains at `.github/workflows/quality-checks.yml`.

### Runtime impact

- None intended. Production HTML, CSS, JavaScript, manifest, service worker, images, automated tests, and the active GitHub Actions workflow are unchanged.

## [M3-04.4C] - 2026-07-21

### Added

- Visible Remy's Corner and Family Adventure Readiness dashboard experiences.
- Individual packing completion celebrations for Emily, Jake, Kaseryn, Bubbe, and Papa.
- Family completion celebration after all five individual adventurers are ready.
- First Campfire story unlock and experience-completion regression coverage.

### Changed

- Advanced application and service-worker identity to M3-04.4C — Experience Completion.

## [M3-04.4B] - 2026-07-21

### Added

- Packing completion celebration, personalized Adventure Ready states, confetti, and first Remy's Campfire experience.
- Friendlier loading, success, and diagnostic states.

### Changed

- Polished transitions, button feedback, accessibility, Adventure Phase animation, and Smart Stops initialization handling.

## [M3-04.4A]

### Added

- Startup Health Check, Diagnostics Panel, build/cache visibility, friendly startup errors, and reliability regression checks.

## [M3-04.3] - 2026-07-21

### Changed

- Added daily medication packing items for Jake and Kaseryn.
- Added rain jackets or light waterproof shells for all five adventurers.
- Preserved existing packing IDs and saved progress.

## [M3-04.2]

### Added

- Trip-specific packing priorities, activity filters, and reasons.
- Daily Dashboard weather using the supported forecast window.

### Changed

- Smart Stop Cards became the primary chronological itinerary experience.
- Parking, food, photo, Weather, and Plan B guidance were consolidated into the day experience.

## [M3-04.1]

### Added

- Family Packing foundation for Emily, Jake, Kaseryn, Bubbe, Papa, and shared items.
- Dashboard redesign and Adventure Intelligence experiences.

## [M3-03.1]

### Added

- Live Open-Meteo weather foundation, caching, offline fallback, manual refresh, and accessible status updates.

## [M3-02.5]

### Added

- Stable Smoky Mountains adventure baseline with Daily Adventure start/return flow, drive timing, reservations, itinerary persistence, and service-worker identity.
