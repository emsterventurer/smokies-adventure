"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require("./adventure/adventure-data.js");
const AdventurerDirectory = require("./adventure/adventurer-directory.js");

test("creates the initial Adventurer Directory", () => {
  const directory = AdventurerDirectory.createInitialAdventurerDirectory();

  assert.equal(directory.schemaVersion, 1);
  assert.equal(directory.adventurers.length, 5);

  assert.deepEqual(
    directory.adventurers.map((adventurer) => adventurer.id),
    ["emily", "jake", "kaseryn", "bubbe", "papa"],
  );
});

test("creates independent Adventurer Directory instances", () => {
  const first = AdventurerDirectory.createInitialAdventurerDirectory();
  const second = AdventurerDirectory.createInitialAdventurerDirectory();

  first.adventurers[0].displayName = "Changed";

  assert.equal(second.adventurers[0].displayName, "Emily");
});

test("creates the Smokies Adventure Record", () => {
  const adventure = AdventureData.createSmokiesAdventureRecord();

  assert.equal(adventure.schemaVersion, 1);
  assert.equal(adventure.id, "smokies-2026");
  assert.equal(adventure.slug, "smokies-2026");
  assert.equal(adventure.title, "Smokies 2026");
  assert.equal(adventure.subtitle, "Making New Traditions");

  assert.deepEqual(adventure.dates, {
    start: "2026-08-07",
    end: "2026-08-14",
    timezone: "America/New_York",
  });

  assert.equal(adventure.destination.latitude, 35.8681);
  assert.equal(adventure.destination.longitude, -83.5618);
});

test("assigns the five Smokies participants by stable adventurer ID", () => {
  const adventure = AdventureData.createSmokiesAdventureRecord();

  assert.deepEqual(
    adventure.participants.map((participant) => participant.adventurerId),
    ["emily", "jake", "kaseryn", "bubbe", "papa"],
  );

  assert.equal(adventure.participants[0].role, "organizer");

  assert.equal(
    adventure.participants.every(
      (participant) => participant.includedInReadiness === true,
    ),
    true,
  );
});

test("creates the Pacific Coast Adventure shell", () => {
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();

  assert.equal(adventure.schemaVersion, 1);
  assert.equal(adventure.id, "pacific-coast-2026");
  assert.equal(adventure.slug, "pacific-coast-2026");
  assert.equal(adventure.title, "Pacific Coast 2026");
  assert.equal(adventure.subtitle, "");
  assert.deepEqual(adventure.dates, {
    start: "2026-09-24",
    end: "2026-09-28",
    timezone: "America/Los_Angeles",
  });
  assert.deepEqual(adventure.destination, {
    name: "Pacific Coast",
    city: null,
    state: null,
    country: "United States",
    latitude: null,
    longitude: null,
  });
  assert.deepEqual(adventure.participants, []);
  assert.deepEqual(adventure.itinerary.days, []);
  assert.deepEqual(adventure.reservations.items, []);
});

test("creates all required Adventure Record collections", () => {
  const adventure = AdventureData.createSmokiesAdventureRecord();

  assert.deepEqual(adventure.itinerary.days, []);
  assert.deepEqual(adventure.reservations.items, []);
  assert.deepEqual(adventure.packing.travelers, {});
  assert.deepEqual(adventure.packing.sharedItems, []);
  assert.deepEqual(adventure.readiness.travelers, {});
  assert.deepEqual(adventure.readiness.family, {
    state: "unknown",
  });
  assert.deepEqual(adventure.completion.completedDayIds, []);
  assert.deepEqual(adventure.completion.completedActivityIds, []);
  assert.deepEqual(adventure.preferences.notes, []);
  assert.deepEqual(adventure.memories.entries, []);
  assert.deepEqual(adventure.media.referencedMediaIds, []);
});

test("creates independent Adventure Record instances", () => {
  const first = AdventureData.createSmokiesAdventureRecord();
  const second = AdventureData.createSmokiesAdventureRecord();

  first.participants[0].adventurePreferences.note = "Changed";
  first.itinerary.days.push({
    id: "day-1",
  });
  first.reservations.items.push({
    id: "reservation-1",
  });
  first.packing.travelers.emily = {
    packed: true,
  };
  first.packing.sharedItems.push({
    id: "shared-item-1",
  });
  first.readiness.travelers.emily = {
    state: "ready",
  };
  first.completion.completedDayIds.push("day-1");
  first.preferences.notes.push("Changed");
  first.memories.entries.push({
    id: "memory-1",
  });
  first.media.referencedMediaIds.push("media-1");

  assert.deepEqual(second.participants[0].adventurePreferences, {});
  assert.deepEqual(second.itinerary.days, []);
  assert.deepEqual(second.reservations.items, []);
  assert.deepEqual(second.packing.travelers, {});
  assert.deepEqual(second.packing.sharedItems, []);
  assert.deepEqual(second.readiness.travelers, {});
  assert.deepEqual(second.completion.completedDayIds, []);
  assert.deepEqual(second.preferences.notes, []);
  assert.deepEqual(second.memories.entries, []);
  assert.deepEqual(second.media.referencedMediaIds, []);
});

