"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureNormalization = require(
  "./adventure/adventure-normalization.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
);
const AdventureItinerary = require(
  "./adventure/adventure-itinerary.js",
);

function createArrivalAdventure() {
  const shell =
    AdventureData.createPacificCoastAdventureRecord();

  return AdventureData
    .enrichPacificCoastAdventureRecord(shell)
    .adventure;
}

test("September 24 survives Adventure normalization and storage", () => {
  const adventure = createArrivalAdventure();
  const normalized =
    AdventureNormalization.normalizeAdventureRecord(
      adventure,
    );
  const storageProvider =
    AdventureStorage.createMemoryStorage();
  const storage =
    AdventureStorage.createAdventureStorage({
      storageProvider,
    });

  storage.saveAdventureRecord(normalized);

  const loaded = storage.loadAdventureRecord(
    adventure.id,
  );

  assert.deepEqual(
    loaded.itinerary.days,
    adventure.itinerary.days,
  );
  assert.deepEqual(
    loaded.reservations.items,
    adventure.reservations.items,
  );
});

test("builds a canonical Pacific view model with reservations and safe navigation", () => {
  const days =
    AdventureItinerary.createItineraryViewModel(
      createArrivalAdventure(),
    );
  const arrivalDay = days.find(
    (day) =>
      day.id ===
      AdventureData.PACIFIC_COAST_ARRIVAL_DAY_ID,
  );

  assert.ok(arrivalDay);
  assert.equal(arrivalDay.routeLabel, "SFO → Healdsburg");
  assert.equal(arrivalDay.stops.length, 3);
  assert.equal(
    Object.hasOwn(
      arrivalDay.stops[1].reservation,
      "confirmation",
    ),
    false,
  );
  assert.equal(
    arrivalDay.stops[2].reservation.status,
    "Confirmed",
  );
  assert.equal(
    arrivalDay.stops[0].navigation.googleMaps,
    "https://www.google.com/maps/search/?api=1&query=San%20Francisco%20International%20Airport%2C%20San%20Francisco%2C%20CA",
  );
  assert.equal(
    arrivalDay.stops[0].navigation.waze,
    "https://www.waze.com/ul?q=San%20Francisco%20International%20Airport%2C%20San%20Francisco%2C%20CA&navigate=yes",
  );
  assert.match(
    arrivalDay.stops[0].navigation.nextStop,
    /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&origin=/,
  );
});

test("renders the canonical Pacific itinerary without Smokies tables", () => {
  const markup =
    AdventureItinerary.renderCanonicalItinerary(
      createArrivalAdventure(),
    );

  assert.match(markup, /Thursday, September 24, 2026/);
  assert.match(markup, /SFO → Healdsburg/);
  assert.match(markup, /Healdsburg Inn on Plaza/);
  assert.match(markup, /Healdsburg King/);
  assert.match(markup, /check-in after 4 PM/);
  assert.match(markup, /call before 2 PM/);
  assert.match(markup, /checkout 11 AM/);
  assert.match(markup, /The Matheson/);
  assert.match(markup, /Reservation time not yet supplied/);
  assert.doesNotMatch(markup, /Smokies|Club Wyndham|DAY_DASH|STOP_DATA/);
});

test("returns no canonical markup for an empty itinerary", () => {
  assert.equal(
    AdventureItinerary.renderCanonicalItinerary(
      AdventureData.createPacificCoastAdventureRecord(),
    ),
    "",
  );
});

test("rejects non-empty itinerary data outside the supported day contract", () => {
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();
  adventure.itinerary.days = [
    {
      id: "draft-day",
      date: "2026-09-25",
      title: "Draft",
      stops: [],
    },
  ];

  assert.equal(
    AdventureItinerary.isSupportedDay(
      adventure.itinerary.days[0],
    ),
    false,
  );
  assert.equal(
    AdventureItinerary.renderCanonicalItinerary(
      adventure,
    ),
    "",
  );
});
