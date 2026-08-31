(function () {
"use strict";

const ADVENTURE_RECORD_SCHEMA_VERSION = 1;
const SMOKIES_ADVENTURE_ID = "smokies-2026";
const PACIFIC_COAST_ADVENTURE_ID =
  "pacific-coast-2026";
const PACIFIC_COAST_ARRIVAL_DAY_ID =
  "2026-09-24";
const PACIFIC_COAST_LAND_DAY_IDS = Object.freeze([
  "2026-09-25",
  "2026-09-26",
  "2026-09-27",
  "2026-09-28",
]);

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
      "Arrive at SFO, make the drive to Healdsburg, settle in, and enjoy dinner at The Matheson.",
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
        timeLabel: "Hotel arrival",
        address:
          "112 Matheson St, Healdsburg, CA",
        navigationQuery:
          "Healdsburg Inn on Plaza, 112 Matheson St, Healdsburg, CA",
        priority: "required",
        reservationId:
          "2026-09-24::Healdsburg Inn on Plaza",
      },
      {
        id: "the-matheson",
        name: "The Matheson",
        kind: "dinner",
        timeLabel: "Dinner stop",
        navigationQuery:
          "The Matheson, Healdsburg, CA",
        priority: "required",
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
        "Reservation time not yet supplied.",
    },
  ];
}