test("exports stable schema constants", () => {
  assert.equal(AdventureData.SCHEMA_VERSION, 1);
  assert.equal(AdventureData.SMOKIES_ADVENTURE_ID, "smokies-2026");
  assert.equal(
    AdventureData.PACIFIC_COAST_ADVENTURE_ID,
    "pacific-coast-2026",
  );
  assert.equal(AdventurerDirectory.SCHEMA_VERSION, 1);
});

test("enriches an empty Pacific Coast shell with all bundled land days", () => {
  const shell =
    AdventureData.createPacificCoastAdventureRecord();

  const result =
    AdventureData.enrichPacificCoastAdventureRecord(
      shell,
    );

  assert.equal(result.enriched, true);
  assert.deepEqual(
    result.adventure.itinerary.days.map((day) => day.id),
    [
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
    ],
  );
  assert.deepEqual(
    result.adventure.itinerary.days[0].stops.map(
      (stop) => stop.id,
    ),
    [
      "sfo-arrival",
      "healdsburg-inn",
      "the-matheson",
    ],
  );
  assert.equal(shell.itinerary.days.length, 0);

  const hotelStop =
    result.adventure.itinerary.days[0].stops[1];
  const dinnerStop =
    result.adventure.itinerary.days[0].stops[2];
  const hotelReservation =
    result.adventure.reservations.items.find(
      (reservation) =>
        reservation.id ===
        hotelStop.reservationId,
    );

  assert.equal(hotelStop.duration, undefined);
  assert.equal(hotelStop.notes, undefined);
  assert.equal(dinnerStop.notes, undefined);
  assert.equal(
    Object.hasOwn(
      hotelReservation,
      "confirmation",
    ),
    false,
  );
  assert.match(
    hotelReservation.notes,
    /Healdsburg King.*1 night.*check-in after 4 PM.*call before 2 PM.*checkout 11 AM/,
  );
});

test("Pacific Coast enrichment is idempotent and preserves unrelated data", () => {
  const shell =
    AdventureData.createPacificCoastAdventureRecord();

  shell.participants = [];
  shell.memories.entries.push({
    id: "memory-1",
    adventureId: shell.id,
    adventurerIds: [],
    locationIds: [],
    activityIds: [],
    mediaIds: [],
    tags: [],
  });
  shell.preferences.notes.push(
    "Preserve a leisurely pace.",
  );
  shell.reservations.items.push({
    id: "2026-09-24::The Matheson",
    date: "2026-09-24",
    name: "The Matheson",
    status: "Confirmed",
    notes: "User-authored dinner note.",
  });

  const first =
    AdventureData.enrichPacificCoastAdventureRecord(
      shell,
    );
  const second =
    AdventureData.enrichPacificCoastAdventureRecord(
      first.adventure,
    );

  assert.equal(second.enriched, false);
  assert.equal(
    first.adventure.itinerary.days.length,
    5,
  );
  assert.equal(
    first.adventure.reservations.items.length,
    9,
  );
  assert.equal(
    first.adventure.reservations.items.find(
      (reservation) =>
        reservation.name === "The Matheson",
    ).notes,
    "User-authored dinner note.",
  );
  assert.deepEqual(
    first.adventure.memories,
    shell.memories,
  );
  assert.deepEqual(
    first.adventure.preferences,
    shell.preferences,
  );
  assert.deepEqual(first.adventure.participants, []);
});

test("adds missing bundled days without replacing an existing Arrival Day", () => {
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();
  const existingArrival = {
    id: "2026-09-24",
    date: "2026-09-24",
    title: "User-authored day",
    custom: {
      preserved: true,
    },
  };
  adventure.itinerary.days.push(existingArrival);

  const result =
    AdventureData.enrichPacificCoastAdventureRecord(
      adventure,
    );

  assert.equal(result.enriched, true);
  assert.deepEqual(
    result.adventure.itinerary.days[0],
    existingArrival,
  );
  assert.deepEqual(
    result.adventure.itinerary.days.map((day) => day.id),
    [
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
    ],
  );
});

test("preserves every existing same-ID Pacific land day", () => {
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();
  const storedDays = [
    "2026-09-25",
    "2026-09-26",
    "2026-09-27",
    "2026-09-28",
  ].map((id) => ({
    id,
    date: id,
    title: `Stored ${id}`,
    marker: { source: "traveler" },
  }));

  adventure.itinerary.days.push(...storedDays);

  const result =
    AdventureData.enrichPacificCoastAdventureRecord(
      adventure,
    );

  for (const storedDay of storedDays) {
    assert.deepEqual(
      result.adventure.itinerary.days.find(
        (day) => day.id === storedDay.id,
      ),
      storedDay,
    );
  }
  assert.deepEqual(
    result.adventure.itinerary.days.map((day) => day.id),
    [
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
    ],
  );
});

