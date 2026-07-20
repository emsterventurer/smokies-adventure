# Adventure Companion M3-03.1 — Weather Foundation Test Script

Baseline: `m3-02.5-baseline`  
Candidate: `M3-03.1`

## Automated checks
- Weather URL contains Fahrenheit, timezone, current, hourly rain probability, and daily high/low fields.
- Open-Meteo responses normalize into the app-owned weather schema.
- WMO weather codes map to readable labels and icons.
- Cache states transition through fresh, cached, stale, and expired.
- Network failure falls back to non-expired cached data.
- Existing baseline source files remain present.
- Service worker caches both new weather scripts and uses a new cache version.

## Manual acceptance
1. Open Home while online. A loading state changes to live weather without blocking the itinerary.
2. Confirm location reads “Sevierville / Smoky Mountains.”
3. Confirm current temperature, condition, feels-like, high/low, rain chance, source, and updated time appear.
4. Select refresh. The button indicates activity and remains keyboard accessible.
5. Reload within 60 minutes. Cached weather appears without losing existing trip progress.
6. Switch offline and reload. Cached weather appears with an honest freshness label; if no cache exists, the reassuring unavailable state appears.
7. Confirm Daily Adventure, Reservations, Traditions, Trip Snapshot, readiness, welcome, feedback, and progress persistence still work.
8. Confirm phone portrait, phone landscape, and desktop layouts do not overflow.
9. Confirm screen-reader live region announces weather state changes and reduced-motion settings disable refresh rotation.
10. Confirm no weather API response is added to the service-worker cache.
