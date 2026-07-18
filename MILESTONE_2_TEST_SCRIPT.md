# Adventure Companion
## Milestone 2 Family Release Test Script

**Build under test:** Commit #013  
**Release status:** Family Release Candidate  
**Feature status:** Milestone 2 Frozen  
**Testing devices:** Desktop browser and installed phone app

---

# 1. How to Freeze Milestone 2

After uploading Commit #013:

1. In GitHub, commit the files with:
   `Commit #013 — Freeze Milestone 2 Family Release Candidate`
2. Wait for GitHub Pages to finish deploying.
3. Confirm the visible build badge reads **Commit #013**.
4. Do not add new Milestone 2 features during release testing.
5. Record defects using Feedback Mode.
6. Classify each finding:
   - **Release blocker:** app cannot load, navigation is wrong, data is missing, or progress is lost.
   - **Important bug:** feature works incorrectly but the app remains usable.
   - **Cosmetic issue:** spacing, wording, alignment, or visual polish.
   - **Future idea:** useful enhancement that belongs in Milestone 3 or later.
7. Fix only release blockers, important bugs, and agreed cosmetic defects.
8. Number any fixes as **Commit #013.1, #013.2,** and so on.
9. Once all release blockers are closed, add a GitHub tag or release named:
   `milestone-2-family-release`
10. Treat that tagged version as the family-sharing version.

A feature freeze does not mean the app can never change. It means no new features are added until release testing is complete.

---

# 2. Test Result Key

Mark each test:

- **PASS** — works exactly as expected
- **FAIL** — does not work
- **PARTIAL** — works, but not completely
- **N/A** — not applicable on this device

For every failure, capture:

- Device
- Browser
- Screen or trip day
- What you tapped
- What happened
- What you expected
- Screenshot, when useful

Use the app's 📝 Feedback Mode to save the finding.

---

# 3. Deployment and Version Test

## Desktop

- [ ] Open the GitHub Pages website.
- [ ] The page loads without an error or blank screen.
- [ ] The upper-right badge is visible.
- [ ] The badge says **Commit #013**.
- [ ] Tapping the badge opens build details.
- [ ] Build details say **Milestone 2 — Frozen** or equivalent.
- [ ] Close the build panel.
- [ ] Refresh the page.
- [ ] The app still loads normally.

## Phone

- [ ] Open the installed Adventure Companion app.
- [ ] The badge is visible and says **Commit #013**.
- [ ] No old Commit #012 content remains.
- [ ] Close and reopen the app.
- [ ] The current build still appears.

If an old build appears:

1. Close the app fully.
2. Reopen it.
3. Use the update prompt when shown.
4. Refresh the browser version.
5. Only as a last resort, remove and reinstall the Home Screen app.

---

# 4. Home and Branding Test

- [ ] Adventure Companion name appears correctly.
- [ ] The tagline reads: **Making New Traditions. One adventure at a time.**
- [ ] Logo and icons display.
- [ ] No broken-image symbols appear.
- [ ] Text is readable without overlapping.
- [ ] Main navigation is understandable without instructions.
- [ ] The Smoky Mountains trip dates are correct: August 7–14, 2026.
- [ ] Family theme and visual style feel consistent.

---

# 5. Daily Dashboard Test

Test every trip day from August 7 through August 14.

For each day:

- [ ] Open the day.
- [ ] Correct date and day number appear.
- [ ] Daily focus appears.
- [ ] Departure or first-event guidance appears.
- [ ] Reservation summary is accurate.
- [ ] Pace guidance appears.
- [ ] Sunset information appears where expected.
- [ ] No content from another day appears.
- [ ] Back navigation returns to the correct screen.

Record the result for each day:

| Day | Date | Result | Notes |
|---|---|---|---|
| 1 | Aug 7 |  |  |
| 2 | Aug 8 |  |  |
| 3 | Aug 9 |  |  |
| 4 | Aug 10 |  |  |
| 5 | Aug 11 |  |  |
| 6 | Aug 12 |  |  |
| 7 | Aug 13 |  |  |
| 8 | Aug 14 |  |  |

---

# 6. Smart Stop Card Test

## Desktop layout

For at least three days with different numbers of stops:

- [ ] Stop cards appear in two columns.
- [ ] Reading order goes **down the left column first**.
- [ ] The route then continues at the top of the right column.
- [ ] Numbering remains chronological.
- [ ] A seven-stop day balances as 4 + 3.
- [ ] An eight-stop day balances as 4 + 4.
- [ ] Cards do not overlap or get cut off.
- [ ] The “Continue” cue appears after the first column.
- [ ] The final Wyndham card is visually distinct.
- [ ] The final card says the day is complete.

