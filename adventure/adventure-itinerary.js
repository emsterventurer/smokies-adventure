(function () {
"use strict";

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

function googleRoute(origin, destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
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
      typeof stop.timeLabel === "string" &&
      stop.timeLabel.trim() &&
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

function createItineraryViewModel(adventure) {
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

  return days.map((day) => ({
    ...day,
    stops: day.stops.map((stop, index) => {
      const query =
        stop.navigationQuery || stop.address;
      const nextStop = day.stops[index + 1];
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
      };
    }),
  }));
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

function renderCanonicalItinerary(adventure) {
  const days =
    createItineraryViewModel(adventure);

  if (!days.length) {
    return "";
  }

  return days
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
          </header>
          <div class="canonicalStopList">
            ${day.stops
              .map(
                (stop, index) => `
                  <article class="stopCard evolvedStop canonicalStopCard">
                    <div class="stopOrder canonicalStopOrder"><span>${index + 1}</span><i></i></div>
                    <div class="stopBody canonicalStopBody">
                      <small>${escapeHtml(stop.timeLabel)} · ${escapeHtml(stop.kind)}</small>
                      <h4>${escapeHtml(stop.name)}</h4>
                      <span class="canonicalPriority ${escapeHtml(stop.priority)}">${escapeHtml(stop.priority)}</span>
                      ${stop.duration ? `<p><strong>${escapeHtml(stop.duration)}</strong></p>` : ""}
                      ${stop.address ? `<p>${escapeHtml(stop.address)}</p>` : ""}
                      ${stop.notes ? `<p>${escapeHtml(stop.notes)}</p>` : ""}
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
                        ${stop.navigation.nextStop ? `<a class="nextRoute" href="${stop.navigation.nextStop}" target="_blank" rel="noopener">Next stop →</a>` : ""}
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
    .join("");
}

const AdventureItinerary = Object.freeze({
  isSupportedDay,
  createItineraryViewModel,
  renderCanonicalItinerary,
  mapsSearch,
  wazeSearch,
  googleRoute,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureItinerary;
}

if (typeof window !== "undefined") {
  window.AdventureItinerary =
    AdventureItinerary;
}
})();
