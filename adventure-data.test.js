"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require("./adventure/adventure-data.js");
const AdventurerDirectory = require("./adventure/adventurer-directory.js");

function legacyAvenueAdventure(withRouting = false) {
  const adventure = AdventureData.prepareBundledAdventureRecord(
    AdventureData.createPacificCoastAdventureRecord(),
  );
  const friday = adventure.itinerary.days.find((day) => day.id === "2026-09-25");
  delete friday.travelNotes;
  if (!withRouting) friday.stops.forEach((stop) => { delete stop.routeFromPrevious; });
  friday.stops.forEach((stop) => { delete stop.routingPassBy; });
  friday.stops[2].driveFromPrevious = "1 hr 25 min";
  friday.stops[3].priority = friday.stops[4].priority = "planned";
  friday.stops[3].notes = "Easy-access redwood context; no hiking is assumed.";
  friday.stops[4].notes = "Keep this a short, easy redwood experience; no strenuous walking.";
  return adventure;
}

test("Avenue preparation upgrades only approved routing, optional visits and lunch drive time", () => {
  const legacy = legacyAvenueAdventure();
  legacy.itinerary.days[1].custom = { keep: true };
  const original = structuredClone(legacy);
  const prepared = AdventureData.prepareBundledAdventureRecord(legacy);
  const friday = prepared.itinerary.days[1];
  assert.equal(friday.stops[2].routeFromPrevious.fromStopId, "nelson-family-vineyards");
  assert.equal(friday.stops[5].routeFromPrevious.fromStopId, "founders-grove");
  const withoutRouting = structuredClone(prepared);
  withoutRouting.itinerary.days[1].stops.forEach((stop) => { delete stop.routeFromPrevious; });
  withoutRouting.itinerary.days[1].stops.forEach((stop) => { delete stop.routingPassBy; });
  const expected = structuredClone(original);
  expected.itinerary.days[1].travelNotes = AdventureData.createPacificCoastLandDays()[0].travelNotes;
  expected.itinerary.days[1].stops[2].driveFromPrevious = "About 2 hr";
  for (const index of [3, 4]) {
    expected.itinerary.days[1].stops[index].priority = "optional";
    expected.itinerary.days[1].stops[index].notes = AdventureData.createPacificCoastLandDays()[0].stops[index].notes;
  }
  assert.deepEqual(withoutRouting, expected); // All other times, reservations, days and participants preserved.
  assert.deepEqual(legacy, original);
  const repeated = AdventureData.enrichPacificCoastAdventureRecord(prepared);
  assert.equal(repeated.enriched, false);
  assert.deepEqual(repeated.adventure, prepared);
  const smokies = AdventureData.createSmokiesAdventureRecord();
  assert.deepEqual(AdventureData.prepareBundledAdventureRecord(smokies), smokies);
  const unrelated = { ...original, id: "unrelated-adventure" };
  assert.deepEqual(AdventureData.prepareBundledAdventureRecord(unrelated), unrelated);
  const priorRouting = legacyAvenueAdventure(true);
  assert.deepEqual(AdventureData.prepareBundledAdventureRecord(priorRouting),
    AdventureData.prepareBundledAdventureRecord(legacyAvenueAdventure()));
});

test("Avenue upgrade leaves customized Friday routes and stops unchanged", () => {
  for (const customize of [
    (day) => { day.stops[2].navigationQuery = "Traveler destination"; },
    (day) => { day.stops[4].notes = "Traveler guidance"; },
    (day) => { day.stops[5].driveFromPrevious = "Traveler estimate"; },
    (day) => { day.stops[1].custom = true; },
    (day) => { day.stops[2].routeFromPrevious = { fromStopId: "custom", via: [] }; },
    (day) => { day.stops.splice(3, 0, { ...day.stops[2], id: "custom-stop" }); },
    (day) => { [day.stops[3], day.stops[4]] = [day.stops[4], day.stops[3]]; },
    (day) => { day.routeAlternatives = []; },
    (day) => { day.travelNotes = ["Traveler route guidance"]; },
  ]) {
    const legacy = legacyAvenueAdventure();
    customize(legacy.itinerary.days[1]);
    const original = structuredClone(legacy);
    assert.deepEqual(AdventureData.prepareBundledAdventureRecord(legacy), original);
  }
});

