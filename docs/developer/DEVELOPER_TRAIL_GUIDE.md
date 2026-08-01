# 🧭 Adventure Companion Developer Trail Guide

> Living documentation for navigating the Adventure Companion codebase.
>
> Architecture plans describe what Adventure Companion intends to build and why.
>
> The Developer Trail Guide describes the current, verified implementation and how to modify it safely.

---

# 🧭 Adventure Companion Development Standard

Every meaningful repository change should follow this workflow:

```text
🧭 Repository Review
        ↓
📐 Architecture Check
        ↓
🔨 One Focused Implementation
        ↓
🧪 Automated Tests
        ↓
🌐 Browser Verification
        ↓
📖 Update Developer Trail Guide
        ↓
💾 Commit
```

## Core Principle

> **Inspect before you instruct.**

Verify the current repository before deciding where or how to make a change.

Do not rely on remembered filenames, assumed functions, or planned architecture when the current implementation can be inspected directly.

---

## 1. 🧭 Repository Review

Understand the current implementation before making changes.

Verify:

- Existing files
- Current responsibilities
- Reusable functions
- Data sources
- Existing tests
- Related documentation
- Known browser or development behavior

Never assume where code lives.

---

## 2. 📐 Architecture Check

Confirm the proposed implementation aligns with the approved architecture.

Ask:

- Does this responsibility already exist?
- Would this duplicate data?
- Would this duplicate logic?
- Does an Architecture Plan already define the behavior?
- Can an existing module be safely extended?
- Does the change preserve future compatibility?

Architecture Plans describe what Adventure Companion intends to build and why.

The implementation should reinforce that architecture rather than work around it.

---

## 3. 🔨 One Focused Implementation

Implement one logical improvement at a time.

Guidelines:

- One clear responsibility
- Small, reviewable changes
- Prefer complete function or clearly bounded block replacements
- Avoid unrelated cleanup
- Preserve working behavior
- Keep the change easy to explain and reverse
- Pause for confirmation after each development step

Every implementation should answer:

> **What single improvement does this make?**

---

## 4. 🧪 Automated Tests

Run the appropriate automated verification before browser testing.

Typical minimum:

```powershell
node --check app.js
node --test
```

Use narrower tests first when helpful, but run the complete suite before committing.

Rules:

- Fix failures before continuing.
- Never commit failing tests.
- Do not weaken a valid test merely to make it pass.
- Update tests when intentional behavior changes.
- Preserve regression coverage for existing systems.

---

## 5. 🌐 Browser Verification

Verify the actual user experience after automated tests pass.

Typical checks include:

- Feature behaves correctly
- Existing behavior still works
- No visible regressions
- No red console errors
- Responsive layout remains healthy
- Controls remain accessible
- Empty states remain useful

When applicable, verify:

- Creation
- Editing
- Deletion
- Persistence after reload
- Error handling
- Mobile presentation
- Reduced-motion behavior

Automated tests do not replace browser verification.

---

## 6. 📖 Update Developer Trail Guide

Document the verified final implementation.

Update the Trail Guide when a change introduces or modifies:

- Primary files
- Module responsibilities
- Reusable entry points
- Important data sources
- Tests
- Browser-verification requirements
- Recurring development issues
- Safe extension rules

Document only what has been implemented and verified.

Do not describe planned functionality as though it already exists.

---

## 7. 💾 Commit

Create a single-purpose commit only after verification and documentation are complete.

Before committing, confirm:

- Automated tests pass
- Browser verification passes
- Trail Guide reflects the verified implementation
- Only intended files are staged
- Temporary files and test data are removed
- The commit message clearly describes one responsibility

Examples:

```text
feat: redesign Adventure Book foundation
feat: enrich Adventure Book timeline days
refactor: extract Adventure Book memory card renderer
docs: formalize Adventure Companion development standard
```

---

## Guiding Principles

Every commit should leave Adventure Companion in a better state than it was found.

Priorities:

- Clear architecture
- Small commits
- Verified behavior
- Accurate documentation
- Easy future maintenance
- A polished family experience

