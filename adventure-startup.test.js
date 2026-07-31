"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
);
const AdventureStartup = require(
  "./adventure/adventure-startup.js",
);

function createTestStartup(options = {}) {
  const storageProvider =
    AdventureStorage.createMemoryStorage(
      options.initialEntries,
    );

  const startup =
    AdventureStartup.createAdventureStartup({
      storageProvider,
      seedFactory:
        options.seedFactory === undefined
          ? AdventureData.createSmokiesAdventureRecord
          : options.seedFactory,
      migratedAt:
        options.migratedAt ||
        "2026-07-31T18:00:00-04:00",
    });

  return {
    storageProvider,
    startup,
  };
}

test("loads an existing active Adventure Record", () => {
  const { startup } = createTestStartup();

  const saved =
    startup.activeAdventureService.saveActiveAdventure(
      AdventureData.createSmokiesAdventureRecord(),
    );

  const result = startup.initializeAdventure();

  assert.equal(result.status, "loaded");
  assert.deepEqual(result.adventure, saved);
});

test("selects the first stored adventure when no active ID exists", () => {
  const { startup } = createTestStartup();

  startup.adventureStorage.saveAdventureRecord({
    ...AdventureData.createSmokiesAdventureRecord(),
    id: "blue-ridge-weekend",
    slug: "blue-ridge-weekend",
    title: "Blue Ridge Weekend",
  });

  const result = startup.initializeAdventure();

  assert.equal(result.status, "selected");
  assert.equal(
    result.adventure.id,
    "blue-ridge-weekend",
  );
});

test("seeds the Smokies Adventure when no stored data exists", () => {
  const { startup } = createTestStartup();

  const result = startup.initializeAdventure();

  assert.equal(result.status, "seeded");
  assert.equal(result.adventure.id, "smokies-2026");
  assert.equal(
    startup.adventureStorage.hasAdventureRecord(
      "smokies-2026",
    ),
    true,
  );
});

test("migrates legacy adventure data when seeding the first adventure", () => {
  const { startup } = createTestStartup({
    initialEntries: {
      acCompletedDays008: JSON.stringify([
        "2026-08-07",
      ]),
      adventureCompanionReadiness:
        JSON.stringify({
          emily: {
            state: "ready",
          },
        }),
      adventureCompanionPackingM3041:
        JSON.stringify({
          "packing-item-1": true,
        }),
    },
  });

  const result = startup.initializeAdventure();

  assert.equal(result.status, "migrated");

  assert.deepEqual(
    result.adventure.completion.completedDayIds,
    ["2026-08-07"],
  );

  assert.deepEqual(
    result.adventure.readiness.travelers,
    {
      emily: {
        state: "ready",
      },
    },
  );

  assert.deepEqual(
    result.adventure.packing.travelers,
    {
      "packing-item-1": true,
    },
  );

  assert.equal(
    result.adventure.metadata.migratedAt,
    "2026-07-31T18:00:00-04:00",
  );
});

test("does not overwrite an existing stored adventure with legacy data", () => {
  const { storageProvider, startup } =
    createTestStartup();

  storageProvider.setItem(
    "acCompletedDays008",
    JSON.stringify(["2026-08-07"]),
  );

  startup.activeAdventureService.saveActiveAdventure({
    ...AdventureData.createSmokiesAdventureRecord(),
    title: "My Saved Smokies Adventure",
  });

  const result = startup.initializeAdventure();

  assert.equal(result.status, "loaded");
  assert.equal(
    result.adventure.title,
    "My Saved Smokies Adventure",
  );

  assert.deepEqual(
    result.adventure.completion.completedDayIds,
    [],
  );
});

test("retains legacy storage after migration", () => {
  const { storageProvider, startup } =
    createTestStartup({
      initialEntries: {
        acCompletedDays008: JSON.stringify([
          "2026-08-07",
        ]),
      },
    });

  startup.initializeAdventure();

  assert.equal(
    storageProvider.getItem(
      "acCompletedDays008",
    ),
    JSON.stringify(["2026-08-07"]),
  );
});

test("returns an empty result when no seed factory exists", () => {
  const { startup } = createTestStartup({
    seedFactory: null,
  });

  const result = startup.initializeAdventure();

  assert.deepEqual(result, {
    status: "empty",
    adventure: null,
  });
});

test("initialization is idempotent after migration", () => {
  const { startup } = createTestStartup({
    initialEntries: {
      acCompletedDays008: JSON.stringify([
        "2026-08-07",
      ]),
    },
  });

  const first = startup.initializeAdventure();
  const second = startup.initializeAdventure();

  assert.equal(first.status, "migrated");
  assert.equal(second.status, "loaded");
  assert.deepEqual(
    second.adventure,
    first.adventure,
  );
});
test("loads browser modules in dependency order before app startup", () => {
  const indexHtml = fs.readFileSync(
    path.join(__dirname, "index.html"),
    "utf8",
  );

  const requiredScripts = [
    "adventure/adventurer-directory.js",
    "adventure/adventure-data.js",
    "adventure/adventure-normalization.js",
    "adventure/adventure-validation.js",
    "adventure/adventure-migration.js",
    "adventure/adventure-storage.js",
    "adventure/active-adventure.js",
    "adventure/media-store.js",
    "adventure/adventure-startup.js",
    "shared-state.js",
    "adventure-brain.js",
    "living-campfire.js",
    "app.js",
  ];

  const positions = requiredScripts.map((script) => {
    const position = indexHtml.indexOf(
      `src="${script}"`,
    );

    assert.notEqual(
      position,
      -1,
      `Expected index.html to load ${script}.`,
    );

    return position;
  });

  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(
      positions[index] > positions[index - 1],
      `${requiredScripts[index]} must load after ${requiredScripts[index - 1]}.`,
    );
  }
});

test("initializes durable adventure data before itinerary rendering and keeps reliability last", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  const durableInitialization =
    appSource.indexOf(
      "initializeDurableAdventureData();",
    );

  const itineraryAssignment =
    appSource.indexOf("DATA = {");

  const initialRender =
    appSource.indexOf("drawPhase(now);");

  const reliabilityHandshake =
    appSource.lastIndexOf(
      "window.AdventureReliability?.markAppReady",
    );

  assert.notEqual(durableInitialization, -1);
  assert.notEqual(itineraryAssignment, -1);
  assert.notEqual(initialRender, -1);
  assert.notEqual(reliabilityHandshake, -1);

  assert.ok(
    durableInitialization < itineraryAssignment,
    "Durable Adventure Data must initialize before the legacy itinerary assignment.",
  );

  assert.ok(
    itineraryAssignment < initialRender,
    "The itinerary must exist before initial rendering.",
  );

  assert.ok(
    initialRender < reliabilityHandshake,
    "The Reliability Handshake must remain after startup and rendering initialization.",
  );
});