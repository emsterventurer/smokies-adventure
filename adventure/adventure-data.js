(function () {
"use strict";

const ADVENTURE_RECORD_SCHEMA_VERSION = 1;
const SMOKIES_ADVENTURE_ID = "smokies-2026";
const PACIFIC_COAST_ADVENTURE_ID =
  "pacific-coast-2026";
const PACIFIC_COAST_ARRIVAL_DAY_ID =
  "2026-09-24";

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function createPacificCoastArrivalDay() {
  return {
    id: PACIFIC_COAST_ARRIVAL_DAY_ID,
    date: "2026-09-24",
    title: "Arrival in Healdsburg",
    summary:
      "Arrive at SFO, make the drive to Healdsburg, settle in, and enjoy a confirmed dinner at The Matheson.",
    routeLabel: "SFO → Healdsburg",
    pace: "Easy arrival evening",
    stops: [
      {
        id: "sfo-arrival",
        name: "San Francisco International Airport (SFO)",
        kind: "arrival",
        timeLabel: "Arrival time not yet supplied",
        navigationQuery:
          "San Francisco International Airport, San Francisco, CA",
        priority: "required",
        notes:
          "United flight arrival. Terminal and arrival time are not yet supplied.",
      },
      {
        id: "healdsburg-inn",
        name: "Healdsburg Inn on Plaza",
        kind: "lodging",
        timeLabel: "Check-in after 4 PM",
        duration: "1 night",
        address:
          "112 Matheson St, Healdsburg, CA",
        navigationQuery:
          "Healdsburg Inn on Plaza, 112 Matheson St, Healdsburg, CA",
        priority: "required",
        notes:
          "If arriving after 8 PM, call before 2 PM. Checkout is 11 AM.",
        reservationId:
          "2026-09-24::Healdsburg Inn on Plaza",
      },
      {
        id: "the-matheson",
        name: "The Matheson",
        kind: "dinner",
        timeLabel:
          "Confirmed · time not yet supplied",
        navigationQuery:
          "The Matheson, Healdsburg, CA",
        priority: "required",
        notes:
          "Confirmed arrival-night dinner reservation.",
        reservationId:
          "2026-09-24::The Matheson",
      },
    ],
  };
}

function createPacificCoastArrivalReservations() {
  return [
    {
      id:
        "2026-09-24::Healdsburg Inn on Plaza",
      date: "2026-09-24",
      name: "Healdsburg Inn on Plaza",
      kind: "lodging",
      status: "Confirmed",
      confirmation: "HIP1017780",
      address:
        "112 Matheson St, Healdsburg, CA",
      notes:
        "Healdsburg King · 1 night · check-in after 4 PM · call before 2 PM if arriving after 8 PM · checkout 11 AM.",
    },
    {
      id: "2026-09-24::The Matheson",
      date: "2026-09-24",
      name: "The Matheson",
      kind: "dinner",
      status: "Confirmed",
      notes:
        "Confirmed reservation. Time not yet supplied.",
    },
  ];
}

function enrichPacificCoastAdventureRecord(record) {
  if (
    !record ||
    record.id !== PACIFIC_COAST_ADVENTURE_ID ||
    !Array.isArray(record.itinerary?.days) ||
    record.itinerary.days.length > 0
  ) {
    return {
      adventure: record,
      enriched: false,
    };
  }

  const existingReservations = Array.isArray(
    record.reservations?.items,
  )
    ? cloneValue(record.reservations.items)
    : [];
  const existingReservationIds = new Set(
    existingReservations.map((reservation) =>
      String(
        reservation?.id ||
          `${reservation?.date ?? ""}::${reservation?.name ?? ""}`,
      ),
    ),
  );
  const bundledReservations =
    createPacificCoastArrivalReservations().filter(
      (reservation) =>
        !existingReservationIds.has(reservation.id),
    );

  return {
    adventure: {
      ...cloneValue(record),
      itinerary: {
        ...cloneValue(record.itinerary),
        days: [createPacificCoastArrivalDay()],
      },
      reservations: {
        ...cloneValue(record.reservations),
        items: [
          ...existingReservations,
          ...bundledReservations,
        ],
      },
    },
    enriched: true,
  };
}

function prepareBundledAdventureRecord(record) {
  return enrichPacificCoastAdventureRecord(record)
    .adventure;
}

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
  PACIFIC_COAST_ARRIVAL_DAY_ID,
  SMOKIES_PARTICIPANTS,
  createSmokiesAdventureRecord,
  createPacificCoastAdventureRecord,
  createPacificCoastArrivalDay,
  createPacificCoastArrivalReservations,
  enrichPacificCoastAdventureRecord,
  prepareBundledAdventureRecord,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureData;
}

if (typeof window !== "undefined") {
  window.AdventureData = AdventureData;
}
})();
