# Adventure Companion — Commit #009

## Milestone 2, Part 2: Smart Stop Cards & Navigation

This build adds:

- Smart stop cards for all eight adventure days
- Stop time, purpose, expected duration, and practical tip
- One-tap Waze navigation for every destination
- One-tap Google Maps search for every destination
- Google stop-to-stop driving links connecting each planned stop to the next
- A visual numbered route through each day
- Clear end-of-route status on the final stop
- Updated Daily Adventure and Companion language

## Navigation behavior

- **Waze** opens the destination and routes from the phone’s current location.
- **Google Maps** opens the selected place.
- **Next: ...** opens driving directions from the current planned stop to the following planned stop.

The destination links use place searches rather than fragile coordinates so they remain useful if a business entrance or listing changes.

## Publish

Upload every file in this folder to the root of the existing `smokies-adventure` repository and replace the prior versions.

Suggested commit message:

`Commit #009 — Smart Stop Cards & Navigation`

GitHub Pages should redeploy automatically after the commit reaches the publishing branch.