function createPacificCoastLandDays() {
  return [
    {
      id: "2026-09-25",
      date: "2026-09-25",
      title: "Redwoods and Victorian Ferndale",
      summary:
        "Travel from Healdsburg to Eureka through wine country, easy-access redwoods, and Victorian Ferndale, with time to settle in before dinner.",
      routeLabel: "Healdsburg → Eureka",
      pace: "Scenic drive with easy walks and a hotel reset",
      stops: [
        {
          id: "healdsburg-inn-departure",
          name: "Healdsburg Inn on Plaza",
          kind: "departure",
          timeLabel: "Depart 9:30 AM",
          navigationQuery:
            "Healdsburg Inn on Plaza, 112 Matheson St, Healdsburg, CA",
          priority: "required",
        },
        {
          id: "nelson-family-vineyards",
          name: "Nelson Family Vineyards",
          kind: "winery",
          timeLabel: "About 10:25 AM",
          duration: "Allow about 45 minutes",
          navigationQuery:
            "Nelson Family Vineyards, Ukiah, CA",
          priority: "planned",
        },
        {
          id: "avenue-cafe-miranda",
          name: "Avenue Cafe / Miranda",
          kind: "lunch",
          timeLabel: "About 12:35 PM",
          duration: "Allow about 50 minutes",
          navigationQuery:
            "Avenue Cafe, Miranda, CA",
          priority: "planned",
        },
        {
          id: "humboldt-redwoods-visitor-center",
          name: "Humboldt Redwoods Visitor Center / Avenue of the Giants",
          kind: "scenic stop",
          timeLabel: "About 1:55 PM",
          duration: "Allow 20–25 minutes",
          navigationQuery:
            "Humboldt Redwoods State Park Visitor Center, Weott, CA",
          priority: "planned",
          notes:
            "Easy-access redwood context; no hiking is assumed.",
        },
        {
          id: "founders-grove",
          name: "Founders Grove",
          kind: "redwood experience",
          timeLabel: "About 2:30 PM",
          duration: "Allow 30–45 minutes",
          navigationQuery:
            "Founders Grove, Dyerville Loop Road, Weott, CA",
          priority: "planned",
          notes:
            "Keep this a short, easy redwood experience; no strenuous walking.",
        },
        {
          id: "ferndale",
          name: "Ferndale",
          kind: "town exploration",
          timeLabel: "About 4:05 PM",
          duration: "Allow about 1 hour 20–25 minutes",
          navigationQuery:
            "Main Street, Ferndale, CA",
          priority: "planned",
          notes:
            "Browse Victorian Main Street, shops, and galleries; leave around 5:30 PM.",
        },
        {
          id: "holiday-inn-express-eureka",
          name: "Holiday Inn Express & Suites Eureka",
          kind: "lodging",
          timeLabel: "About 6:00 PM",
          duration: "Allow 45–60 minutes to check in, rest, and freshen up",
          address: "815 W Wabash Ave, Eureka, CA",
          navigationQuery:
            "Holiday Inn Express & Suites Eureka, 815 W Wabash Ave, Eureka, CA",
          priority: "required",
          reservationId:
            "2026-09-25::Holiday Inn Express & Suites Eureka",
        },
        {
          id: "sea-grill",
          name: "Sea Grill",
          kind: "dinner",
          timeLabel: "Target about 7:00 PM",
          navigationQuery: "Sea Grill, Eureka, CA",
          priority: "target",
          reservationId: "2026-09-25::Sea Grill",
        },
      ],
    },
    {
      id: "2026-09-26",
      date: "2026-09-26",
      title: "Coast Road to Gold Beach",
      summary:
        "Follow the preferred coast-focused route to Gold Beach, with a distinct Big Tree route available if the travelers choose it instead.",
      routeLabel: "Eureka → Gold Beach",
      pace: "Leisurely coast day with short, easy-access viewpoints",
      routeAlternatives: [
        {
          id: "coast-focused",
          label: "Option A — Coast-focused",
          preferred: true,
          stopIds: [
            "holiday-inn-express-eureka-departure",
            "crescent-city",
            "brookings-harris-beach",
            "samuel-h-boardman-viewpoint",
            "pacific-reef-hotel",
          ],
        },
        {
          id: "big-tree-and-coast",
          label: "Option B — Big Tree + Coast",
          preferred: false,
          stopIds: [
            "holiday-inn-express-eureka-departure",
            "newton-b-drury-scenic-parkway",
            "big-tree-wayside",
            "crescent-city",
            "brookings-harris-beach",
            "samuel-h-boardman-viewpoint",
            "pacific-reef-hotel",
          ],
        },
      ],
      alternativeRouteStops: [
        {
          id: "newton-b-drury-scenic-parkway",
          name: "Newton B. Drury Scenic Parkway",
          kind: "scenic drive",
          timeLabel: "Option B only",
          navigationQuery:
            "Newton B Drury Scenic Parkway, Orick, CA",
          priority: "alternative",
          notes:
            "Part of the Big Tree + Coast route, not an optional addition to Option A.",
        },
        {
          id: "big-tree-wayside",
          name: "Big Tree Wayside",
          kind: "redwood experience",
          timeLabel: "Option B only",
          navigationQuery:
            "Big Tree Wayside, Prairie Creek Redwoods State Park, CA",
          priority: "alternative",
          notes:
            "Minimal walking and no hiking; part of the mutually exclusive Option B route.",
        },
      ],
      stops: [
        {
          id: "holiday-inn-express-eureka-departure",
          name: "Holiday Inn Express & Suites Eureka",
          kind: "departure",
          timeLabel: "Depart about 9:30 AM",
          navigationQuery:
            "Holiday Inn Express & Suites Eureka, 815 W Wabash Ave, Eureka, CA",
          priority: "required",
        },
        {
          id: "crescent-city",
          name: "Crescent City",
          kind: "lunch and waterfront",
          timeLabel: "About 11:10 AM",
          duration: "Allow 1–1.5 hours",
          navigationQuery: "Crescent City Harbor, Crescent City, CA",
          priority: "planned",
          notes:
            "Lunch, waterfront or harbor time, and a natural bathroom/stretch break.",
        },
        {
          id: "brookings-harris-beach",
          name: "Brookings / Harris Beach",
          kind: "coastal experience",
          timeLabel: "Early afternoon",
          navigationQuery:
            "Harris Beach State Park, Brookings, OR",
          priority: "planned",
          notes:
            "Keep this short and easy-access; no hiking is assumed.",
        },
        {
          id: "samuel-h-boardman-viewpoint",
          name: "Samuel H. Boardman scenic viewpoint",
          kind: "coastal viewpoint",
          timeLabel: "Afternoon",
          navigationQuery:
            "Samuel H Boardman State Scenic Corridor, Brookings, OR",
          priority: "planned",
          notes:
            "Choose one or two easy-access roadside viewpoints only; no hiking.",
        },
        {
          id: "pacific-reef-hotel",
          name: "Pacific Reef Hotel & Light Show",
          kind: "lodging",
          timeLabel: "Target 4:00–4:30 PM",
          address: "29362 Ellensburg Hwy 101, Gold Beach, OR",
          navigationQuery:
            "Pacific Reef Hotel, 29362 Ellensburg Hwy 101, Gold Beach, OR",
          priority: "required",
          reservationId:
            "2026-09-26::Pacific Reef Hotel & Light Show",
        },
        {
          id: "spinners-dinner",
          name: "Spinner's Seafood, Steak & Chop House",
          kind: "dinner",
          timeLabel: "Dinner — time flexible",
          navigationQuery:
            "Spinner's Seafood Steak & Chop House, Gold Beach, OR",
          priority: "preferred target",
          reservationId:
            "2026-09-26::Spinner's Seafood, Steak & Chop House",
          notes:
            "Preferred target, not confirmed. Barnacle Bistro and The Landing North are alternatives.",
        },
      ],
    },
    {
      id: "2026-09-27",
      date: "2026-09-27",
      title: "Bandon and Florence to Newport",
      summary:
        "Enjoy an intentionally unhurried coast day through Bandon and Florence before settling into Newport.",
      routeLabel: "Gold Beach → Newport",
      pace: "Relaxed coast day with flexible lunch and easy viewpoints",
      stops: [
        {
          id: "pacific-reef-departure",
          name: "Pacific Reef Hotel & Light Show",
          kind: "departure",
          timeLabel: "Depart about 10:00 AM",
          navigationQuery:
            "Pacific Reef Hotel, 29362 Ellensburg Hwy 101, Gold Beach, OR",
          priority: "required",
        },
        {
          id: "face-rock-viewpoint",
          name: "Face Rock State Scenic Viewpoint",
          kind: "scenic viewpoint",
          timeLabel: "About 11:15 AM",
          navigationQuery:
            "Face Rock State Scenic Viewpoint, Bandon, OR",
          priority: "planned",
          notes: "Short, easy scenic viewpoint; no hike.",
        },
        {
          id: "old-town-bandon",
          name: "Old Town Bandon",
          kind: "flexible lunch and browsing",
          timeLabel: "Late morning through early afternoon",
          duration: "Plan to leave Bandon around 1:50 PM",
          navigationQuery: "Old Town Bandon, Bandon, OR",
          priority: "flexible",
          notes:
            "Choose lunch during the day. Tony's Crab Shack and Bandon Fish Market are casual possibilities, not reservations.",
        },
        {
          id: "face-rock-creamery",
          name: "Face Rock Creamery",
          kind: "food stop",
          timeLabel: "Before leaving Bandon",
          navigationQuery: "Face Rock Creamery, Bandon, OR",
          priority: "planned",
        },
        {
          id: "historic-old-town-florence",
          name: "Historic Old Town Florence",
          kind: "town exploration",
          timeLabel: "About 3:20 PM",
          duration: "Allow about 55 minutes; target departure around 4:15 PM",
          navigationQuery: "Historic Old Town Florence, Florence, OR",
          priority: "planned",
          notes:
            "Shops, galleries, riverfront, and optional coffee. The departure target protects a relaxed Newport arrival.",
        },
        {
          id: "hallmark-resort-newport",
          name: "Hallmark Resort Newport",
          kind: "lodging",
          timeLabel: "Target 5:30–5:45 PM",
          duration: "Allow 40–55 minutes to check in, rest, and freshen up",
          address: "744 SW Elizabeth St, Newport, OR",
          navigationQuery:
            "Hallmark Resort Newport, 744 SW Elizabeth St, Newport, OR",
          priority: "required",
          reservationId:
            "2026-09-27::Hallmark Resort Newport",
        },
        {
          id: "georgies",
          name: "Georgie's Beachside Grill",
          kind: "dinner",
          timeLabel: "Target about 6:30 PM",
          navigationQuery:
            "Georgie's Beachside Grill, Newport, OR",
          priority: "target",
          reservationId:
            "2026-09-27::Georgie's Beachside Grill",
        },
      ],
    },
    {
      id: "2026-09-28",
      date: "2026-09-28",
      title: "Tillamook and Chihuly to Seattle Airport",
      summary:
        "Travel from Newport through Tillamook to the required Chihuly Bridge of Glass experience, then continue to the cruise-arranged airport hotel.",
      routeLabel: "Newport → Tillamook → Tacoma → Seattle Airport",
      pace: "Long travel day with a flexible, non-location-specific break",
      travelNotes: [
        "Optional travel break — stop wherever makes the most sense based on traffic, bathrooms, coffee, and energy.",
        "Potential suggestions only: Longview — Lake Sacajawea / Nutty Narrows area, or Castle Rock. Travelers may stop somewhere else or skip the break entirely.",
      ],
      stops: [
        {
          id: "hallmark-newport-departure",
          name: "Hallmark Resort Newport",
          kind: "departure",
          timeLabel: "Depart about 9:00 AM",
          navigationQuery:
            "Hallmark Resort Newport, 744 SW Elizabeth St, Newport, OR",
          priority: "required",
        },
        {
          id: "tillamook-creamery",
          name: "Tillamook Creamery",
          kind: "creamery and lunch",
          timeLabel: "About 10:40 AM",
          duration: "Experience about 1 hour 30–35 minutes; lunch about 45 minutes",
          navigationQuery: "Tillamook Creamery, Tillamook, OR",
          priority: "planned",
          notes: "Target departure around 1:00 PM.",
        },
        {
          id: "chihuly-bridge-of-glass",
          name: "Chihuly Bridge of Glass",
          kind: "required experience",
          timeLabel: "Target 5:00–5:30 PM, traffic dependent",
          duration: "Allow 45–60 minutes",
          navigationQuery: "Chihuly Bridge of Glass, Tacoma, WA",
          priority: "required",
          notes:
            "Must protect this experience when adjusting the day. Museum admission is not required for the outdoor bridge.",
        },
        {
          id: "embassy-suites-seattle-airport",
          name: "Embassy Suites Seattle Airport",
          kind: "lodging",
          timeLabel: "Expected 6:30–7:00 PM",
          navigationQuery:
            "Embassy Suites by Hilton Seattle Tacoma International Airport, Tukwila, WA",
          priority: "required",
          reservationId:
            "2026-09-28::Embassy Suites Seattle Airport",
          notes:
            "Dinner choices: Grazie Ristorante Italiano Southcenter is preferred if timing works; Duke's Seafood Southcenter is an alternative; hotel dining is the low-effort fallback. None is confirmed.",
        },
      ],
    },
  ];
}

