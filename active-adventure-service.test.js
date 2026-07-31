"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
);
const ActiveAdventure = require(
  "./adventure/active-adventure.js",
);

function createTestService(options = {}) {
  const memory = AdventureStorage.createMemoryStorage();
  const adventureStorage =
    AdventureStorage.createAdventureStorage({
      storageProvider: memory,
    });

  const service =
    ActiveAdventure.createActiveAdventureService({
      adventureStorage,
      selectionStorage: memory,
      seedFactory:
        options.seedFactory === undefined
          ? AdventureData.createSmokiesAdventureRecord
          : options.seedFactory,
    });

  return {
    memory,
    adventureStorage,
    service,
  };
}

test("loads the currently selected Adventure Record", () => {
  const {
    adventureStorage,
    service,
  } = createTestService();

  const record =
    AdventureData.createSmokiesAdventureRecord();

  adventureStorage.saveAdventureRecord(record);
  service.setActiveAdventureId(record.id);

  const result = service.loadActiveAdventure();

  assert.equal(result.status, "loaded");
  assert.equal(result.adventure.id, record.id);
});

test("selects the first stored adventure when no active ID exists", () => {
  const {
    adventureStorage,
    service,
  } = createTestService();

  adventureStorage.saveAdventureRecord({
    ...AdventureData.createSmokiesAdventureRecord(),
    id: "blue-ridge-weekend",
    slug: "blue-ridge-weekend",
    title: "Blue Ridge Weekend",
  });

  const result = service.loadActiveAdventure();

  assert.equal(result.status, "selected");
  assert.equal(
    result.adventure.id,
    "blue-ridge-weekend",
  );
  assert.equal(
    service.getActiveAdventureId(),
    "blue-ridge-weekend",
  );
});

test("creates and saves the seed adventure when storage is empty", () => {
  const { adventureStorage, service } =
    createTestService();

  const result = service.loadActiveAdventure();

  assert.equal(result.status, "seeded");
  assert.equal(result.adventure.id, "smokies-2026");
  assert.equal(
    adventureStorage.hasAdventureRecord(
      "smokies-2026",
    ),
    true,
  );
  assert.equal(
    service.getActiveAdventureId(),
    "smokies-2026",
  );
});

test("returns an empty result when no adventure or seed is available", () => {
  const { service } = createTestService({
    seedFactory: null,
  });

  const result = service.loadActiveAdventure();

  assert.deepEqual(result, {
    status: "empty",
    adventure: null,
  });
});

test("saves updates to the active adventure", () => {
  const { service } = createTestService();

  const initial = service.loadActiveAdventure();

  const updated = service.saveActiveAdventure({
    ...initial.adventure,
    title: "Updated Smokies Adventure",
  });

  assert.equal(
    updated.title,
    "Updated Smokies Adventure",
  );
  assert.equal(
    service.getActiveAdventure().title,
    "Updated Smokies Adventure",
  );
});

test("exports the active adventure as versioned JSON", () => {
  const { service } = createTestService();

  service.loadActiveAdventure();

  const exported = service.exportActiveAdventure();
  const parsed = JSON.parse(exported);

  assert.equal(parsed.exportType, "adventure-companion");
  assert.equal(parsed.exportVersion, 1);
  assert.equal(parsed.adventure.id, "smokies-2026");
  assert.equal(parsed.adventure.schemaVersion, 1);
});

test("returns null when exporting without an active adventure", () => {
  const { service } = createTestService({
    seedFactory: null,
  });

  assert.equal(service.exportActiveAdventure(), null);
});

test("does not replace a stored adventure with seed data", () => {
  const {
    adventureStorage,
    service,
  } = createTestService();

  adventureStorage.saveAdventureRecord({
    ...AdventureData.createSmokiesAdventureRecord(),
    title: "My Saved Smokies Adventure",
  });

  const result = service.loadActiveAdventure();

  assert.equal(
    result.adventure.title,
    "My Saved Smokies Adventure",
  );
  assert.notEqual(result.status, "seeded");
});