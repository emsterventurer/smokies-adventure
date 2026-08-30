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

test("enriches an empty Pacific Coast shell with the Arrival Day", () => {
  const shell =
    AdventureData.createPacificCoastAdventureRecord();

  const result =
    AdventureData.enrichPacificCoastAdventureRecord(
      shell,
    );

  assert.equal(result.enriched, true);
  assert.equal(
    result.adventure.itinerary.days[0].id,
    "2026-09-24",
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
    1,
  );
  assert.equal(
    first.adventure.reservations.items.length,
    2,
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

test("does not overwrite a non-empty Pacific Coast itinerary", () => {
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();
  adventure.itinerary.days.push({
    id: "user-day",
    date: "2026-09-24",
    title: "User-authored day",
  });

  const result =
    AdventureData.enrichPacificCoastAdventureRecord(
      adventure,
    );

  assert.equal(result.enriched, false);
  assert.equal(result.adventure, adventure);
  assert.deepEqual(
    result.adventure.itinerary.days,
    adventure.itinerary.days,
  );
  assert.deepEqual(
    result.adventure.reservations.items,
    [],
  );
});
