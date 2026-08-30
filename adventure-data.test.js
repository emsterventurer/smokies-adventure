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
