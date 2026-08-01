(function () {
"use strict";

const AdventureData =
  typeof module === "object" && module.exports
    ? require("./adventure-data.js")
    : globalThis.AdventureData;

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        cloneValue(nestedValue),
      ]),
    );
  }

  return value;
}

function arrayOrDefault(value, fallback = []) {
  return Array.isArray(value) ? cloneValue(value) : cloneValue(fallback);
}

function objectOrDefault(value, fallback = {}) {
  return isPlainObject(value) ? cloneValue(value) : cloneValue(fallback);
}

function normalizeParticipant(participant) {
  const source = isPlainObject(participant) ? participant : {};

  return {
    ...cloneValue(source),
    adventurerId:
      typeof source.adventurerId === "string"
        ? source.adventurerId
        : "",
    role:
      typeof source.role === "string"
        ? source.role
        : "traveler",
    includedInReadiness:
      typeof source.includedInReadiness === "boolean"
        ? source.includedInReadiness
        : true,
    adventurePreferences: objectOrDefault(
      source.adventurePreferences,
    ),
  };
}

function normalizeMemory(memory) {
  const source = isPlainObject(memory) ? memory : {};

  return {
    ...cloneValue(source),
    id: typeof source.id === "string" ? source.id : "",
    adventureId:
      typeof source.adventureId === "string"
        ? source.adventureId
        : "",
    title: typeof source.title === "string" ? source.title : "",
    note: typeof source.note === "string" ? source.note : "",
    adventureDate:
      typeof source.adventureDate === "string"
        ? source.adventureDate
        : null,
    adventurerIds: arrayOrDefault(source.adventurerIds),
    locationIds: arrayOrDefault(source.locationIds),
    activityIds: arrayOrDefault(source.activityIds),
    mediaIds: arrayOrDefault(source.mediaIds),
    tags: arrayOrDefault(source.tags),
    favorite:
      typeof source.favorite === "boolean"
        ? source.favorite
        : false,
    createdAt:
      typeof source.createdAt === "string"
        ? source.createdAt
        : null,
    updatedAt:
      typeof source.updatedAt === "string"
        ? source.updatedAt
        : null,
  };
}

function normalizeAdventureRecord(record) {
  const seed = AdventureData.createSmokiesAdventureRecord();
  const source = isPlainObject(record) ? record : {};

  const dates = objectOrDefault(source.dates, seed.dates);
  const destination = objectOrDefault(
    source.destination,
    seed.destination,
  );
  const itinerary = objectOrDefault(
    source.itinerary,
    seed.itinerary,
  );
  const reservations = objectOrDefault(
    source.reservations,
    seed.reservations,
  );
  const packing = objectOrDefault(source.packing, seed.packing);
  const readiness = objectOrDefault(
    source.readiness,
    seed.readiness,
  );
  const completion = objectOrDefault(
    source.completion,
    seed.completion,
  );
  const preferences = objectOrDefault(
    source.preferences,
    seed.preferences,
  );
  const memories = objectOrDefault(
    source.memories,
    seed.memories,
  );
  const media = objectOrDefault(source.media, seed.media);
  const metadata = objectOrDefault(
    source.metadata,
    seed.metadata,
  );

  const normalized = {
    ...cloneValue(source),

    schemaVersion: AdventureData.SCHEMA_VERSION,

    id:
      typeof source.id === "string" && source.id.trim() !== ""
        ? source.id
        : seed.id,

    slug:
      typeof source.slug === "string" && source.slug.trim() !== ""
        ? source.slug
        : seed.slug,

    title:
      typeof source.title === "string"
        ? source.title
        : seed.title,

    subtitle:
      typeof source.subtitle === "string"
        ? source.subtitle
        : seed.subtitle,

    dates: {
      ...cloneValue(seed.dates),
      ...dates,
    },

    destination: {
      ...cloneValue(seed.destination),
      ...destination,
    },

    participants: arrayOrDefault(
      source.participants,
      seed.participants,
    ).map(normalizeParticipant),

    itinerary: {
      ...cloneValue(seed.itinerary),
      ...itinerary,
      days: arrayOrDefault(
        itinerary.days,
        seed.itinerary.days,
      ),
    },

    reservations: {
      ...cloneValue(seed.reservations),
      ...reservations,
      items: arrayOrDefault(
        reservations.items,
        seed.reservations.items,
      ),
    },

    packing: {
      ...cloneValue(seed.packing),
      ...packing,
      travelers: objectOrDefault(
        packing.travelers,
        seed.packing.travelers,
      ),
      sharedItems: arrayOrDefault(
        packing.sharedItems,
        seed.packing.sharedItems,
      ),
      updatedAt:
        typeof packing.updatedAt === "string"
          ? packing.updatedAt
          : null,
    },

    readiness: {
      ...cloneValue(seed.readiness),
      ...readiness,
      travelers: objectOrDefault(
        readiness.travelers,
        seed.readiness.travelers,
      ),
      family: {
        ...cloneValue(seed.readiness.family),
        ...objectOrDefault(
          readiness.family,
          seed.readiness.family,
        ),
        state:
          typeof readiness.family?.state === "string"
            ? readiness.family.state
            : "unknown",
      },
      updatedAt:
        typeof readiness.updatedAt === "string"
          ? readiness.updatedAt
          : null,
    },

    completion: {
      ...cloneValue(seed.completion),
      ...completion,
      completedDayIds: arrayOrDefault(
        completion.completedDayIds,
        seed.completion.completedDayIds,
      ),
      completedActivityIds: arrayOrDefault(
        completion.completedActivityIds,
        seed.completion.completedActivityIds,
      ),
    },

    preferences: {
      ...cloneValue(seed.preferences),
      ...preferences,
      breakfastWindow:
        typeof preferences.breakfastWindow === "string"
          ? preferences.breakfastWindow
          : null,
      notes: arrayOrDefault(
        preferences.notes,
        seed.preferences.notes,
      ),
    },

    memories: {
      ...cloneValue(seed.memories),
      ...memories,
      entries: arrayOrDefault(
        memories.entries,
        seed.memories.entries,
      ).map(normalizeMemory),
    },

    media: {
      ...cloneValue(seed.media),
      ...media,
      referencedMediaIds: arrayOrDefault(
        media.referencedMediaIds,
        seed.media.referencedMediaIds,
      ),
    },

    metadata: {
      ...cloneValue(seed.metadata),
      ...metadata,
      createdAt:
        typeof metadata.createdAt === "string"
          ? metadata.createdAt
          : null,
      updatedAt:
        typeof metadata.updatedAt === "string"
          ? metadata.updatedAt
          : null,
      migratedAt:
        typeof metadata.migratedAt === "string"
          ? metadata.migratedAt
          : null,
      migrationSource:
        typeof metadata.migrationSource === "string"
          ? metadata.migrationSource
          : null,
    },
  };

  return normalized;
}

const AdventureNormalization = Object.freeze({
  normalizeAdventureRecord,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureNormalization;
}

if (typeof window !== "undefined") {
  window.AdventureNormalization = AdventureNormalization;
}
})();