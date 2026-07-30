"use strict";

const AdventureData = require("./adventure-data.js");
const AdventureNormalization = require(
  "./adventure-normalization.js",
);
const AdventureValidation = require(
  "./adventure-validation.js",
);

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

const AdventureMigration = Object.freeze({
  migrateAdventureRecord,
  needsAdventureMigration,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureMigration;
}

if (typeof window !== "undefined") {
  window.AdventureMigration = AdventureMigration;
}