(function () {
"use strict";

const AdventureData =
  typeof module === "object" && module.exports
    ? require("./adventure-data.js")
    : globalThis.AdventureData;

function createValidationError(path, code, message) {
  return {
    path,
    code,
    message,
  };
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validateAdventureRecord(record) {
  const errors = [];

  if (!isPlainObject(record)) {
    return {
      valid: false,
      errors: [
        createValidationError(
          "",
          "EXPECTED_OBJECT",
          "Adventure Record must be an object.",
        ),
      ],
    };
  }

  if (record.schemaVersion !== AdventureData.SCHEMA_VERSION) {
    errors.push(
      createValidationError(
        "schemaVersion",
        "UNSUPPORTED_SCHEMA_VERSION",
        `Adventure Record schemaVersion must be ${AdventureData.SCHEMA_VERSION}.`,
      ),
    );
  }

  if (typeof record.id !== "string" || record.id.trim() === "") {
    errors.push(
      createValidationError(
        "id",
        "REQUIRED_STRING",
        "Adventure Record id must be a non-empty string.",
      ),
    );
  }

  if (!Array.isArray(record.participants)) {
    errors.push(
      createValidationError(
        "participants",
        "EXPECTED_ARRAY",
        "Participants must be an array.",
      ),
    );
  } else {
    record.participants.forEach((participant, index) => {
      const path = `participants[${index}]`;

      if (!isPlainObject(participant)) {
        errors.push(
          createValidationError(
            path,
            "EXPECTED_OBJECT",
            "Each participant must be an object.",
          ),
        );
        return;
      }

      if (
        typeof participant.adventurerId !== "string" ||
        participant.adventurerId.trim() === ""
      ) {
        errors.push(
          createValidationError(
            `${path}.adventurerId`,
            "REQUIRED_STRING",
            "Participant adventurerId must be a non-empty string.",
          ),
        );
      }
    });
  }

  const requiredArrayPaths = [
    ["itinerary.days", record.itinerary?.days],
    ["reservations.items", record.reservations?.items],
    ["packing.sharedItems", record.packing?.sharedItems],
    ["completion.completedDayIds", record.completion?.completedDayIds],
    [
      "completion.completedActivityIds",
      record.completion?.completedActivityIds,
    ],
    ["preferences.notes", record.preferences?.notes],
    ["memories.entries", record.memories?.entries],
    ["media.referencedMediaIds", record.media?.referencedMediaIds],
  ];

  requiredArrayPaths.forEach(([path, value]) => {
    if (!Array.isArray(value)) {
      errors.push(
        createValidationError(
          path,
          "EXPECTED_ARRAY",
          `${path} must be an array.`,
        ),
      );
    }
  });

  const requiredObjectPaths = [
    ["dates", record.dates],
    ["destination", record.destination],
    ["itinerary", record.itinerary],
    ["reservations", record.reservations],
    ["packing", record.packing],
    ["packing.travelers", record.packing?.travelers],
    ["readiness", record.readiness],
    ["readiness.travelers", record.readiness?.travelers],
    ["readiness.family", record.readiness?.family],
    ["completion", record.completion],
    ["preferences", record.preferences],
    ["memories", record.memories],
    ["media", record.media],
    ["metadata", record.metadata],
  ];

  requiredObjectPaths.forEach(([path, value]) => {
    if (!isPlainObject(value)) {
      errors.push(
        createValidationError(
          path,
          "EXPECTED_OBJECT",
          `${path} must be an object.`,
        ),
      );
    }
  });

  if (Array.isArray(record.memories?.entries)) {
    record.memories.entries.forEach((memory, index) => {
      const path = `memories.entries[${index}]`;

      if (!isPlainObject(memory)) {
        errors.push(
          createValidationError(
            path,
            "EXPECTED_OBJECT",
            "Each memory must be an object.",
          ),
        );
        return;
      }

      if (typeof memory.id !== "string" || memory.id.trim() === "") {
        errors.push(
          createValidationError(
            `${path}.id`,
            "REQUIRED_STRING",
            "Memory id must be a non-empty string.",
          ),
        );
      }

      const relationshipPaths = [
        ["adventurerIds", memory.adventurerIds],
        ["locationIds", memory.locationIds],
        ["activityIds", memory.activityIds],
        ["mediaIds", memory.mediaIds],
        ["tags", memory.tags],
      ];

      relationshipPaths.forEach(([name, value]) => {
        if (!Array.isArray(value)) {
          errors.push(
            createValidationError(
              `${path}.${name}`,
              "EXPECTED_ARRAY",
              `Memory ${name} must be an array.`,
            ),
          );
        }
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

const AdventureValidation = Object.freeze({
  validateAdventureRecord,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureValidation;
}

if (typeof window !== "undefined") {
  window.AdventureValidation = AdventureValidation;
}
})();