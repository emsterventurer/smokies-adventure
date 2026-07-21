# Changed Files — Build Commit M3-04.3 Final Production Release

- `packing.js` — preserves the 60-item legacy ID map and appends seven approved packing items.
- `packing.test.js` — verifies the legacy ID map, saved-progress compatibility, and all seven additions.
- `app.js` — uses the final M3-04.3 build identity and removes the stale Build 004.2 validation comment.
- `index.html` — displays M3-04.3, Packing & Adventure Polish, and July 21, 2026 consistently in metadata and the build panel.
- `service-worker.js` — advances the cache and build identity to M3-04.3.
- `.github/workflows/quality-checks.yml` — runs all repository checks and verifies version, feature text, build date, packing additions, and removal of the stale 004.2 marker.
- `README_FIRST.md` — provides final GitHub upload instructions.
- `FINAL_RELEASE_NOTES.md` — documents the release scope and validation.
- `CHANGED_FILES.md` — this file.