Build deliberately.

Verify thoroughly.

Document responsibly.

Commit with confidence.

---

# 🌎 Shared Adventure Repository

## Purpose

The Adventure Repository is the application-facing persistence boundary for Adventure Records.

Application services use the repository contract without depending on local browser storage or a future cloud provider.

---

## Primary Files

### `adventure/adventure-repository.js`

Creates the Adventure Repository compatibility layer.

Verified repository methods include:

```js
loadAdventureRecord(adventureId);
saveAdventureRecord(record);
listAdventureRecords();
deleteAdventureRecord(adventureId);
hasAdventureRecord(adventureId);
```

---

## Adventure Provider Contract

The shared provider contract lives in:

```text
adventure/adventure-provider.js
```

It defines the required Adventure persistence methods:

```js
loadAdventureRecord(adventureId);
saveAdventureRecord(record);
listAdventureRecords();
deleteAdventureRecord(adventureId);
hasAdventureRecord(adventureId);
```

Verified browser export:

```js
globalThis.AdventureProvider;
```

The contract provides:

```js
AdventureProvider.isAdventureProvider(value);
AdventureProvider.requireAdventureProvider(value);
```

Related tests:

```text
adventure-provider.test.js
```

Current verification:

```text
4 focused provider tests pass
114 total tests pass
```

The provider contract is now available, but the active application provider remains the local Adventure Repository backed by `AdventureStorage`.

---

## Firebase Foundation

Firebase initialization currently lives in:

```text
adventure/firebase/firebase-config.js
adventure/firebase/firebase-client.mjs
```

### `adventure/firebase/firebase-config.js`

Exposes the registered Firebase web-app configuration as:

```js
globalThis.ADVENTURE_FIREBASE_CONFIG;
```

### `adventure/firebase/firebase-client.mjs`

Initializes the Firebase application through the official Firebase JavaScript SDK and exposes:

```js
globalThis.AdventureFirebase;
```

Verified browser status:

```text
isInitialized: true
```

Firebase is initialized but is not yet the active Adventure data provider.

No cloud reads, writes, media uploads, or synchronization occur yet.

---

## Current Provider

The active Adventure provider remains:

```text
Adventure Repository
        ↓
AdventureStorage
        ↓
localStorage
```

Firebase is currently initialized alongside the local provider but does not yet store Adventure data.

---

## Verified Load Order

In `index.html`:

```text
adventure/adventure-storage.js
        ↓
adventure/adventure-repository.js
        ↓
adventure/firebase/firebase-config.js
        ↓
adventure/firebase/firebase-client.mjs
        ↓
adventure/active-adventure.js
        ↓
adventure/adventure-startup.js
        ↓
app.js
```

---

## Verification

After Firebase foundation changes, run:

```powershell
node --check adventure\firebase\firebase-config.js
node --check adventure\firebase\firebase-client.mjs
node --test
```

Browser verification should confirm:

- The application loads normally
- No visible behavior changes occur
- No red console errors appear
- `globalThis.AdventureFirebase` exists
- `globalThis.AdventureFirebase.isInitialized` is `true`

---

# Repository Landmarks

| Area                             | Purpose                                                           |
| -------------------------------- | ----------------------------------------------------------------- |
| 🧠 Adventure Brain               | Determines what deserves attention today                          |
| 📖 Adventure Book                | Captures, organizes, and displays adventure memories and photos   |
| 🔥 Living Campfire               | Creates contextual stories, encouragement, and reflections        |
| 👨‍👩‍👧‍👦 Family Adventure Intelligence | Supports readiness, traveler awareness, and celebrations          |
| 💾 Durable Adventure Data        | Stores canonical Adventure Records and active Adventure selection |
| 🎒 Family Packing                | Tracks packing progress and traveler-specific readiness           |
| 🌦 Weather                       | Provides forecasts, current conditions, and weather intelligence  |
| 🗺 Daily Adventure               | Displays itinerary details, Smart Stops, and directions           |

Detailed subsystem entries should be added only after repository verification.

---