function createPacificCoastLandReservations() {
  return [
    {
      id: "2026-09-25::Holiday Inn Express & Suites Eureka",
      date: "2026-09-25",
      name: "Holiday Inn Express & Suites Eureka",
      kind: "lodging",
      status: "Confirmed",
      address: "815 W Wabash Ave, Eureka, CA",
      notes: "Stay September 25–26, 2026.",
    },
    {
      id: "2026-09-25::Sea Grill",
      date: "2026-09-25",
      name: "Sea Grill",
      kind: "dinner",
      status: "Target",
      notes: "Target about 7:00 PM; not confirmed.",
    },
    {
      id: "2026-09-26::Pacific Reef Hotel & Light Show",
      date: "2026-09-26",
      name: "Pacific Reef Hotel & Light Show",
      kind: "lodging",
      status: "Confirmed",
      address: "29362 Ellensburg Hwy 101, Gold Beach, OR",
      notes:
        "Room 117 · Economy Ocean View King · 2 adults · check-in 4 PM · checkout 11 AM · paid with $0 balance.",
    },
    {
      id: "2026-09-26::Spinner's Seafood, Steak & Chop House",
      date: "2026-09-26",
      name: "Spinner's Seafood, Steak & Chop House",
      kind: "dinner",
      status: "Preferred target",
      notes:
        "Not confirmed. Barnacle Bistro and The Landing North are alternatives.",
    },
    {
      id: "2026-09-27::Hallmark Resort Newport",
      date: "2026-09-27",
      name: "Hallmark Resort Newport",
      kind: "lodging",
      status: "Confirmed",
      address: "744 SW Elizabeth St, Newport, OR",
      notes:
        "Oceanfront room · check-in 4 PM · checkout noon September 28.",
    },
    {
      id: "2026-09-27::Georgie's Beachside Grill",
      date: "2026-09-27",
      name: "Georgie's Beachside Grill",
      kind: "dinner",
      status: "Target",
      notes: "Target about 6:30 PM; not confirmed.",
    },
    {
      id: "2026-09-28::Embassy Suites Seattle Airport",
      date: "2026-09-28",
      name: "Embassy Suites Seattle Airport",
      kind: "lodging",
      status: "Confirmed",
      notes:
        "Cruise-arranged hotel. Exact reservation details are not yet supplied.",
    },
  ];
}

