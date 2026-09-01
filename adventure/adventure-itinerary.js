(function () {
"use strict";

const canonicalInteractionState = new WeakMap();

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function mapsSearch(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function wazeSearch(query) {
  return `https://www.waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}

function googleRoute(origin, destination, waypoints = []) {
  const waypointParameter = waypoints.length
    ? `&waypoints=${encodeURIComponent(waypoints.join("|"))}`
    : "";

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointParameter}&travelmode=driving`;
}

function createGoogleRouteSegments(stops) {
  const points = stops
    .map((stop) => ({
      id: stop.id,
      name: stop.name,
      query: stop.navigationQuery || stop.address,
    }))
    .filter(
      (point) =>
        typeof point.query === "string" &&
        point.query.trim(),
    );
  const segments = [];
  let startIndex = 0;

  while (startIndex < points.length - 1) {
    const segmentPoints = points.slice(
      startIndex,
      startIndex + 5,
    );
    const origin = segmentPoints[0];
    const destination =
      segmentPoints[segmentPoints.length - 1];

    segments.push({
      points: segmentPoints,
      url: googleRoute(
        origin.query,
        destination.query,
        segmentPoints
          .slice(1, -1)
          .map((point) => point.query),
      ),
    });

    startIndex += segmentPoints.length - 1;
  }

  return segments;
}

function reservationIdFor(reservation) {
  return (
    reservation?.id ||
    `${reservation?.date ?? ""}::${reservation?.name ?? ""}`
  );
}

function isSupportedStop(stop) {
  return Boolean(
    stop &&
      typeof stop.id === "string" &&
      stop.id.trim() &&
      typeof stop.name === "string" &&
      stop.name.trim() &&
      typeof stop.kind === "string" &&
      stop.kind.trim() &&
      (stop.timeLabel === undefined ||
        (typeof stop.timeLabel === "string" &&
          stop.timeLabel.trim())) &&
      typeof stop.priority === "string" &&
      stop.priority.trim() &&
      typeof (
        stop.navigationQuery || stop.address
      ) === "string",
  );
}

function isSupportedDay(day) {
  return Boolean(
    day &&
      typeof day.id === "string" &&
      day.id.trim() &&
      typeof day.date === "string" &&
      day.date.trim() &&
      typeof day.title === "string" &&
      day.title.trim() &&
      typeof day.summary === "string" &&
      day.summary.trim() &&
      typeof day.routeLabel === "string" &&
      day.routeLabel.trim() &&
      typeof day.pace === "string" &&
      day.pace.trim() &&
      Array.isArray(day.stops) &&
      day.stops.length > 0 &&
      day.stops.every(isSupportedStop),
  );
}

function createRouteAlternatives(day) {
  const descriptors = Array.isArray(
    day?.routeAlternatives,
  )
    ? day.routeAlternatives
    : [];
  const availableStops = [
    ...(Array.isArray(day?.stops) ? day.stops : []),
    ...(Array.isArray(day?.alternativeRouteStops)
      ? day.alternativeRouteStops
      : []),
  ].filter(isSupportedStop);
  const stopMap = new Map(
    availableStops.map((stop) => [stop.id, stop]),
  );

  return descriptors.flatMap((descriptor) => {
    if (
      !descriptor ||
      typeof descriptor.id !== "string" ||
      !descriptor.id.trim() ||
      typeof descriptor.label !== "string" ||
      !descriptor.label.trim() ||
      !Array.isArray(descriptor.stopIds)
    ) {
      return [];
    }

    const durationOverrides =
      descriptor.driveFromPreviousByStopId &&
      typeof descriptor.driveFromPreviousByStopId === "object"
        ? descriptor.driveFromPreviousByStopId
        : {};
    const stops = descriptor.stopIds.flatMap(
      (stopId) => {
        const stop = stopMap.get(stopId);

        return stop
          ? [
              Object.hasOwn(
                durationOverrides,
                stopId,
              )
                ? {
                    ...stop,
                    driveFromPrevious:
                      durationOverrides[stopId],
                  }
                : stop,
            ]
          : [];
      },
    );

    return stops.length
      ? [
          {
            id: descriptor.id,
            label: descriptor.label,
            preferred:
              descriptor.preferred === true,
            stops,
          },
        ]
      : [];
  });
}

function createTravelNotes(day) {
  return Array.isArray(day?.travelNotes)
    ? day.travelNotes.filter(
        (note) =>
          typeof note === "string" &&
          note.trim(),
      )
    : [];
}

function createItineraryViewModel(adventure, options = {}) {
  const reservations = Array.isArray(
    adventure?.reservations?.items,
  )
    ? adventure.reservations.items
    : [];
  const reservationMap = new Map(
    reservations.map((reservation) => [
      reservationIdFor(reservation),
      reservation,
    ]),
  );
  const days = Array.isArray(
    adventure?.itinerary?.days,
  )
    ? adventure.itinerary.days.filter(
        isSupportedDay,
      )
    : [];

  return days.map((day) => {
    const routeAlternatives =
      createRouteAlternatives(day);
    const preferredRoute =
      routeAlternatives.find(
        (route) => route.preferred,
      ) || routeAlternatives[0] || null;
    const selectedRoute =
      routeAlternatives.find(
        (route) =>
          route.id ===
          options.routeSelections?.[day.id],
      ) || preferredRoute;
    const alternativeStopIds = new Set(
      routeAlternatives.flatMap((route) =>
        route.stops.map((stop) => stop.id),
      ),
    );
    const supplementalStops = routeAlternatives.length
      ? day.stops.filter(
          (stop) => !alternativeStopIds.has(stop.id),
        )
      : [];
    const displayedStops = selectedRoute
      ? [...selectedRoute.stops, ...supplementalStops]
      : day.stops;
    const mapStops = selectedRoute
      ? selectedRoute.stops
      : day.stops;
    const decorateStops = (stops) =>
      stops.map((stop, index) => {
      const query =
        stop.navigationQuery || stop.address;
      const nextStop = stops[index + 1];
      const nextQuery =
        nextStop?.navigationQuery ||
        nextStop?.address ||
        null;

      return {
        ...stop,
        reservation:
          reservationMap.get(
            stop.reservationId,
          ) || null,
        navigation: {
          googleMaps: mapsSearch(query),
          waze: wazeSearch(query),
          nextStop:
            nextQuery
              ? googleRoute(query, nextQuery)
              : null,
        },
        nextDrive:
          typeof nextStop?.driveFromPrevious === "string" &&
          nextStop.driveFromPrevious.trim()
            ? nextStop.driveFromPrevious
            : null,
      };
      });

    return {
      ...day,
      routeAlternatives,
      selectedRouteId: selectedRoute?.id || null,
      travelNotes: createTravelNotes(day),
      dayMapSegments:
        createGoogleRouteSegments(mapStops),
      stops: decorateStops(displayedStops),
    };
  });
}

function formatDate(date) {
  return new Date(
    `${date}T12:00:00`,
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

function renderRouteActions(segments, label) {
  return segments
    .map(
      (segment, index) => `
        <a href="${segment.url}" target="_blank" rel="noopener">
          ${escapeHtml(label)}${segments.length > 1 ? ` ${index + 1} of ${segments.length}` : ""}
        </a>
      `,
    )
    .join("");
}

function renderPacificAdventureTrail(
  days,
  selectedDayId,
) {
  return `
    <section class="pacificJourneyTrail" aria-label="Pacific Coast Adventure days">
      <div class="journeyHead">
        <div>
          <span class="eyebrow">THE JOURNEY AHEAD</span>
          <h3>Our Adventure Trail <span aria-hidden="true">🌲</span></h3>
        </div>
        <span class="journeyCount">${days.findIndex((day) => day.id === selectedDayId) + 1} of ${days.length}</span>
      </div>
      <div class="journeyTrail">
        ${days
          .map((day, index) => {
            const date = new Date(`${day.date}T12:00:00`);
            const weekday = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const monthDay = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const selected = day.id === selectedDayId;

            return `
              <button
                class="trailStop stone-${(index % 4) + 1}${selected ? " active" : ""}"
                type="button"
                data-canonical-day-id="${escapeHtml(day.id)}"
                aria-pressed="${selected}"
                aria-label="Day ${index + 1}, ${escapeHtml(weekday)}, ${escapeHtml(monthDay)}: ${escapeHtml(day.title)}"
              >
                <span class="stoneLabel">
                  <strong>Day ${index + 1}</strong>
                  <small>${escapeHtml(weekday)}</small>
                  <span>${escapeHtml(monthDay)}</span>
                </span>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderCanonicalItinerary(adventure, options = {}) {
  const days =
    createItineraryViewModel(adventure, options);

  if (!days.length) {
    return "";
  }

  const selectedDayId = days.some(
    (day) => day.id === options.selectedDayId,
  )
    ? options.selectedDayId
    : days[0].id;
  const selectedDays = days.filter(
    (day) => day.id === selectedDayId,
  );

  return `${renderPacificAdventureTrail(
    days,
    selectedDayId,
  )}${selectedDays
    .map(
      (day) => `
        <section class="canonicalItineraryDay">
          <header class="canonicalItineraryHead">
            <span class="eyebrow">ADVENTURE ITINERARY</span>
            <h3>${escapeHtml(formatDate(day.date))}</h3>
            <h4>${escapeHtml(day.title)}</h4>
            <p>${escapeHtml(day.summary)}</p>
            <div class="canonicalDayChips">
              <span>🚗 ${escapeHtml(day.routeLabel)}</span>
              <span>🌿 ${escapeHtml(day.pace)}</span>
            </div>
            <div class="canonicalMapActions">
              ${renderRouteActions(
                day.dayMapSegments,
                "Open Day Map",
              )}
            </div>
            ${day.travelNotes.length ? `
              <aside class="canonicalTravelGuidance" aria-label="Travel guidance">
                <strong>Flexible travel guidance</strong>
                ${day.travelNotes
                  .map(
                    (note) =>
                      `<p>${escapeHtml(note)}</p>`,
                  )
                  .join("")}
              </aside>
            ` : ""}
            ${day.routeAlternatives.length ? `
              <section class="canonicalRouteAlternatives" aria-label="Alternate day routes">
                <div class="canonicalRouteAlternativesHead">
                  <strong>Choose one route for this day</strong>
                  <small>These are alternate versions, not one combined route.</small>
                </div>
                <div class="canonicalRouteAlternativeList">
                  ${day.routeAlternatives
                    .map(
                      (route) => `
                        <button
                          class="canonicalRouteAlternative${route.id === day.selectedRouteId ? " selected" : ""}${route.preferred ? " preferred" : ""}"
                          type="button"
                          data-day-id="${escapeHtml(day.id)}"
                          data-route-option="${escapeHtml(route.id)}"
                          aria-pressed="${route.id === day.selectedRouteId}"
                        >
                          <strong>${escapeHtml(route.label)}</strong>
                          ${route.preferred ? `<span>Preferred</span>` : `<small>Alternate route</small>`}
                        </button>
                      `,
                    )
                    .join("")}
                </div>
              </section>
            ` : ""}
          </header>
          <div class="canonicalStopList">
            ${day.stops
              .map(
                (stop, index) => `
                  <article class="stopCard evolvedStop canonicalStopCard">
                    <div class="stopOrder canonicalStopOrder"><span>${index + 1}</span><i></i></div>
                    <div class="stopBody canonicalStopBody">
                      <small>${stop.timeLabel ? `${escapeHtml(stop.timeLabel)} · ` : ""}${escapeHtml(stop.kind)}</small>
                      <h4>${escapeHtml(stop.name)}</h4>
                      <span class="canonicalPriority ${escapeHtml(stop.priority)}">${escapeHtml(stop.priority)}</span>
                      ${stop.duration ? `<p><strong>${escapeHtml(stop.duration)}</strong></p>` : ""}
                      ${stop.address ? `<p>${escapeHtml(stop.address)}</p>` : ""}
                      ${stop.notes ? `<p>${escapeHtml(stop.notes)}</p>` : ""}
                      ${stop.nextDrive ? `<p class="canonicalNextDrive"><strong>Next drive: ~${escapeHtml(stop.nextDrive)}</strong></p>` : ""}
                      ${stop.reservation ? `
                        <div class="canonicalReservation">
                          <strong>${escapeHtml(stop.reservation.status)}</strong>
                          ${stop.reservation.confirmation ? `<span>Confirmation ${escapeHtml(stop.reservation.confirmation)}</span>` : ""}
                          ${stop.reservation.notes ? `<small>${escapeHtml(stop.reservation.notes)}</small>` : ""}
                        </div>
                      ` : ""}
                      <div class="navActions">
                        <a href="${stop.navigation.waze}" target="_blank" rel="noopener">🚙 Waze</a>
                        <a href="${stop.navigation.googleMaps}" target="_blank" rel="noopener">📍 Google Maps</a>
                        ${stop.navigation.nextStop ? `<a class="nextRoute" href="${stop.navigation.nextStop}" target="_blank" rel="noopener">${stop.nextDrive ? `Next drive · ~${escapeHtml(stop.nextDrive)} →` : "Next stop →"}</a>` : ""}
                      </div>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("")}`;
}

function renderPacificDailyAdventure(
  adventure,
  options = {},
) {
  return `
    <div class="canonicalReviewHead">
      <span class="eyebrow">PACIFIC COAST ADVENTURE</span>
      <h3>🛣️ Daily Adventure</h3>
      <p>Thursday through Monday, from arrival in Healdsburg to the Seattle airport area.</p>
    </div>
    <div data-canonical-itinerary-host>
      ${renderCanonicalItinerary(adventure, options)}
    </div>
  `;
}

function initializeCanonicalItineraryInteractions(
  host,
  adventure,
) {
  if (!host || typeof host.addEventListener !== "function") {
    return null;
  }

  if (canonicalInteractionState.has(host)) {
    return canonicalInteractionState.get(host);
  }

  const routeSelections = {};
  const state = {
    routeSelections,
    selectedDayId:
      Array.isArray(adventure?.itinerary?.days)
        ? adventure.itinerary.days.find(isSupportedDay)?.id || null
        : null,
  };

  host.addEventListener("click", (event) => {
    const dayButton = event.target?.closest?.(
      "[data-canonical-day-id]",
    );

    if (dayButton && host.contains(dayButton)) {
      state.selectedDayId =
        dayButton.dataset.canonicalDayId;
      host.innerHTML = renderCanonicalItinerary(
        adventure,
        {
          routeSelections,
          selectedDayId: state.selectedDayId,
        },
      );
      return;
    }

    const button = event.target?.closest?.(
      "[data-route-option]",
    );

    if (!button || !host.contains(button)) {
      return;
    }

    routeSelections[button.dataset.dayId] =
      button.dataset.routeOption;
    host.innerHTML = renderCanonicalItinerary(
      adventure,
      {
        routeSelections,
        selectedDayId: state.selectedDayId,
      },
    );
  });

  canonicalInteractionState.set(host, state);

  return state;
}

function renderCanonicalReservations(adventure) {
  const reservations = Array.isArray(
    adventure?.reservations?.items,
  )
    ? adventure.reservations.items
    : [];

  if (!reservations.length) {
    return "<p>No reservations are available for this Adventure yet.</p>";
  }

  return `
    <div class="canonicalReviewHead">
      <span class="eyebrow">PACIFIC COAST ADVENTURE</span>
      <h3>🍽️ Reservations</h3>
      <p>Confirmed stays, dining plans, and current targets for the land trip.</p>
    </div>
    <div class="canonicalReservationReviewList">
      ${reservations
        .map(
          (reservation) => `
            <article class="canonicalReservationReviewCard">
              <div>
                <small>${escapeHtml(formatDate(reservation.date))} · ${escapeHtml(reservation.kind)}</small>
                <h4>${escapeHtml(reservation.name)}</h4>
                ${reservation.address ? `<p>${escapeHtml(reservation.address)}</p>` : ""}
                ${reservation.notes ? `<p>${escapeHtml(reservation.notes)}</p>` : ""}
              </div>
              <strong>${escapeHtml(reservation.status)}</strong>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function createTripSnapshotViewModel(adventure) {
  const days = Array.isArray(adventure?.itinerary?.days)
    ? adventure.itinerary.days.filter(isSupportedDay)
    : [];
  const seenNames = new Set();
  const majorStops = [];

  days.forEach((day) => {
    day.stops.forEach((stop) => {
      if (
        ![
          "arrival",
          "lodging",
          "required experience",
        ].includes(stop.kind) ||
        seenNames.has(stop.name)
      ) {
        return;
      }

      const query = stop.navigationQuery || stop.address;
      seenNames.add(stop.name);
      majorStops.push({
        id: stop.id,
        name: stop.name,
        kind: stop.kind,
        date: day.date,
        priority: stop.priority,
        navigationQuery: query,
        googleMaps: mapsSearch(query),
        waze: wazeSearch(query),
      });
    });
  });

  return {
    title: adventure?.title || "Adventure",
    dates: {
      start: adventure?.dates?.start || null,
      end: adventure?.dates?.end || null,
    },
    majorStops,
    overallMapSegments:
      createGoogleRouteSegments(majorStops),
  };
}

function renderTripSnapshot(adventure) {
  const snapshot =
    createTripSnapshotViewModel(adventure);

  if (!snapshot.majorStops.length) {
    return "<p>No trip snapshot is available for this Adventure yet.</p>";
  }

  const dateRange =
    snapshot.dates.start && snapshot.dates.end
      ? `${formatDate(snapshot.dates.start)} – ${formatDate(snapshot.dates.end)}`
      : "Dates not yet supplied";

  return `
    <div class="canonicalReviewHead">
      <span class="eyebrow">PACIFIC COAST ADVENTURE</span>
      <h3>📍 Trip Snapshot</h3>
      <p><strong>Land-trip dates:</strong> ${escapeHtml(dateRange)}</p>
      <p><strong>Route:</strong> ${snapshot.majorStops
        .map((stop) => escapeHtml(stop.name))
        .join(" → ")}</p>
      <div class="canonicalMapActions">
        ${renderRouteActions(
          snapshot.overallMapSegments,
          "Open Overall Trip Map",
        )}
      </div>
    </div>
    <div class="canonicalSnapshotRoute">
      ${snapshot.majorStops
        .map(
          (stop, index) => `
            <article>
              <span>${index + 1}</span>
              <div>
                <small>${escapeHtml(formatDate(stop.date))} · ${escapeHtml(stop.kind)}</small>
                <h4>${escapeHtml(stop.name)}</h4>
                ${stop.priority === "required" ? `<strong>Required priority</strong>` : ""}
                <div class="navActions">
                  <a href="${stop.waze}" target="_blank" rel="noopener">🚙 Waze</a>
                  <a href="${stop.googleMaps}" target="_blank" rel="noopener">📍 Google Maps</a>
                </div>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function configurePacificReviewNavigation(
  document,
  isPacificCoast,
) {
  if (!isPacificCoast) {
    return;
  }

  const desktopButtons = Array.from(
    document?.querySelectorAll?.(
      ".desktopSideNav [data-view]",
    ) || [],
  );
  const mobileButtons = Array.from(
    document?.querySelectorAll?.(
      "nav [data-view]",
    ) || [],
  );

  desktopButtons.forEach((button) => {
    button.hidden = ["memories", "packing"].includes(
      button.dataset.view,
    );

    if (button.dataset.view === "week") {
      button.innerHTML = "🛣️<span>Daily Adventure</span>";
    }
  });

  const mobileViews = [
    ["home", "⌂", "Dashboard"],
    ["week", "🛣️", "Adventure"],
    ["reservations", "🍽️", "Reservations"],
    ["trip", "📍", "Snapshot"],
  ];

  mobileButtons.forEach((button, index) => {
    const navigation = mobileViews[index];

    if (!navigation) {
      button.hidden = true;
      return;
    }

    const [view, icon, label] = navigation;
    button.hidden = false;
    button.dataset.view = view;
    button.innerHTML = `${icon}<small>${label}</small>`;
  });
}

const AdventureItinerary = Object.freeze({
  isSupportedDay,
  createRouteAlternatives,
  createTravelNotes,
  createItineraryViewModel,
  renderCanonicalItinerary,
  renderPacificDailyAdventure,
  initializeCanonicalItineraryInteractions,
  renderCanonicalReservations,
  createTripSnapshotViewModel,
  renderTripSnapshot,
  configurePacificReviewNavigation,
  mapsSearch,
  wazeSearch,
  googleRoute,
  createGoogleRouteSegments,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureItinerary;
}

if (typeof window !== "undefined") {
  window.AdventureItinerary =
    AdventureItinerary;
}
})();
