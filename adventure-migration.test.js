"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
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
test("reads adventure-specific legacy storage values", () => {
  const storage =
    AdventureStorage.createMemoryStorage();

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.completedDays,
    JSON.stringify(["2026-08-07"]),
  );

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS
      .reservationOverrides,
    JSON.stringify({
      "local-goat": {
        confirmation: "Confirmed",
      },
    }),
  );

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.readiness,
    JSON.stringify({
      emily: {
        state: "ready",
      },
    }),
  );

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.packing,
    JSON.stringify({
      "packing-item-1": true,
    }),
  );

  const result =
    AdventureMigration.readLegacyAdventureData(
      storage,
    );

  assert.deepEqual(result.completedDays, [
    "2026-08-07",
  ]);

  assert.deepEqual(result.reservationOverrides, {
    "local-goat": {
      confirmation: "Confirmed",
    },
  });

  assert.deepEqual(result.readiness, {
    emily: {
      state: "ready",
    },
  });

  assert.deepEqual(result.packing, {
    "packing-item-1": true,
  });
});

test("migrates legacy storage into the canonical Adventure Record", () => {
  const storage =
    AdventureStorage.createMemoryStorage();

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.completedDays,
    JSON.stringify([
      "2026-08-07",
      "2026-08-08",
    ]),
  );

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS
      .reservationOverrides,
    JSON.stringify({
      "local-goat": {
        time: "6:00 PM",
      },
    }),
  );

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.readiness,
    JSON.stringify({
      emily: {
        state: "ready",
      },
    }),
  );

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.packing,
    JSON.stringify({
      "packing-item-1": true,
    }),
  );

  const migrated =
    AdventureMigration.migrateLegacyStorage({
      storage,
      migratedAt:
        "2026-07-31T18:00:00-04:00",
    });

  assert.deepEqual(
    migrated.completion.completedDayIds,
    ["2026-08-07", "2026-08-08"],
  );

  assert.deepEqual(
    migrated.reservations.legacyOverrides,
    {
      "local-goat": {
        time: "6:00 PM",
      },
    },
  );

  assert.deepEqual(migrated.readiness.travelers, {
    emily: {
      state: "ready",
    },
  });

  assert.deepEqual(migrated.packing.travelers, {
    "packing-item-1": true,
  });

  assert.equal(
    migrated.metadata.migratedAt,
    "2026-07-31T18:00:00-04:00",
  );

  assert.equal(
    migrated.metadata.migrationSource,
    AdventureMigration.LEGACY_MIGRATION_SOURCE,
  );
});

test("retains legacy storage values after migration", () => {
  const storage =
    AdventureStorage.createMemoryStorage();

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.completedDays,
    JSON.stringify(["2026-08-07"]),
  );

  AdventureMigration.migrateLegacyStorage({
    storage,
    migratedAt:
      "2026-07-31T18:00:00-04:00",
  });

  assert.equal(
    storage.getItem(
      AdventureMigration.LEGACY_STORAGE_KEYS
        .completedDays,
    ),
    JSON.stringify(["2026-08-07"]),
  );
});

test("legacy storage migration is idempotent", () => {
  const storage =
    AdventureStorage.createMemoryStorage();

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.completedDays,
    JSON.stringify(["2026-08-07"]),
  );

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS
      .reservationOverrides,
    JSON.stringify({
      "local-goat": {
        time: "6:00 PM",
      },
    }),
  );

  const first =
    AdventureMigration.migrateLegacyStorage({
      storage,
      migratedAt:
        "2026-07-31T18:00:00-04:00",
    });

  const second =
    AdventureMigration.migrateLegacyStorage({
      storage,
      baseRecord: first,
      migratedAt:
        "2026-07-31T18:00:00-04:00",
    });

  assert.deepEqual(second, first);
});

test("ignores malformed legacy JSON without deleting it", () => {
  const storage =
    AdventureStorage.createMemoryStorage();

  storage.setItem(
    AdventureMigration.LEGACY_STORAGE_KEYS.completedDays,
    "{not valid JSON",
  );

  const migrated =
    AdventureMigration.migrateLegacyStorage({
      storage,
      migratedAt:
        "2026-07-31T18:00:00-04:00",
    });

  assert.deepEqual(
    migrated.completion.completedDayIds,
    [],
  );

  assert.equal(
    storage.getItem(
      AdventureMigration.LEGACY_STORAGE_KEYS
        .completedDays,
    ),
    "{not valid JSON",
  );
});

test("requires a valid storage provider for legacy migration", () => {
  assert.throws(
    () =>
      AdventureMigration.migrateLegacyStorage({
        storage: null,
      }),
    {
      message:
        "A valid legacy storage provider is required.",
    },
  );
});