function reservationIdFor(reservation) {
  return String(
    reservation?.id ||
      `${reservation?.date ?? ""}::${reservation?.name ?? ""}`,
  );
}

function enrichPacificCoastAdventureRecord(record) {
  if (
    !record ||
    record.id !== PACIFIC_COAST_ADVENTURE_ID ||
    !Array.isArray(record.itinerary?.days)
  ) {
    return {
      adventure: record,
      enriched: false,
    };
  }

  const existingDays = cloneValue(
    record.itinerary.days,
  );
  const existingDayIds = new Set(
    existingDays.map((day) => String(day?.id ?? "")),
  );
  const canonicalBundledDays = [
    createPacificCoastArrivalDay(),
    ...createPacificCoastLandDays(),
  ];
  const bundledDayIds = new Set(
    canonicalBundledDays.map((day) => day.id),
  );
  const existingDayMap = new Map(
    existingDays.map((day) => [String(day?.id ?? ""), day]),
  );
  const bundledDays = canonicalBundledDays.filter(
    (day) => !existingDayIds.has(day.id),
  );
  const mergedDays = [
    ...canonicalBundledDays.map(
      (day) => existingDayMap.get(day.id) || day,
    ),
    ...existingDays.filter(
      (day) => !bundledDayIds.has(String(day?.id ?? "")),
    ),
  ];

  const existingReservations = Array.isArray(
    record.reservations?.items,
  )
    ? cloneValue(record.reservations.items)
    : [];
  const existingReservationIds = new Set(
    existingReservations.map(reservationIdFor),
  );
  const bundledReservations = [
    ...createPacificCoastArrivalReservations(),
    ...createPacificCoastLandReservations(),
  ].filter(
      (reservation) =>
        !existingReservationIds.has(
          reservationIdFor(reservation),
        ),
    );

  if (!bundledDays.length && !bundledReservations.length) {
    return {
      adventure: record,
      enriched: false,
    };
  }

  return {
    adventure: {
      ...cloneValue(record),
      itinerary: {
        ...cloneValue(record.itinerary),
        days: mergedDays,
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
  PACIFIC_COAST_LAND_DAY_IDS,
  SMOKIES_PARTICIPANTS,
  createSmokiesAdventureRecord,
  createPacificCoastAdventureRecord,
  createPacificCoastArrivalDay,
  createPacificCoastArrivalReservations,
  createPacificCoastLandDays,
  createPacificCoastLandReservations,
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
