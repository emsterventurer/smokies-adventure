# Visual QA Checklist

Complete this on the branch preview before merging.

## Dashboard
- [ ] Home shows a clearly visible **Remy’s Corner** card.
- [ ] Home shows **Family Adventure Readiness** with Emily, Jake, Kaseryn, Bubbe and Papa.
- [ ] Both cards are readable on desktop and phone width.
- [ ] Remy’s Corner opens when selected.

## Remy’s Corner
- [ ] Today’s Thought is visible.
- [ ] Adventure Phase is visible.
- [ ] Campfire Stories section is visible.
- [ ] Before family completion, “The Journey Begins” is locked.

## Individual packing celebrations
For each traveler, complete only that traveler’s list and verify:
- [ ] Emily receives one personalized celebration.
- [ ] Jake receives one personalized celebration.
- [ ] Kaseryn receives one personalized celebration.
- [ ] Bubbe receives one personalized celebration.
- [ ] Papa receives one personalized celebration.
- [ ] Confetti appears unless reduced motion is enabled.
- [ ] Closing and reopening Packing does not duplicate a completed traveler’s celebration.

## Family completion
- [ ] Family celebration does not occur before all five travelers are ready.
- [ ] The final traveler triggers the larger family celebration.
- [ ] “Everyone is Adventure Ready!” is displayed.
- [ ] Selecting “Open Remy’s Corner” opens the Companion view.
- [ ] “The Journey Begins” is now unlocked.

## Regression smoke test
- [ ] Daily Adventure opens.
- [ ] Reservations opens.
- [ ] Weather card loads or shows its valid forecast-window message.
- [ ] Smart Stops appear.
- [ ] Traditions opens.
- [ ] Diagnostics pass.
- [ ] Build Info shows M3-04.4C and matching cache.
