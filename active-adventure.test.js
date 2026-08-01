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

function createTestManager() {
  const memory = AdventureStorage.createMemoryStorage();
  const adventureStorage =
    AdventureStorage.createAdventureStorage({
      storageProvider: memory,
    });
  const manager =
    ActiveAdventure.createActiveAdventureManager({
      adventureStorage,
      selectionStorage: memory,
    });

  return {
    memory,
    adventureStorage,
    manager,
  };
}

test("requires a valid adventure storage instance", () => {
  const memory = AdventureStorage.createMemoryStorage();

  assert.throws(
    () =>
      ActiveAdventure.createActiveAdventureManager({
        selectionStorage: memory,
      }),
    {
      message:
        "A valid adventureStorage instance is required.",
    },
  );
});

test("requires a valid selection storage provider", () => {
  const memory = AdventureStorage.createMemoryStorage();
  const adventureStorage =
    AdventureStorage.createAdventureStorage({
      storageProvider: memory,
    });

  assert.throws(
    () =>
      ActiveAdventure.createActiveAdventureManager({
        adventureStorage,
      }),
    {
      message:
        "A valid selectionStorage provider is required.",
    },
  );
});

test("returns null when no active adventure is selected", () => {
  const { manager } = createTestManager();

  assert.equal(manager.getActiveAdventureId(), null);
  assert.equal(manager.getActiveAdventure(), null);
});

test("saves an Adventure Record and makes it active", () => {
  const { manager } = createTestManager();
  const record =
    AdventureData.createSmokiesAdventureRecord();

  const saved = manager.saveActiveAdventure(record);

  assert.equal(manager.getActiveAdventureId(), record.id);
  assert.deepEqual(manager.getActiveAdventure(), saved);
});

test("switches between stored Adventure Records", () => {
  const { adventureStorage, manager } =
    createTestManager();

  const smokies =
    AdventureData.createSmokiesAdventureRecord();
  const blueRidge = {
    ...AdventureData.createSmokiesAdventureRecord(),
    id: "blue-ridge-weekend",
    slug: "blue-ridge-weekend",
    title: "Blue Ridge Weekend",
  };

  adventureStorage.saveAdventureRecord(smokies);
  adventureStorage.saveAdventureRecord(blueRidge);

  manager.setActiveAdventureId(smokies.id);

  assert.equal(
    manager.getActiveAdventure().id,
    smokies.id,
  );

  manager.setActiveAdventureId(blueRidge.id);

  assert.equal(
    manager.getActiveAdventure().id,
    blueRidge.id,
  );
});

test("rejects invalid active Adventure IDs", () => {
  const { manager } = createTestManager();

  assert.throws(
    () => manager.setActiveAdventureId(""),
    {
      message: "A valid adventureId is required.",
    },
  );
});

test("rejects an Adventure ID that is not stored", () => {
  const { manager } = createTestManager();

  assert.throws(
    () =>
      manager.setActiveAdventureId(
        "missing-adventure",
      ),
    {
      message:
        "Adventure Record not found: missing-adventure",
    },
  );
});

test("clears the active Adventure selection", () => {
  const { manager } = createTestManager();

  manager.saveActiveAdventure(
    AdventureData.createSmokiesAdventureRecord(),
  );

  assert.equal(manager.clearActiveAdventure(), true);
  assert.equal(manager.getActiveAdventureId(), null);
  assert.equal(manager.getActiveAdventure(), null);
  assert.equal(manager.clearActiveAdventure(), false);
});

test("removes a stale active selection when the record is missing", () => {
  const {
    adventureStorage,
    manager,
    memory,
  } = createTestManager();

  const record =
    AdventureData.createSmokiesAdventureRecord();

  manager.saveActiveAdventure(record);
  adventureStorage.deleteAdventureRecord(record.id);

  assert.equal(manager.getActiveAdventure(), null);
  assert.equal(
    memory.getItem(
      ActiveAdventure.ACTIVE_ADVENTURE_KEY,
    ),
    null,
  );
});