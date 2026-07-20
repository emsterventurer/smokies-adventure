# M3-03.1 Weather Foundation

Built from the protected `m3-02.5-baseline` release.

## Added
- Live Open-Meteo weather card for Sevierville / Smoky Mountains.
- Current temperature, conditions, feels-like, daily high/low, and rain chance.
- Fresh, cached, stale, expired, offline, loading, and unavailable states.
- Manual refresh and automatic refresh when connectivity returns.
- Local weather cache isolated from existing trip persistence.
- Provider abstraction through `weather-service.js`.
- Accessible live updates and reduced-motion support.

## Preserved
- Existing itinerary, navigation, readiness, reservations, traditions, progress, welcome flow, feedback mode, and offline app shell.
- No automatic itinerary changes based on weather.