# 📖 Adventure Book

## Purpose

The Adventure Book is the durable family journal for an Adventure.

It supports capturing what actually happened during the trip and presenting those memories as a chronological family story.

The Adventure Book is intentionally connected to itinerary information while remaining separate from itinerary planning.

---

## Primary Files

### `app.js`

Owns the browser-facing Adventure Book experience.

Verified responsibilities include:

- Adventure Book page rendering
- Summary counts
- Quick Memory Capture form
- Family Timeline rendering
- Adventure-day grouping
- Planned-day context
- Individual memory-card rendering
- Saved-photo hydration
- Memory form interactions
- Intentional memory deletion

Verified entry points include:

```js
memoryJournalMarkup();
renderMemoryCard(memory);
hydrateSavedMemoryPhotos();
getMemoryTitleSuggestion(adventureDate);
memoryTravelerOptions();
escapeMemoryText(value);
```

---

### `adventure/memory-journal.js`

Owns memory-domain behavior and persistence through the active Adventure.

Verified responsibilities include:

- Creating memories
- Reading memories
- Listing memories
- Updating memories
- Deleting memories
- Preserving stable memory identity
- Normalizing memory input
- Saving changes through the Active Adventure Service

UI code should call the Memory Journal rather than duplicating these responsibilities.

---

### `adventure/media-store.js`

Owns durable memory-media persistence.

Verified responsibilities include:

- Saving media records
- Loading media records
- Listing media by memory
- Listing media by Adventure
- Deleting media records
- Clearing stored media
- Supporting an in-memory provider for tests

Photo bytes are stored separately from the canonical Adventure Record.

---

### `styles.css`

The verified Adventure Book style section begins with:

```css
/* ==========================================================
   Adventure Book Experience
   ========================================================== */
```

This section currently styles:

- Adventure Book container and header
- Summary counts
- Quick Memory Capture panel
- Traveler selection
- Photo selection and previews
- Family Timeline
- Adventure-day sections
- Planned-day context
- Memory cards
- Saved-photo grids
- Empty states
- Responsive layouts

---

## Rendering Architecture

### Page rendering

```text
memoryJournalMarkup()
        ↓
Adventure Book page
        ↓
Quick Memory Capture
        ↓
Family Timeline
        ↓
Adventure Day sections
```

`memoryJournalMarkup()` owns the overall Adventure Book page and timeline composition.

### Memory-card rendering

```text
memoryJournalMarkup()
        ↓
dayMemories.map(renderMemoryCard)
        ↓
Individual memory card
```

`renderMemoryCard(memory)` is a standalone renderer.

It currently renders:

- Stable memory identifier
- Adventure date
- Memory title
- Memory story
- Delete action
- Saved-photo gallery placeholder

Future memory-card features should extend `renderMemoryCard(memory)` instead of placing additional card markup directly inside `memoryJournalMarkup()`.

---

## Timeline Architecture

Memories are currently:

1. Listed through the Memory Journal.
2. Sorted by Adventure date.
3. Grouped by `adventureDate`.
4. Rendered beneath their corresponding Adventure-day section.

Each planned Adventure day may display:

- Adventure Day number
- Formatted date
- Planned title
- Theme badge
- Memory count
- Memory cards

The timeline remains valid for undated memories or dates outside the planned Adventure range.

---

## Existing Data Sources

The Adventure Book should reuse established Adventure and itinerary data before introducing new structures.

### `DATA.days`

Provides planned-day information such as:

- Date
- Title
- Theme
- Schedule
- Remy guidance
- Photo ideas
- Food and dessert notes
- Plan B information

Currently used by the Adventure Book for:

- Suggested memory titles
- Adventure Day numbering
- Planned-day titles
- Theme badges

### `DAY_DASH`

Provides day-level dashboard context, including:

- Focus
- Departure suggestion
- First stop
- Reservation summary
- Pace
- Sunset

### `START_DATA`

Provides the planned starting point and departure context for each day.

### `STOP_DATA`

Provides planned stops, activities, timing, and navigation context.

### `RESERVATION_DATA`

