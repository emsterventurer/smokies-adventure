"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require("./adventure/adventure-data.js");
const AdventureValidation = require(
  "./adventure/adventure-validation.js",
);
const AdventureNormalization = require(
  "./adventure/adventure-normalization.js",
);

test("accepts a valid Adventure Record", () => {
  const record = AdventureData.createSmokiesAdventureRecord();

  const result =
    AdventureValidation.validateAdventureRecord(record);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rejects a non-object Adventure Record", () => {
  const result =
    AdventureValidation.validateAdventureRecord(null);

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [
    {
      path: "",
      code: "EXPECTED_OBJECT",
      message: "Adventure Record must be an object.",
    },
  ]);
});

test("returns structured errors for malformed Adventure Records", () => {
  const record = AdventureData.createSmokiesAdventureRecord();

  record.id = "";
  record.participants = "everyone";
  record.memories.entries = [
    {
      id: "",
      adventurerIds: "emily",
    },
  ];

  const result =
    AdventureValidation.validateAdventureRecord(record);

  assert.equal(result.valid, false);

  assert.ok(
    result.errors.some(
      (error) =>
        error.path === "id" &&
        error.code === "REQUIRED_STRING",
    ),
  );

  assert.ok(
    result.errors.some(
      (error) =>
        error.path === "participants" &&
        error.code === "EXPECTED_ARRAY",
    ),
  );

  assert.ok(
    result.errors.some(
      (error) =>
        error.path === "memories.entries[0].id" &&
        error.code === "REQUIRED_STRING",
    ),
  );

  assert.ok(
    result.errors.some(
      (error) =>
        error.path ===
          "memories.entries[0].adventurerIds" &&
        error.code === "EXPECTED_ARRAY",
    ),
  );
});

test("normalizes a partial Adventure Record with safe defaults", () => {
  const normalized =
    AdventureNormalization.normalizeAdventureRecord({
      id: "weekend-adventure",
      title: "Weekend in the Mountains",
      memories: {},
    });

  assert.equal(normalized.id, "weekend-adventure");
  assert.equal(
    normalized.title,
    "Weekend in the Mountains",
  );
  assert.equal(
    normalized.schemaVersion,
    AdventureData.SCHEMA_VERSION,
  );

  assert.ok(Array.isArray(normalized.participants));
  assert.ok(Array.isArray(normalized.itinerary.days));
  assert.ok(Array.isArray(normalized.reservations.items));
  assert.ok(Array.isArray(normalized.packing.sharedItems));
  assert.ok(Array.isArray(normalized.memories.entries));
  assert.ok(
    Array.isArray(normalized.media.referencedMediaIds),
  );

  assert.equal(normalized.readiness.family.state, "unknown");
});

test("normalization preserves existing user data", () => {
  const source = {
    id: "custom-adventure",
    title: "Custom Adventure",
    customField: {
      favoriteTrail: "Laurel Falls",
    },
    preferences: {
      breakfastWindow: "8:30–9:30 AM",
      notes: ["Leave room for dessert."],
    },
    memories: {
      entries: [
        {
          id: "memory-1",
          title: "A Wonderful View",
          note: "The whole family stopped to take it in.",
          adventurerIds: ["emily", "jake"],
          locationIds: ["scenic-overlook"],
          activityIds: [],
          mediaIds: ["photo-1"],
          tags: ["mountains", "family"],
          favorite: true,
        },
      ],
    },
  };

  const normalized =
    AdventureNormalization.normalizeAdventureRecord(source);

  assert.deepEqual(normalized.customField, {
    favoriteTrail: "Laurel Falls",
  });

  assert.equal(
    normalized.preferences.breakfastWindow,
    "8:30–9:30 AM",
  );

  assert.deepEqual(normalized.preferences.notes, [
    "Leave room for dessert.",
  ]);

  assert.equal(
    normalized.memories.entries[0].title,
    "A Wonderful View",
  );

  assert.deepEqual(
    normalized.memories.entries[0].adventurerIds,
    ["emily", "jake"],
  );

  assert.equal(
    normalized.memories.entries[0].favorite,
    true,
  );
});

test("normalization does not mutate the source object", () => {
  const source = {
    id: "immutable-source",
    preferences: {
      notes: ["Original note"],
    },
    memories: {
      entries: [
        {
          id: "memory-1",
          adventurerIds: ["emily"],
        },
      ],
    },
  };

  const sourceSnapshot = structuredClone(source);

  const normalized =
    AdventureNormalization.normalizeAdventureRecord(source);

  normalized.preferences.notes.push("New normalized note");
  normalized.memories.entries[0].adventurerIds.push("jake");

  assert.deepEqual(source, sourceSnapshot);
});

test("normalization produces a record that passes validation", () => {
  const normalized =
    AdventureNormalization.normalizeAdventureRecord({
      id: "normalized-adventure",
      participants: [
        {
          adventurerId: "emily",
        },
      ],
    });

  const result =
    AdventureValidation.validateAdventureRecord(normalized);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});