test("adds missing reservations without overwriting stable identities", () => {
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();
  const storedReservation = {
    id: "2026-09-25::Sea Grill",
    date: "2026-09-25",
    name: "Sea Grill",
    status: "Traveler changed this",
    notes: "Preserve exactly.",
  };
  const legacyIdentityReservation = {
    date: "2026-09-27",
    name: "Hallmark Resort Newport",
    status: "Stored without an explicit ID",
  };
  adventure.reservations.items.push(
    storedReservation,
    legacyIdentityReservation,
  );

  const prepared =
    AdventureData.prepareBundledAdventureRecord(
      adventure,
    );

  assert.deepEqual(
    prepared.reservations.items.find(
      (item) => item.id === storedReservation.id,
    ),
    storedReservation,
  );
  assert.deepEqual(
    prepared.reservations.items.find(
      (item) =>
        item.date === legacyIdentityReservation.date &&
        item.name === legacyIdentityReservation.name,
    ),
    legacyIdentityReservation,
  );
  assert.equal(
    prepared.reservations.items.filter(
      (item) =>
        item.name === "Hallmark Resort Newport",
    ).length,
    1,
  );
  assert.ok(
    prepared.reservations.items.some(
      (item) =>
        item.name ===
        "Holiday Inn Express & Suites Eureka",
    ),
  );
});

test("leaves Smokies and unrelated Adventures unchanged", () => {
  const smokies =
    AdventureData.createSmokiesAdventureRecord();
  const unrelated = {
    ...AdventureData.createPacificCoastAdventureRecord(),
    id: "blue-ridge-2027",
  };

  const smokiesResult =
    AdventureData.enrichPacificCoastAdventureRecord(
      smokies,
    );
  const unrelatedResult =
    AdventureData.enrichPacificCoastAdventureRecord(
      unrelated,
    );

  assert.equal(smokiesResult.enriched, false);
  assert.equal(smokiesResult.adventure, smokies);
  assert.equal(unrelatedResult.enriched, false);
  assert.equal(unrelatedResult.adventure, unrelated);
});

test("preserves Pacific route alternatives and planning semantics", () => {
  const days =
    AdventureData.createPacificCoastLandDays();
  const saturday = days.find(
    (day) => day.id === "2026-09-26",
  );
  const monday = days.find(
    (day) => day.id === "2026-09-28",
  );
  const friday = days.find(
    (day) => day.id === "2026-09-25",
  );
  const sunday = days.find(
    (day) => day.id === "2026-09-27",
  );

  assert.deepEqual(
    saturday.routeAlternatives.map(
      ({ id, preferred }) => ({ id, preferred }),
    ),
    [
      { id: "coast-focused", preferred: true },
      { id: "big-tree-and-coast", preferred: false },
    ],
  );
  assert.ok(
    saturday.routeAlternatives[1].stopIds.includes(
      "big-tree-wayside",
    ),
  );
  assert.equal(
    saturday.routeAlternatives[0].stopIds.includes(
      "big-tree-wayside",
    ),
    false,
  );

  assert.match(
    monday.travelNotes[0],
    /stop wherever makes the most sense/i,
  );
  assert.match(
    monday.travelNotes.join(" "),
    /Longview.*Lake Sacajawea.*Nutty Narrows.*Castle Rock/i,
  );
  assert.match(
    monday.travelNotes.join(" "),
    /somewhere else or skip the break entirely/i,
  );
  assert.equal(
    monday.stops.some((stop) =>
      /Longview|Castle Rock|Lake Sacajawea|Nutty Narrows/i.test(
        `${stop.name} ${stop.navigationQuery ?? ""}`,
      ),
    ),
    false,
  );
  assert.equal(
    monday.stops.find(
      (stop) => stop.id === "chihuly-bridge-of-glass",
    ).priority,
    "required",
  );

  const referencedReservations = [
    friday.stops.find((stop) => stop.id === "sea-grill")
      .reservationId,
    saturday.stops.find(
      (stop) => stop.id === "spinners-dinner",
    ).reservationId,
    sunday.stops.find((stop) => stop.id === "georgies")
      .reservationId,
  ];
  const reservationMap = new Map(
    AdventureData.createPacificCoastLandReservations().map(
      (reservation) => [reservation.id, reservation],
    ),
  );

  for (const reservationId of referencedReservations) {
    assert.notEqual(
      reservationMap.get(reservationId).status,
      "Confirmed",
    );
  }
});

test("bundled Pacific reservations contain no confirmation fields", () => {
  const reservations = [
    ...AdventureData.createPacificCoastArrivalReservations(),
    ...AdventureData.createPacificCoastLandReservations(),
  ];

  assert.equal(
    reservations.some((reservation) =>
      Object.hasOwn(reservation, "confirmation"),
    ),
    false,
  );
});
