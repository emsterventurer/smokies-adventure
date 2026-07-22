M3-05.0A Repository Audit
Baseline: downloaded released `main` snapshot at commit `23f65ad588aa9ff851d036670f39a4cd93fc803d`  
Snapshot date: July 21, 2026  
Audit date: July 22, 2026  
Baseline inventory: 56 ZIP entries, comprising 49 root files, one root workflow copy, one active workflow, and directories.
Executive finding
The released repository is operational but its root combines production application files, automated tests, active CI, obsolete duplicates, package instructions, validation reports, and historical release records. M3-05.0A can safely modernize documentation and remove two confirmed obsolete root artifacts without changing runtime behavior.
Production application — keep in root
File	Classification	M3-05.0A action
`.nojekyll`	GitHub Pages configuration	Keep unchanged
`index.html`	Application entry point	Keep unchanged
`app.js`	Main application and itinerary logic	Keep unchanged
`styles.css`	Application styling	Keep unchanged
`packing.js`	Packing feature	Keep unchanged
`reliability.js`	Startup reliability and diagnostics	Keep unchanged
`weather-service.js`	Weather service	Keep unchanged
`weather-ui.js`	Weather interface	Keep unchanged
`service-worker.js`	Offline application shell	Keep unchanged
`manifest.webmanifest`	PWA manifest	Keep unchanged
`adventure-companion-logo.png`	Application asset	Keep unchanged
`apple-touch-icon.png`	Application asset	Keep unchanged
`favicon-32.png`	Application asset	Keep unchanged
`icon-192.png`	Application asset	Keep unchanged
`icon-512.png`	Application asset	Keep unchanged
Automated tests — keep in root for this sub-build
`daily-weather.test.js`, `dashboard-redesign.test.js`, `experience-completion.test.js`, `experience-polish.test.js`, `packing.test.js`, `reliability.test.js`, and `weather-service.test.js` remain unchanged. Test-folder reorganization is deferred because moving them would require workflow and test-path changes, exceeding this documentation-only sub-build.
Active CI — keep unchanged
`.github/workflows/quality-checks.yml` is the active GitHub Actions workflow. `reliability.test.js` explicitly reads this path. It must remain unchanged in M3-05.0A.
Confirmed obsolete artifacts — remove
File	Evidence	Action
`download`	Zero-byte file; no repository references found	Delete
`quality-checks.yml`	Older root copy differs from the active workflow and is not referenced by production or test code	Delete; retain `.github/workflows/quality-checks.yml`
Living documentation — update or add
File	Finding	Action
`README.md`	Still describes M3-02.5 despite production being M3-04.4C	Replace with current project overview
`CHANGELOG.md`	Missing	Add
`docs/releases/README.md`	Missing	Add archive index
`docs/repository/REPOSITORY_AUDIT.md`	Missing	Add this exact audit
`docs/repository/FILE_MOVE_MAP.md`	Missing	Add approved move map
Historical records — archive without rewriting
The 27 historical root Markdown files are copied to organized release folders and then removed from the root. Their contents remain byte-for-byte unchanged in the archive.
M3-04.4C
`AUDIT_REPORT.md`, `CHANGED_FILES.md`, `GITHUB_UPLOAD_INSTRUCTIONS.md`, `IMPLEMENTATION_NOTES.md`, `README_FIRST.md`, `RELEASE_NOTES.md`, and `VISUAL_QA_CHECKLIST.md`.
M3-04.3
`BASELINE_ACCEPTANCE.md`, `COMMIT_013_2_REGRESSION_TEST.md`, `FINAL_RELEASE_NOTES.md`, and `FINAL_VALIDATION_REPORT.md`.
Earlier history
M3-02.5: `COMMIT_013_1_REGRESSION_TEST.md`, `M3_02_5_TEST_SCRIPT.md`
Milestone 2: `MILESTONE_2_TEST_SCRIPT.md`
M3-01: five M3-01 manual test scripts
M3-03.1: release notes and manual test script
M3-04.1 Packing: release notes and manual test script
M3-04.1 Dashboard: release notes and manual test script
M3-04.2: release notes and manual test script
Anomalies preserved for traceability
`BASELINE_ACCEPTANCE.md` is actually a large JavaScript source snapshot labeled M3-04.3. It is not used by the application.
`COMMIT_013_2_REGRESSION_TEST.md` is actually an M3-04.3 changed-files record.
The M3-04.1 version label was used for both Packing Foundation and Dashboard Redesign. Separate archive folder names clarify the distinction without altering original documents.
Root `README_FIRST.md` and `CHANGED_FILES.md` describe the completed M3-04.4C package. They are historical release records, not permanent current repository instructions.
Reference audit
A repository-wide search found no application, test, service-worker, manifest, or active workflow references to the historical Markdown files, `download`, or the obsolete root `quality-checks.yml`. The only workflow path read by a test is `.github/workflows/quality-checks.yml`, which remains unchanged.
Runtime integrity boundary
M3-05.0A intentionally does not modify any `.html`, `.css`, `.js`, `.png`, `.webmanifest`, `.nojekyll`, or active `.github/workflows/` file. Therefore no application, storage, itinerary, celebration, PWA, or deployment behavior is intentionally changed.
Deferred work
JavaScript and CSS architecture changes
Moving tests into a `tests/` directory
Version source-of-truth implementation
CI modernization
Adventurer data-model implementation
Service-worker restructuring
These belong to later reviewed M3-05.0 sub-builds.
