(function () {
"use strict";

const AdventureData =
  typeof module === "object" && module.exports
    ? require("./adventure-data.js")
    : globalThis.AdventureData;

const AdventureNormalization =
  typeof module === "object" && module.exports
    ? require("./adventure-normalization.js")
    : globalThis.AdventureNormalization;

const AdventureValidation =
  typeof module === "object" && module.exports
    ? require("./adventure-validation.js")
    : globalThis.AdventureValidation;
const LEGACY_STORAGE_KEYS = Object.freeze({
  completedDays: "acCompletedDays008",
  reservationOverrides:
    "adventureCompanionReservationOverridesV1",
  readiness: "adventureCompanionReadiness",
  packing: "adventureCompanionPackingM3041",
});

const LEGACY_MIGRATION_SOURCE =
  "legacy-local-storage";
function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function migrateLegacyParticipants(record) {
  if (
    Array.isArray(record.participants) ||
    !Array.isArray(record.adventurers)
  ) {
    return record;
  }

  return {
    ...record,
    participants: record.adventurers.map((adventurer) => {
      if (typeof adventurer === "string") {
        return {
          adventurerId: adventurer,
        };
      }

      if (
        adventurer &&
        typeof adventurer === "object" &&
        typeof adventurer.id === "string"
      ) {
        return {
          ...adventurer,
          adventurerId:
            adventurer.adventurerId ?? adventurer.id,
        };
      }

      return adventurer;
    }),
  };
}

function migrateLegacyMemories(record) {
  if (
    record.memories &&
    typeof record.memories === "object" &&
    !Array.isArray(record.memories)
  ) {
    return record;
  }

  if (!Array.isArray(record.memories)) {
    return record;
  }

  return {
    ...record,
    memories: {
      entries: record.memories,
    },
  };
}

function migrateAdventureRecord(record) {
  const source =
    record && typeof record === "object"
      ? cloneValue(record)
      : {};

  let migrated = source;

  migrated = migrateLegacyParticipants(migrated);
  migrated = migrateLegacyMemories(migrated);

  migrated = {
    ...migrated,
    schemaVersion: AdventureData.SCHEMA_VERSION,
  };

  const normalized =
    AdventureNormalization.normalizeAdventureRecord(
      migrated,
    );

  const validation =
    AdventureValidation.validateAdventureRecord(
      normalized,
    );

  if (!validation.valid) {
    const error = new Error(
      "Migrated Adventure Record failed validation.",
    );

    error.name = "AdventureMigrationError";
    error.validationErrors = validation.errors;

    throw error;
  }

  return normalized;
}

function needsAdventureMigration(record) {
  if (!record || typeof record !== "object") {
    return true;
  }

  if (
    record.schemaVersion !== AdventureData.SCHEMA_VERSION
  ) {
    return true;
  }

  const validation =
    AdventureValidation.validateAdventureRecord(record);

  return !validation.valid;
}

function isStorageProvider(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.getItem === "function"
  );
}

function readLegacyJson(storage, key, fallback) {
  const rawValue = storage.getItem(key);

  if (rawValue === null) {
    return cloneValue(fallback);
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return cloneValue(fallback);
  }
}

function readLegacyAdventureData(storage) {
  if (!isStorageProvider(storage)) {
    throw new TypeError(
      "A valid legacy storage provider is required.",
    );
  }

  return {
    completedDays: readLegacyJson(
      storage,
      LEGACY_STORAGE_KEYS.completedDays,
      [],
    ),

    reservationOverrides: readLegacyJson(
      storage,
      LEGACY_STORAGE_KEYS.reservationOverrides,
      {},
    ),

    readiness: readLegacyJson(
      storage,
      LEGACY_STORAGE_KEYS.readiness,
      {},
    ),

    packing: readLegacyJson(
      storage,
      LEGACY_STORAGE_KEYS.packing,
      {},
    ),
  };
}

function migrateLegacyStorage(options = {}) {
  const storage = options.storage;
  const baseRecord =
    options.baseRecord ||
    AdventureData.createSmokiesAdventureRecord();
  const migratedAt =
    typeof options.migratedAt === "string"
      ? options.migratedAt
      : new Date().toISOString();

  const legacy = readLegacyAdventureData(storage);

  const migrated = migrateAdventureRecord({
    ...cloneValue(baseRecord),

    reservations: {
      ...cloneValue(baseRecord.reservations),
      legacyOverrides: cloneValue(
        legacy.reservationOverrides,
      ),
    },

    packing: {
      ...cloneValue(baseRecord.packing),
      travelers: cloneValue(legacy.packing),
    },

    readiness: {
      ...cloneValue(baseRecord.readiness),
      travelers: cloneValue(legacy.readiness),
    },

    completion: {
      ...cloneValue(baseRecord.completion),
      completedDayIds: Array.isArray(
        legacy.completedDays,
      )
        ? cloneValue(legacy.completedDays)
        : [],
    },

    metadata: {
      ...cloneValue(baseRecord.metadata),
      migratedAt,
      migrationSource: LEGACY_MIGRATION_SOURCE,
    },
  });

  return migrated;
}
const AdventureMigration = Object.freeze({
  LEGACY_STORAGE_KEYS,
  LEGACY_MIGRATION_SOURCE,
  migrateAdventureRecord,
  needsAdventureMigration,
  readLegacyAdventureData,
  migrateLegacyStorage,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureMigration;
}

if (typeof window !== "undefined") {
  window.AdventureMigration = AdventureMigration;
}
})();