## Phone layout

- [ ] Cards appear in one vertical column.
- [ ] Card numbers remain chronological.
- [ ] No desktop-style side-by-side columns appear.
- [ ] Buttons fit without being cut off.
- [ ] Text remains readable at normal phone zoom.

---

# 7. Complete Daily Route Test

Check every applicable day.

- [ ] The day begins at the expected starting point.
- [ ] Stops are in the intended chronological order.
- [ ] The final planned destination is correct.
- [ ] Every applicable full day ends with **Club Wyndham Smoky Mountains**.
- [ ] Arrival day routes to Wyndham appropriately.
- [ ] Departure day does not incorrectly route back to Wyndham after leaving for home.
- [ ] Day 3 includes a final Wyndham return after dinner.
- [ ] Day 5 includes a final Wyndham return after the evening activity.
- [ ] Day 6 includes a final Wyndham return after Old Mill or the final stop.

---

# 8. Navigation Link Test

Test at least one morning, afternoon, dinner, and Wyndham-return card.

For each selected card:

## Waze

- [ ] Tap **Waze**.
- [ ] Waze opens or offers to open.
- [ ] Destination name is correct.
- [ ] Route begins from the current location.

## Google Maps

- [ ] Tap **Google Maps**.
- [ ] Google Maps opens.
- [ ] Destination is correct.
- [ ] No unrelated place with the same name is selected.

## Next Stop

- [ ] Tap **Next**.
- [ ] Origin is the current planned stop.
- [ ] Destination is the next chronological stop.
- [ ] The next-stop name shown on the button is correct.
- [ ] Final card does not offer a nonexistent next stop.

Important: manually inspect every unique destination at least once before family release.

---

# 9. Reservation Center Test

Check all reservation cards.

- [ ] Reservation Center appears only on relevant days.
- [ ] Local Goat shows Aug 7 at 6:00 PM and Confirmed.
- [ ] Wild Plum displays its current contacted or confirmation-needed status.
- [ ] Park Grill displays Pending until booked.
- [ ] Seasons 101 shows Aug 9 at 6:00 PM and Confirmed.
- [ ] Dollywood displays tickets purchased.
- [ ] Forbidden Caverns status is accurate.
- [ ] Rocky Top Mountain Coaster status is accurate.
- [ ] Zipline shows Aug 12 at 10:30 AM and Confirmed.
- [ ] Aquarium correctly indicates whether tickets are still needed.
- [ ] Greenbrier shows Aug 13 at 6:15 PM and Confirmed.
- [ ] Wyndham lodging dates are correct.
- [ ] Confirmation placeholders do not expose private information publicly.
- [ ] Website buttons open the correct official website.
- [ ] Copy Details copies useful information.
- [ ] Status colors are understandable and readable.

---

# 10. Progress Trail Test

- [ ] Mark Day 1 complete.
- [ ] Progress Trail updates.
- [ ] Mark another day complete.
- [ ] Progress total increases correctly.
- [ ] Refresh the app.
- [ ] Completed days remain completed.
- [ ] Close and reopen the phone app.
- [ ] Completed days remain completed.
- [ ] Unmark a completed day.
- [ ] Progress decreases correctly.
- [ ] No unrelated day changes.

---

# 11. Trip Readiness Test

- [ ] Trip Readiness section appears.
- [ ] Current percentage is visible.
- [ ] Completed and open items are distinguishable.
- [ ] Check one open item.
- [ ] Percentage increases.
- [ ] Item changes to Ready.
- [ ] Refresh the page.
- [ ] The changed item remains saved.
- [ ] Uncheck the item.
- [ ] Percentage decreases.
- [ ] Weather is clearly identified as intentionally pending for Milestone 3.
- [ ] Readiness list is usable on phone and desktop.

---

# 12. Feedback Mode Test

- [ ] Tap the floating 📝 button.
- [ ] Feedback panel opens.
- [ ] Choose **Bug**.
- [ ] Enter a screen name.
- [ ] Enter a test note.
- [ ] Choose a star rating.
- [ ] Save the note.
- [ ] Confirmation appears.
- [ ] Reopen Feedback Mode.
- [ ] Tap **View saved notes**.
- [ ] The saved note appears.
- [ ] Build version is associated with the note.
- [ ] Clear the test note.
- [ ] Saved list becomes empty.

Remember: feedback is stored only on the device where it was entered.

---

# 13. Update and Cache Test

