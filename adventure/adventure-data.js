(function () {
"use strict";

const ADVENTURE_RECORD_SCHEMA_VERSION = 1;
const SMOKIES_ADVENTURE_ID = "smokies-2026";
const PACIFIC_COAST_ADVENTURE_ID =
  "pacific-coast-2026";

const SMOKIES_PARTICIPANTS = Object.freeze([
  Object.freeze({
    adventurerId: "emily",
    role: "organizer",
    includedInReadiness: true,
    adventurePreferences: {},
  }),
  Object.freeze({
    adventurerId: "jake",
    role: "traveler",
    includedInReadiness: true,
    adventurePreferences: {},
  }),
  Object.freeze({
    adventurerId: "kaseryn",
    role: "traveler",
    includedInReadiness: true,
    adventurePreferences: {},
  }),
  Object.freeze({
    adventurerId: "bubbe",
    role: "traveler",
    includedInReadiness: true,
    adventurePreferences: {},
  }),
  Object.freeze({
    adventurerId: "papa",
    role: "traveler",
    includedInReadiness: true,
    adventurePreferences: {},
  }),
]);

function cloneParticipant(participant) {
  return {
    ...participant,
    adventurePreferences: {
      ...participant.adventurePreferences,
    },
  };
}

function createSmokiesAdventureRecord() {
  return {
    schemaVersion: ADVENTURE_RECORD_SCHEMA_VERSION,

    id: SMOKIES_ADVENTURE_ID,
    slug: SMOKIES_ADVENTURE_ID,
    title: "Smokies 2026",
    subtitle: "Making New Traditions",

    dates: {
      start: "2026-08-07",
      end: "2026-08-14",
      timezone: "America/New_York",
    },

    destination: {
      name: "Sevierville / Smoky Mountains",
      city: "Sevierville",
      state: "Tennessee",
      country: "United States",
      latitude: 35.8681,
      longitude: -83.5618,
    },

    participants: SMOKIES_PARTICIPANTS.map(cloneParticipant),

    itinerary: {
      days: [],
    },

    reservations: {
      items: [],
    },

    packing: {
      travelers: {},
      sharedItems: [],
      updatedAt: null,
    },

    readiness: {
      travelers: {},
      family: {
        state: "unknown",
      },
      updatedAt: null,
    },

    completion: {
      completedDayIds: [],
      completedActivityIds: [],
    },

    preferences: {
      breakfastWindow: null,
      notes: [],
    },

    memories: {
      entries: [],
    },

    media: {
      referencedMediaIds: [],
    },

    metadata: {
      createdAt: null,
      updatedAt: null,
      migratedAt: null,
      migrationSource: null,
    },
  };
}

function createPacificCoastAdventureRecord() {
  return {
    schemaVersion: ADVENTURE_RECORD_SCHEMA_VERSION,
    id: PACIFIC_COAST_ADVENTURE_ID,
    slug: PACIFIC_COAST_ADVENTURE_ID,
    title: "Pacific Coast 2026",
    subtitle: "",
    dates: {
      start: "2026-09-24",
      end: "2026-09-28",
      timezone: "America/Los_Angeles",
    },
    destination: {
      name: "Pacific Coast",
      city: null,
      state: null,
      country: "United States",
      latitude: null,
      longitude: null,
    },
    participants: [],
    itinerary: {
      days: [],
    },
    reservations: {
      items: [],
    },
    packing: {
      travelers: {},
      sharedItems: [],
      updatedAt: null,
    },
    readiness: {
      travelers: {},
      family: {
        state: "unknown",
      },
      updatedAt: null,
    },
    completion: {
      completedDayIds: [],
      completedActivityIds: [],
    },
    preferences: {
      breakfastWindow: null,
      notes: [],
    },
    memories: {
      entries: [],
    },
    media: {
      referencedMediaIds: [],
    },
    metadata: {
      createdAt: null,
      updatedAt: null,
      migratedAt: null,
      migrationSource: null,
    },
  };
}

const AdventureData = Object.freeze({
  SCHEMA_VERSION: ADVENTURE_RECORD_SCHEMA_VERSION,
  SMOKIES_ADVENTURE_ID,
  PACIFIC_COAST_ADVENTURE_ID,
  SMOKIES_PARTICIPANTS,
  createSmokiesAdventureRecord,
  createPacificCoastAdventureRecord,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureData;
}

if (typeof window !== "undefined") {
  window.AdventureData = AdventureData;
}
})();