Provides detailed reservation information by date.

Avoid duplicating information already available through these sources.

---

## Related Tests

### `memory-journal.test.js`

Covers Memory Journal domain behavior, including:

- Required service validation
- Memory creation
- Rich memory fields
- Stable identity
- Listing order
- Lookup
- Updating
- Missing-memory behavior
- Intentional deletion
- Input non-mutation
- Missing active Adventure behavior

### `memory-journal-ui.test.js`

Covers Adventure Book integration, including:

- Module loading order
- Memories navigation entry point
- Memory capture form
- Memory Journal initialization
- Form submission
- Saved-memory rendering
- Intentional deletion
- Suggested titles
- Accessible labels

### `media-store.test.js`

Covers persistent media behavior, including:

- Storage availability
- Save and load
- Optional-field normalization
- Invalid-record rejection
- Adventure and memory queries
- Deletion
- Clear behavior
- Independent in-memory values

After Adventure Book changes, run:

```powershell
node --check app.js
node --test
```

---

## Browser Verification

After visible Adventure Book changes, verify:

- Adventure Book loads
- Summary counts render
- Quick Memory Capture remains usable
- Family Timeline renders
- Planned-day context appears for dated memories
- Memory cards display correctly
- Saved photos hydrate
- Memory deletion works
- Empty state returns after deleting the final memory
- No horizontal overflow appears
- No red console errors appear

Verify mobile layouts when responsive behavior changes.

---

## Development Environment Notes

Adventure Companion uses a service worker.

During development, the browser may display an update banner after files change.

If the browser does not reflect saved code:

1. Confirm the files are saved.
2. Run the automated tests.
3. Restart Live Server.
4. Perform a hard refresh.
5. Inspect the service worker under Edge DevTools → Application → Service workers.
6. Unregister a stale worker when necessary.
7. Clear site data only when it is safe to remove local browser data.

The **Update on reload** option may contribute to repeated update behavior during active development. Leave it disabled unless intentionally testing service-worker updates.

Do not assume the implementation is broken until stale browser assets have been ruled out.

---

## Current Adventure Book Commit History

### M3-07.2 Commit 2

```text
feat: redesign Adventure Book foundation
```

Established:

- Adventure Book header
- Summary counts
- Quick Memory Capture panel
- Family Timeline
- Chronological day grouping
- Empty-state presentation
- Responsive styling

### M3-07.2 Commit 3

```text
feat: enrich Adventure Book timeline days
```

Connected timeline day sections to existing itinerary information:

- Adventure Day number
- Planned title
- Theme badge

### M3-07.2 Commit 4

Current verified change:

- Extracted `renderMemoryCard(memory)` from `memoryJournalMarkup()`
- Preserved existing appearance and behavior
- Prepared memory cards for focused future enhancement

---

### M3-07.2 Commit 5

Current verified change:

- Added `getMemoryAdventurers(memory)` in `app.js`
- Resolved stored `adventurerIds` through `AdventurerDirectory.INITIAL_ADVENTURERS`
- Enriched `renderMemoryCard(memory)` with:
  - Rounded Adventure date badge
  - Improved story presentation
  - Shared-by traveler chips
  - Photo-count summary when media exists
- Preserved the existing Memory Journal data model
- Preserved timeline grouping and storage behavior
- Verified 110 automated tests pass
- Verified the rich memory card in the browser

---

## Related Architecture

```text
docs/architecture/M3-07.2_ADVENTURE_MEMORIES_TIMELINE_PLAN.md
```

The architecture plan defines M3-07.2 goals, scope, design rules, acceptance criteria, and future compatibility.

This Trail Guide records where the verified implementation currently lives.

---

# Guide Maintenance

Update this guide after implementation and verification when:

- A subsystem gains a new primary file
- A responsibility moves between modules
- A reusable entry point is added or removed
- A data source becomes important to future work
- A recurring development problem is discovered
- Testing or browser-verification requirements change

Do not copy complete architecture plans into this guide.

Keep entries practical, current, and directly useful for navigating the repository.
