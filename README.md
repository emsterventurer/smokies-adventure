# Adventure Companion — Commit #010

## Development Mode & Update Prompt

This build adds:

- A visible development badge showing the current commit
- Tap-to-expand build information
- Automatic service-worker update checks whenever the app opens
- An “Adventure Companion has an update” notification
- A one-tap **Refresh now** button
- Automatic reload after the new service worker takes control
- Improved cache handling so new builds appear more reliably
- Offline fallback retained

## Current build

- Version: Commit #010
- Feature: Development Mode & Update Prompt
- Updated: July 18, 2026

## Publish

Upload every file in this folder to the root of the existing `smokies-adventure` repository and replace the previous versions.

Suggested commit message:

`Commit #010 — Development Mode & Update Prompt`

GitHub Pages should redeploy automatically.

## Phone behavior

After this build is live:

1. Open Adventure Companion from the phone's Home Screen.
2. The badge should show **Commit #010**.
3. On future deployments, the app checks for a new service worker.
4. When a new build is detected, tap **Refresh now**.

The development badge can be removed or hidden before the family launch.
