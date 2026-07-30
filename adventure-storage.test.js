"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
);

function createTestStorage() {
  const memory = AdventureStorage.createMemoryStorage();

  return AdventureStorage.createAdventureStorage({
    storageProvider: memory,
  });
}

test("saves and loads an Adventure Record", () => {
  const storage = createTestStorage();
  const record =
    AdventureData.createSmokiesAdventureRecord();

  const saved = storage.saveAdventureRecord(record);
  const loaded = storage.loadAdventureRecord(record.id);

  assert.deepEqual(loaded, saved);
  assert.notEqual(loaded, saved);
});

test("reports whether an Adventure Record exists", () => {
  const storage = createTestStorage();
  const record =
    AdventureData.createSmokiesAdventureRecord();

  assert.equal(storage.hasAdventureRecord(record.id), false);

  storage.saveAdventureRecord(record);

  assert.equal(storage.hasAdventureRecord(record.id), true);
});

test("lists stored Adventure Records without duplicating IDs", () => {
  const storage = createTestStorage();
  const first =
    AdventureData.createSmokiesAdventureRecord();
  const second = {
    ...AdventureData.createSmokiesAdventureRecord(),
    id: "blue-ridge-weekend",
    slug: "blue-ridge-weekend",
    title: "Blue Ridge Weekend",
  };

  storage.saveAdventureRecord(first);
  storage.saveAdventureRecord(second);
  storage.saveAdventureRecord({
    ...first,
    title: "Updated Smokies Adventure",
  });

  const records = storage.listAdventureRecords();

  assert.equal(records.length, 2);
  assert.deepEqual(
    records.map((record) => record.id),
    ["smokies-2026", "blue-ridge-weekend"],
  );
  assert.equal(
    records[0].title,
    "Updated Smokies Adventure",
  );
});

test("deletes an Adventure Record and removes it from the index", () => {
  const storage = createTestStorage();
  const record =
    AdventureData.createSmokiesAdventureRecord();

  storage.saveAdventureRecord(record);

  assert.equal(storage.deleteAdventureRecord(record.id), true);
  assert.equal(storage.hasAdventureRecord(record.id), false);
  assert.equal(storage.loadAdventureRecord(record.id), null);
  assert.deepEqual(storage.listAdventureRecords(), []);
});

test("returns false when deleting an Adventure Record that does not exist", () => {
  const storage = createTestStorage();

  assert.equal(
    storage.deleteAdventureRecord("missing-adventure"),
    false,
  );
});

test("normalizes records before saving them", () => {
  const storage = createTestStorage();

  const saved = storage.saveAdventureRecord({
    id: "partial-adventure",
    title: "Partial Adventure",
    memories: {},
  });

  assert.equal(saved.id, "partial-adventure");
  assert.ok(Array.isArray(saved.participants));
  assert.ok(Array.isArray(saved.memories.entries));
  assert.equal(saved.readiness.family.state, "unknown");
});

test("returns null for missing, invalid, or corrupted stored records", () => {
  const memory = AdventureStorage.createMemoryStorage({
    [`${AdventureStorage.STORAGE_KEY_PREFIX}corrupted`]:
      "{not valid JSON",
  });

  const storage = AdventureStorage.createAdventureStorage({
    storageProvider: memory,
  });

  assert.equal(storage.loadAdventureRecord("missing"), null);
  assert.equal(storage.loadAdventureRecord(""), null);
  assert.equal(storage.loadAdventureRecord("corrupted"), null);
});

test("recovers from a corrupted Adventure Record index", () => {
  const memory = AdventureStorage.createMemoryStorage({
    [AdventureStorage.STORAGE_INDEX_KEY]:
      "{not valid JSON",
  });

  const storage = AdventureStorage.createAdventureStorage({
    storageProvider: memory,
  });

  assert.deepEqual(storage.listAdventureRecords(), []);

  storage.saveAdventureRecord({
    id: "recovered-adventure",
    title: "Recovered Adventure",
  });

  assert.deepEqual(
    storage
      .listAdventureRecords()
      .map((record) => record.id),
    ["recovered-adventure"],
  );
});

test("fails clearly when no storage provider is available", () => {
  const storage =
    AdventureStorage.createAdventureStorage();

  assert.throws(
    () =>
      storage.saveAdventureRecord(
        AdventureData.createSmokiesAdventureRecord(),
      ),
    {
      message:
        "Adventure storage is unavailable in this environment.",
    },
  );
});

test("memory storage follows the localStorage contract", () => {
  const memory = AdventureStorage.createMemoryStorage();

  assert.equal(memory.length, 0);
  assert.equal(memory.getItem("key"), null);

  memory.setItem("key", 42);

  assert.equal(memory.getItem("key"), "42");
  assert.equal(memory.length, 1);
  assert.equal(memory.key(0), "key");

  memory.removeItem("key");

  assert.equal(memory.getItem("key"), null);
  assert.equal(memory.length, 0);
});