test("Friday clock amendment upgrades only known labels and preserves customizations", () => {
  const canonical = AdventureData.prepareBundledAdventureRecord(AdventureData.createPacificCoastAdventureRecord());
  for (const withRouting of [false, true, "optional"]) {
    const old = withRouting === "optional" ? structuredClone(canonical) : legacyAvenueAdventure(withRouting);
    const day = old.itinerary.days[1];
    ["About 12:35 PM", "About 1:55 PM", "About 2:30 PM", "About 4:05 PM", "About 6:00 PM"]
      .forEach((label, index) => { day.stops[index + 2].timeLabel = label; });
    assert.deepEqual(AdventureData.prepareBundledAdventureRecord(old), canonical);
    day.stops[2].timeLabel = "Traveler lunch time";
    assert.deepEqual(AdventureData.prepareBundledAdventureRecord(old), old);
  }
  const repeated = AdventureData.enrichPacificCoastAdventureRecord(canonical);
  assert.equal(repeated.enriched, false);
  assert.deepEqual(repeated.adventure, canonical);
});

test("creates the initial Adventurer Directory", () => {
  const directory = AdventurerDirectory.createInitialAdventurerDirectory();

  assert.equal(directory.schemaVersion, 1);
  assert.equal(directory.adventurers.length, 6);

  assert.deepEqual(
    directory.adventurers.map((adventurer) => adventurer.id),
    ["emily", "jake", "kaseryn", "bubbe", "papa", "carolyn"],
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

test("adds Carolyn to the directory and Pacific Coast only", () => {
  const carolyn = AdventurerDirectory.INITIAL_ADVENTURERS.find(
    (adventurer) => adventurer.id === "carolyn",
  );
  const pacific = AdventureData.createPacificCoastAdventureRecord();
  const smokies = AdventureData.createSmokiesAdventureRecord();

  assert.deepEqual(carolyn, {
    id: "carolyn",
    displayName: "Carolyn",
    relationshipLabel: null,
    avatar: null,
    active: true,
  });
  assert.deepEqual(pacific.participants, [
    {
      adventurerId: "carolyn",
      role: "traveler",
      includedInReadiness: true,
      adventurePreferences: {},
    },
  ]);
  assert.equal(
    smokies.participants.some(
      (participant) => participant.adventurerId === "carolyn",
    ),
    false,
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
  assert.deepEqual(adventure.participants, [
    {
      adventurerId: "carolyn",
      role: "traveler",
      includedInReadiness: true,
      adventurePreferences: {},
    },
  ]);
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
  assert.deepEqual(
    first.adventure.participants.map(
      (participant) => participant.adventurerId,
    ),
    ["carolyn"],
  );
});
test("upgrades only the known legacy Sea Grill reservation and remains idempotent", () => {
  const legacy =
    AdventureData.createPacificCoastAdventureRecord();

  legacy.reservations.items.push({
    id: "2026-09-25::Sea Grill",
    date: "2026-09-25",
    name: "Sea Grill",
    kind: "dinner",
    status: "Target",
    notes: "Target about 7:00 PM; not confirmed.",
  });

  const first =
    AdventureData.enrichPacificCoastAdventureRecord(
      legacy,
    );
  const seaGrill =
    first.adventure.reservations.items.find(
      (reservation) =>
        reservation.id === "2026-09-25::Sea Grill",
    );

  assert.equal(first.enriched, true);
  assert.equal(seaGrill.status, "Confirmed");
  assert.equal(seaGrill.time, "6:45 PM");
  assert.equal(seaGrill.notes, undefined);

  const second =
    AdventureData.enrichPacificCoastAdventureRecord(
      first.adventure,
    );

  assert.equal(second.enriched, false);
  assert.deepEqual(second.adventure, first.adventure);

  const customized =
    AdventureData.createPacificCoastAdventureRecord();

  customized.reservations.items.push({
    id: "2026-09-25::Sea Grill",
    date: "2026-09-25",
    name: "Sea Grill",
    kind: "dinner",
    status: "Confirmed",
    time: "7:15 PM",
    notes: "Traveler changed this reservation.",
  });

  const preparedCustom =
    AdventureData.enrichPacificCoastAdventureRecord(
      customized,
    );
  const customSeaGrill =
    preparedCustom.adventure.reservations.items.find(
      (reservation) =>
        reservation.id === "2026-09-25::Sea Grill",
    );

  assert.equal(customSeaGrill.status, "Confirmed");
  assert.equal(customSeaGrill.time, "7:15 PM");
  assert.equal(
    customSeaGrill.notes,
    "Traveler changed this reservation.",
  );
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
    /Longview.*Lake Sacajawea.*Nutty Narrows/i,
  );
  assert.match(
    monday.travelNotes.join(" "),
    /somewhere else or skip the additional break entirely/i,
  );
  assert.equal(
    monday.stops.some((stop) =>
      /Longview|Lake Sacajawea|Nutty Narrows/i.test(
        `${stop.name} ${stop.navigationQuery ?? ""}`,
      ),
    ),
    false,
  );
  assert.deepEqual(
    monday.stops.map((stop) => stop.id),
    [
      "hallmark-newport-departure",
      "tillamook-creamery",
      "castle-rock",
      "chihuly-bridge-of-glass",
      "embassy-suites-seattle-airport",
    ],
  );
  assert.equal(
    monday.travelNotes.join(" ").includes("Castle Rock"),
    false,
  );
  assert.equal(
    monday.stops.find(
      (stop) => stop.id === "chihuly-bridge-of-glass",
    ).priority,
    "required",
  );

  const seaGrillStop = friday.stops.find(
    (stop) => stop.id === "sea-grill",
  );
  const unconfirmedReservationIds = [
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

  const seaGrillReservation = reservationMap.get(
    seaGrillStop.reservationId,
  );

  assert.equal(
    seaGrillStop.reservationId,
    "2026-09-25::Sea Grill",
  );
  assert.equal(seaGrillStop.priority, "required");
  assert.equal(seaGrillStop.timeLabel, undefined);
  assert.equal(seaGrillReservation.status, "Confirmed");
  assert.equal(seaGrillReservation.time, "6:45 PM");
  assert.equal(seaGrillReservation.notes, undefined);

  for (const reservationId of unconfirmedReservationIds) {
    assert.notEqual(
      reservationMap.get(reservationId).status,
      "Confirmed",
    );
  }

});

test("preserves the reviewed Pacific drive durations and intentional gaps", () => {
  const arrival = AdventureData.createPacificCoastArrivalDay();
  const days = new Map(
    AdventureData.createPacificCoastLandDays().map(
      (day) => [day.id, day],
    ),
  );
  const stops = (dayId) =>
    new Map(
      days.get(dayId).stops.map((stop) => [stop.id, stop]),
    );

  assert.deepEqual(
    arrival.stops.slice(1).map((stop) => stop.driveFromPrevious),
    ["1 hr 30 min–2 hr", "2–5 min"],
  );

  assert.deepEqual(
    [...stops("2026-09-25").values()]
      .slice(1)
      .map((stop) => stop.driveFromPrevious),
    [
      "55 min",
      "About 2 hr",
      "30 min",
      "10 min",
      "50 min",
      "27–30 min",
      "5–10 min",
    ],
  );

  const saturday = days.get("2026-09-26");
  assert.deepEqual(
    saturday.stops.slice(1, 5).map(
      (stop) => stop.driveFromPrevious,
    ),
    ["1 hr 40 min", "30 min", "15 min", "45–60 min"],
  );
  assert.equal(
    saturday.stops.find((stop) => stop.id === "spinners-dinner")
      .driveFromPrevious,
    undefined,
  );
  assert.deepEqual(
    saturday.routeAlternatives[1]
      .driveFromPreviousByStopId,
    {
      "newton-b-drury-scenic-parkway": "1 hr 10 min",
      "crescent-city": "50 min",
      "brookings-harris-beach": "30 min",
      "samuel-h-boardman-viewpoint": "15 min",
      "pacific-reef-hotel": "45 min",
    },
  );
  assert.equal(
    saturday.alternativeRouteStops.find(
      (stop) => stop.id === "big-tree-wayside",
    ).driveFromPrevious,
    "10–15 min",
  );

  const sunday = stops("2026-09-27");
  assert.deepEqual(
    [...sunday.values()].slice(1).map(
      (stop) => stop.driveFromPrevious,
    ),
    [
      "1 hr 10–15 min",
      "10 min",
      "5 min",
      "1 hr 30 min",
      "1 hr 15–30 min",
      undefined,
    ],
  );

  const monday = stops("2026-09-28");
  assert.deepEqual(
    [...monday.values()].slice(1).map(
      (stop) => stop.driveFromPrevious,
    ),
    [
      "1 hr 32–37 min",
      "2 hr 15 min",
      "1 hr 30 min",
      "30–45 min",
    ],
  );
  assert.equal(
    [...monday.values()].some((stop) =>
      /Longview|Lake Sacajawea|Nutty Narrows/i.test(
        `${stop.name} ${stop.navigationQuery ?? ""}`,
      ),
    ),
    false,
  );
});

test("upgrades the known stored Monday shape and Pacific participants once", () => {
  const adventure = AdventureData.createPacificCoastAdventureRecord();
  adventure.participants = [
    {
      adventurerId: "emily",
      role: "organizer",
      custom: "preserved",
    },
  ];
  const monday = AdventureData.createPacificCoastLandDays().find(
    (day) => day.id === "2026-09-28",
  );
  monday.stops = monday.stops.filter(
    (stop) => stop.id !== "castle-rock",
  );
  monday.stops.find(
    (stop) => stop.id === "chihuly-bridge-of-glass",
  ).driveFromPrevious = "3 hr 31–57 min DIRECT";
  monday.travelNotes[1] =
    "Potential suggestions only: Longview — Lake Sacajawea / Nutty Narrows area, or Castle Rock. Travelers may stop somewhere else or skip the break entirely.";
  monday.custom = { preserved: true };
  monday.stops.push({
    id: "traveler-authored-stop",
    name: "Traveler-authored stop",
    custom: true,
  });
  adventure.itinerary.days = [monday];

  const first = AdventureData.enrichPacificCoastAdventureRecord(adventure);
  const second = AdventureData.enrichPacificCoastAdventureRecord(
    first.adventure,
  );
  const preparedMonday = first.adventure.itinerary.days.find(
    (day) => day.id === "2026-09-28",
  );

  assert.equal(first.enriched, true);
  assert.equal(second.enriched, false);
  assert.equal(preparedMonday.custom.preserved, true);
  assert.equal(
    preparedMonday.stops.filter((stop) => stop.id === "castle-rock")
      .length,
    1,
  );
  assert.equal(
    preparedMonday.stops.find(
      (stop) => stop.id === "chihuly-bridge-of-glass",
    ).driveFromPrevious,
    "1 hr 30 min",
  );
  assert.equal(
    preparedMonday.stops.find(
      (stop) => stop.id === "castle-rock",
    ).driveFromPrevious,
    "2 hr 15 min",
  );
  assert.ok(
    preparedMonday.stops.some(
      (stop) => stop.id === "traveler-authored-stop" && stop.custom,
    ),
  );
  assert.match(preparedMonday.travelNotes.join(" "), /Longview/);
  assert.doesNotMatch(preparedMonday.travelNotes.join(" "), /Castle Rock/);
  assert.deepEqual(
    first.adventure.participants.map(
      (participant) => participant.adventurerId,
    ),
    ["emily", "carolyn"],
  );
  assert.equal(first.adventure.participants[0].custom, "preserved");
});

test("does not bundle Carolyn email identity information", () => {
  const bundled = JSON.stringify({
    directory: AdventurerDirectory.createInitialAdventurerDirectory(),
    pacific: AdventureData.createPacificCoastAdventureRecord(),
  });

  assert.doesNotMatch(bundled, /@/);
});

test("additively prepares missing drive metadata on stored Pacific days", () => {
  const adventure =
    AdventureData.enrichPacificCoastAdventureRecord(
      AdventureData.createPacificCoastAdventureRecord(),
    ).adventure;
  const saturday = adventure.itinerary.days.find(
    (day) => day.id === "2026-09-26",
  );
  const storedSummary = saturday.summary;

  saturday.stops.forEach((stop) => {
    delete stop.driveFromPrevious;
  });
  saturday.routeAlternatives.forEach((route) => {
    delete route.driveFromPreviousByStopId;
  });

  const first =
    AdventureData.enrichPacificCoastAdventureRecord(
      adventure,
    );
  const preparedSaturday = first.adventure.itinerary.days.find(
    (day) => day.id === "2026-09-26",
  );
  const second =
    AdventureData.enrichPacificCoastAdventureRecord(
      first.adventure,
    );

  assert.equal(first.enriched, true);
  assert.equal(preparedSaturday.summary, storedSummary);
  assert.equal(
    preparedSaturday.stops.find(
      (stop) => stop.id === "crescent-city",
    ).driveFromPrevious,
    "1 hr 40 min",
  );
  assert.equal(
    preparedSaturday.routeAlternatives.find(
      (route) => route.id === "big-tree-and-coast",
    ).driveFromPreviousByStopId["crescent-city"],
    "50 min",
  );
  assert.equal(second.enriched, false);
  assert.equal(second.adventure, first.adventure);
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
