"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const MediaStore = require(
  "./adventure/media-store.js",
);

function createTestStore() {
  const provider =
    MediaStore.createMemoryMediaProvider();

  return {
    provider,
    store: MediaStore.createMediaStore({
      provider,
    }),
  };
}

function createMediaRecord(overrides = {}) {
  return {
    id: "photo-1",
    adventureId: "smokies-2026",
    memoryId: "memory-1",
    type: "image",
    mimeType: "image/jpeg",
    fileName: "smokies.jpg",
    blob: {
      bytes: [1, 2, 3],
    },
    createdAt: "2026-08-07T12:00:00-04:00",
    updatedAt: "2026-08-07T12:00:00-04:00",
    ...overrides,
  };
}

test("reports whether media storage is available", async () => {
  const { store } = createTestStore();

  assert.equal(await store.isAvailable(), true);

  const unavailableStore =
    MediaStore.createMediaStore();

  assert.equal(
    await unavailableStore.isAvailable(),
    false,
  );
});

test("saves and loads a media record", async () => {
  const { store } = createTestStore();
  const record = createMediaRecord();

  const saved = await store.saveMedia(record);
  const loaded = await store.getMedia(record.id);

  assert.deepEqual(loaded, saved);
  assert.notEqual(loaded, saved);
});

test("normalizes optional media fields before saving", async () => {
  const { store } = createTestStore();

  const saved = await store.saveMedia({
    id: "photo-2",
    adventureId: "smokies-2026",
    memoryId: "memory-2",
    blob: {
      bytes: [4, 5, 6],
    },
  });

  assert.equal(saved.type, "image");
  assert.equal(
    saved.mimeType,
    "application/octet-stream",
  );
  assert.equal(saved.fileName, null);
  assert.equal(saved.createdAt, null);
  assert.equal(saved.updatedAt, null);
});

test("rejects malformed media records", async () => {
  const { store } = createTestStore();

  await assert.rejects(
    () => store.saveMedia(null),
    {
      message:
        "Adventure Media record must be an object.",
    },
  );

  await assert.rejects(
    () =>
      store.saveMedia({
        adventureId: "smokies-2026",
        memoryId: "memory-1",
      }),
    {
      message:
        "Adventure Media record id must be a non-empty string.",
    },
  );

  await assert.rejects(
    () =>
      store.saveMedia({
        id: "photo-1",
        memoryId: "memory-1",
      }),
    {
      message:
        "Adventure Media adventureId must be a non-empty string.",
    },
  );

  await assert.rejects(
    () =>
      store.saveMedia({
        id: "photo-1",
        adventureId: "smokies-2026",
      }),
    {
      message:
        "Adventure Media memoryId must be a non-empty string.",
    },
  );
});

test("returns null for missing or invalid media IDs", async () => {
  const { store } = createTestStore();

  assert.equal(await store.getMedia("missing"), null);
  assert.equal(await store.getMedia(""), null);
  assert.equal(await store.getMedia(null), null);
});

test("lists all saved media records", async () => {
  const { store } = createTestStore();

  await store.saveMedia(
    createMediaRecord({
      id: "photo-1",
      memoryId: "memory-1",
    }),
  );

  await store.saveMedia(
    createMediaRecord({
      id: "photo-2",
      memoryId: "memory-2",
    }),
  );

  const records = await store.listMedia();

  assert.equal(records.length, 2);
  assert.deepEqual(
    records.map((record) => record.id),
    ["photo-1", "photo-2"],
  );
});

test("lists media for a specific memory", async () => {
  const { store } = createTestStore();

  await store.saveMedia(
    createMediaRecord({
      id: "photo-1",
      memoryId: "memory-1",
    }),
  );

  await store.saveMedia(
    createMediaRecord({
      id: "photo-2",
      memoryId: "memory-2",
    }),
  );

  await store.saveMedia(
    createMediaRecord({
      id: "photo-3",
      memoryId: "memory-1",
    }),
  );

  const records =
    await store.listMediaForMemory("memory-1");

  assert.deepEqual(
    records.map((record) => record.id),
    ["photo-1", "photo-3"],
  );

  assert.deepEqual(
    await store.listMediaForMemory(""),
    [],
  );
});

test("lists media for a specific adventure", async () => {
  const { store } = createTestStore();

  await store.saveMedia(
    createMediaRecord({
      id: "photo-1",
      adventureId: "smokies-2026",
    }),
  );

  await store.saveMedia(
    createMediaRecord({
      id: "photo-2",
      adventureId: "yellowstone-2027",
    }),
  );

  const records =
    await store.listMediaForAdventure(
      "smokies-2026",
    );

  assert.deepEqual(
    records.map((record) => record.id),
    ["photo-1"],
  );

  assert.deepEqual(
    await store.listMediaForAdventure(""),
    [],
  );
});

test("deletes a media record", async () => {
  const { store } = createTestStore();

  await store.saveMedia(createMediaRecord());

  assert.equal(
    await store.deleteMedia("photo-1"),
    true,
  );

  assert.equal(
    await store.getMedia("photo-1"),
    null,
  );

  assert.equal(
    await store.deleteMedia("photo-1"),
    false,
  );

  assert.equal(
    await store.deleteMedia(""),
    false,
  );
});

test("clears all media records", async () => {
  const { store } = createTestStore();

  await store.saveMedia(
    createMediaRecord({
      id: "photo-1",
    }),
  );

  await store.saveMedia(
    createMediaRecord({
      id: "photo-2",
    }),
  );

  await store.clearMedia();

  assert.deepEqual(await store.listMedia(), []);
});

test("memory media provider creates independent values", async () => {
  const provider =
    MediaStore.createMemoryMediaProvider();

  const original = createMediaRecord();

  await provider.save(original);

  original.fileName = "changed.jpg";

  const loaded = await provider.get("photo-1");

  assert.equal(loaded.fileName, "smokies.jpg");

  loaded.fileName = "changed-again.jpg";

  const loadedAgain =
    await provider.get("photo-1");

  assert.equal(
    loadedAgain.fileName,
    "smokies.jpg",
  );
});

test("fails clearly when media storage is unavailable", async () => {
  const store = MediaStore.createMediaStore();

  await assert.rejects(
    () => store.listMedia(),
    {
      message:
        "Adventure media storage is unavailable in this environment.",
    },
  );
});