Adventure Companion Release Archive
This directory preserves historical release documentation, validation records, manual test scripts, and prior change-package instructions while keeping the repository root focused on the current production application.
Current production baseline
M3-04.4C — Experience Completion
The `M3-04.4C/` directory contains the documentation that accompanied the production release captured on July 21, 2026.
Historical records
Earlier records are organized under `history/` by milestone or build. Two different efforts used the M3-04.1 label, so the archive distinguishes them as:
`M3-04.1-packing/`
`M3-04.1-dashboard/`
This naming distinction changes only the archive folders; the original document filenames and contents are preserved.
Known legacy anomalies
Some historical files were named inaccurately when created. They are preserved rather than rewritten:
`history/M3-04.3/BASELINE_ACCEPTANCE.md` contains a JavaScript source snapshot rather than an acceptance report.
`history/M3-04.3/COMMIT_013_2_REGRESSION_TEST.md` contains a changed-files record rather than a regression test.
The repository audit documents these anomalies so future contributors do not mistake them for current instructions.
Change packages
Future change packages continue to include package-level copies of:
`README_FIRST.md`
`CHANGED_FILES.md`
After a release is finalized, its historical copies may be archived under that release directory.
Source of truth
Git commits and release tags remain the authoritative code history. This archive supplements that history with human-readable context and testing records.