This test requires publishing a small approved bug-fix build later, so initially mark it N/A.

- [ ] Existing app detects a newer service worker.
- [ ] Update prompt appears.
- [ ] Refresh Now loads the new build.
- [ ] Updated build badge is correct.
- [ ] Dismiss Update closes the message.
- [ ] App does not repeatedly reload.
- [ ] No stale mix of old and new files appears.

---

# 14. Offline Test

First open the app online and visit several trip days.

## Desktop

- [ ] Turn off Wi-Fi or use browser offline mode.
- [ ] Reload the app.
- [ ] Home screen loads.
- [ ] Previously visited days load.
- [ ] Stop cards remain visible.
- [ ] Reservation cards remain visible.
- [ ] Progress and readiness data remain available.
- [ ] External map and website links appropriately require internet.

## Phone

- [ ] Open the installed app while online.
- [ ] Turn on airplane mode.
- [ ] Reopen the app.
- [ ] Core itinerary remains usable.
- [ ] No permanent blank screen appears.
- [ ] Restore internet afterward.

---

# 15. Responsive Layout Test

Test these widths where possible:

- Phone portrait
- Phone landscape
- Tablet portrait
- Desktop narrow window
- Desktop full screen

At each size:

- [ ] No horizontal scrolling is required.
- [ ] No buttons overlap.
- [ ] Text is not clipped.
- [ ] Badge and feedback button do not cover important controls.
- [ ] Panels can be closed.
- [ ] Reservation cards remain readable.
- [ ] Smart stop chronology remains clear.
- [ ] Trip Readiness remains readable.

---

# 16. Accessibility and Ease-of-Use Test

- [ ] Buttons have clear labels.
- [ ] Text contrast is comfortable.
- [ ] Important information is not communicated by color alone.
- [ ] Tap targets are large enough on phone.
- [ ] Keyboard Tab navigation works reasonably on desktop.
- [ ] Visible focus appears when tabbing.
- [ ] Panels can be closed without confusion.
- [ ] A family member can identify the next stop without explanation.
- [ ] A family member can return to Wyndham without asking you.
- [ ] A family member can find a dinner reservation without asking you.
- [ ] A family member understands what is confirmed versus pending.

---

# 17. Family Usability Test

Ask one family member who did not help build the app to complete these tasks without coaching:

1. Find the Dollywood day.
2. Identify what time the family should leave.
3. Open navigation to Dollywood.
4. Find the zipline reservation time.
5. Find the Greenbrier dinner reservation.
6. Identify the final stop on Day 6.
7. Mark one day complete.
8. Find an item that is still open in Trip Readiness.
9. Submit one feedback note.

Pass criteria:

- [ ] They complete all tasks without being told where to tap.
- [ ] They do not misunderstand the card reading order.
- [ ] They recognize the Wyndham return card.
- [ ] They understand confirmed versus pending reservations.
- [ ] They can return to the main screen.
- [ ] They describe the app as easy enough to use during the trip.

---

# 18. Content Accuracy Review

Before release, compare the app with actual confirmations and current plans.

- [ ] Lodging dates
- [ ] Restaurant names, dates, and times
- [ ] Zipline date and time
- [ ] Dollywood day
- [ ] Aquarium day
- [ ] Forbidden Caverns plan
- [ ] Coaster evening
- [ ] Trip start and departure dates
- [ ] Every destination spelling
- [ ] Wyndham property name
- [ ] Any ticket status
- [ ] Any pending booking status
- [ ] Parking notes
- [ ] Family-facing wording

Do not add private confirmation numbers to a public repository.

---

# 19. Release Decision

Milestone 2 is ready for family release only when:

- [ ] No release blockers remain.
- [ ] All eight trip days open correctly.
- [ ] Navigation links have been verified.
- [ ] Every applicable day returns to Wyndham.
- [ ] Reservations are accurate.
- [ ] Progress persists.
- [ ] Readiness persists.
- [ ] Phone installation works.
- [ ] Offline core content works.
- [ ] Desktop column-first order is clear.
- [ ] Phone single-column order is clear.
- [ ] At least one family member passes the usability test.
- [ ] Final content review is complete.

## Final sign-off

**Desktop tested by:** ____________________  
**Phone tested by:** ____________________  
**Family tester:** ____________________  
**Date:** ____________________  

**Release decision:**  
- [ ] APPROVED FOR FAMILY  
- [ ] APPROVED WITH MINOR KNOWN ISSUES  
- [ ] NOT YET APPROVED  

**Known issues accepted for release:**

____________________________________________________________

____________________________________________________________
