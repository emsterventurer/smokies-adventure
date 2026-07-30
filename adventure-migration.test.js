"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureMigration = require(
  "./adventure/adventure-migration.js",
);
const AdventureValidation = require(
  "./adventure/adventure-validation.js",
);

test("reports that a current valid Adventure Record does not need migration", () => {
  const record =
    AdventureData.createSmokiesAdventureRecord();

  assert.equal(
    AdventureMigration.needsAdventureMigration(record),
    false,
  );
});

test("reports that an older schema version needs migration", () => {
  const record = {
    ...AdventureData.createSmokiesAdventureRecord(),
    schemaVersion: "legacy-version",
  };

  assert.equal(
    AdventureMigration.needsAdventureMigration(record),
    true,
  );
});

test("reports that malformed data needs migration", () => {
  assert.equal(
    AdventureMigration.needsAdventureMigration(null),
    true,
  );

  assert.equal(
    AdventureMigration.needsAdventureMigration({
      schemaVersion: AdventureData.SCHEMA_VERSION,
    }),
    true,
  );
});

test("migrates a partial record to the current schema", () => {
  const migrated =
    AdventureMigration.migrateAdventureRecord({
      id: "legacy-adventure",
      title: "Legacy Adventure",
      schemaVersion: "legacy-version",
    });

  assert.equal(migrated.id, "legacy-adventure");
  assert.equal(migrated.title, "Legacy Adventure");
  assert.equal(
    migrated.schemaVersion,
    AdventureData.SCHEMA_VERSION,
  );
  assert.ok(Array.isArray(migrated.participants));
  assert.ok(Array.isArray(migrated.memories.entries));
  assert.equal(
    AdventureValidation.validateAdventureRecord(
      migrated,
    ).valid,
    true,
  );
});

test("migrates a legacy adventurers array into participants", () => {
  const migrated =
    AdventureMigration.migrateAdventureRecord({
      id: "legacy-adventure",
      title: "Legacy Adventure",
      adventurers: [
        "emily",
        {
          id: "jake",
          role: "participant",
        },
      ],
    });

  assert.deepEqual(
    migrated.participants.map(
      (participant) => participant.adventurerId,
    ),
    ["emily", "jake"],
  );
});

test("migrates a legacy memories array into memory entries", () => {
  const memories = [
    {
      id: "memory-1",
      title: "First Memory",
    },
  ];

  const migrated =
    AdventureMigration.migrateAdventureRecord({
      id: "legacy-adventure",
      title: "Legacy Adventure",
      memories,
    });

  assert.equal(migrated.memories.entries.length, 1);
assert.equal(
  migrated.memories.entries[0].id,
  "memory-1",
);
assert.equal(
  migrated.memories.entries[0].title,
  "First Memory",
);
assert.deepEqual(
  migrated.memories.entries[0].adventurerIds,
  [],
);
});

test("preserves existing current participant data", () => {
  const record =
    AdventureData.createSmokiesAdventureRecord();

  const migrated =
    AdventureMigration.migrateAdventureRecord(record);

  assert.deepEqual(
    migrated.participants,
    record.participants,
  );
});

test("does not mutate the source record", () => {
  const source = {
    id: "legacy-adventure",
    title: "Legacy Adventure",
    adventurers: ["emily"],
    memories: [],
  };

  const snapshot = structuredClone(source);

  AdventureMigration.migrateAdventureRecord(source);

  assert.deepEqual(source, snapshot);
});

test("produces independent migrated instances", () => {
  const source = {
    id: "legacy-adventure",
    title: "Legacy Adventure",
  };

  const first =
    AdventureMigration.migrateAdventureRecord(source);
  const second =
    AdventureMigration.migrateAdventureRecord(source);

  first.title = "Changed Adventure";

  assert.equal(second.title, "Legacy Adventure");
});