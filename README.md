# Adventure Companion — M3-02.5

Stable baseline candidate for **Smoky Mountains 2026**.

## Included

- Added a Start Card to every Daily Dashboard route
- Day 1 begins at Home: 1817 Turning Leaf Lane, Durham, NC
- Days 2–8 begin at Club Wyndham Smoky Mountains
- Added estimated drive time from each Start Card to the first destination
- Preserved estimated drive times between all Smart Stop Cards
- Day 8 now begins with the resort checkout Start Card and ends at the exact home address
- Reservation Manager remains available from Reservations and Bookings for this day
- Existing confirmed and planned reservation details remain pre-populated
- Weather and packing intelligence remain intentionally reserved for M3-03
- Removed remaining budget presentation from day details
- Updated service-worker cache and visible build labels to M3-02.5

## Suggested commit

`M3-02.5 — Complete adventure flow and establish baseline candidate`

## Suggested baseline tag after live testing

`m3-02.5-baseline`

## M3-03.1 — Weather Foundation

This build adds an isolated live-weather foundation using Open-Meteo, local freshness-aware caching, offline fallback states, manual refresh, and a dashboard weather card. The M3-02.5 itinerary and persistence behavior remain unchanged.
