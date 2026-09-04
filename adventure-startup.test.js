"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
);
const AdventureStartup = require(
  "./adventure/adventure-startup.js",
);

function createTestStartup(options = {}) {
  const storageProvider =
    AdventureStorage.createMemoryStorage(
      options.initialEntries,
    );

  const startup =
    AdventureStartup.createAdventureStartup({
      storageProvider,
      seedFactory:
        options.seedFactory === undefined
          ? AdventureData.createSmokiesAdventureRecord
          : options.seedFactory,
      migratedAt:
        options.migratedAt ||
        "2026-07-31T18:00:00-04:00",
    });

  return {
    storageProvider,
    startup,
  };
}

test("loads an existing active Adventure Record", () => {
  const { startup } = createTestStartup();

  const saved =
    startup.activeAdventureService.saveActiveAdventure(
      AdventureData.createSmokiesAdventureRecord(),
    );

  const result = startup.initializeAdventure();

  assert.equal(result.status, "loaded");
  assert.deepEqual(result.adventure, saved);
});

test("selects the first stored adventure when no active ID exists", () => {
  const { startup } = createTestStartup();

  startup.adventureStorage.saveAdventureRecord({
    ...AdventureData.createSmokiesAdventureRecord(),
    id: "blue-ridge-weekend",
    slug: "blue-ridge-weekend",
    title: "Blue Ridge Weekend",
  });

  const result = startup.initializeAdventure();

  assert.equal(result.status, "selected");
  assert.equal(
    result.adventure.id,
    "blue-ridge-weekend",
  );
});

test("seeds the Smokies Adventure when no stored data exists", () => {
  const { startup } = createTestStartup();

  const result = startup.initializeAdventure();

  assert.equal(result.status, "seeded");
  assert.equal(result.adventure.id, "smokies-2026");
  assert.equal(
    startup.adventureStorage.hasAdventureRecord(
      "smokies-2026",
    ),
    true,
  );
  assert.equal(
    startup.adventureStorage.hasAdventureRecord(
      "pacific-coast-2026",
    ),
    true,
  );
  assert.equal(
    startup.activeAdventureService
      .getActiveAdventureId(),
    "smokies-2026",
  );
});

test("adds the Pacific Coast shell without replacing stored data", () => {
  const { startup } = createTestStartup();
  const storedPacific = {
    ...AdventureData.createPacificCoastAdventureRecord(),
    subtitle: "Saved locally",
  };

  startup.adventureStorage.saveAdventureRecord(
    storedPacific,
  );
  startup.activeAdventureService.saveActiveAdventure(
    AdventureData.createSmokiesAdventureRecord(),
  );

  startup.initializeAdventure();

  assert.equal(
    startup.adventureStorage.loadAdventureRecord(
      "pacific-coast-2026",
    ).subtitle,
    "Saved locally",
  );
  assert.equal(
    startup.activeAdventureService
      .getActiveAdventureId(),
    "smokies-2026",
  );
});

test("enriches an already stored empty Pacific Coast shell with all bundled days", () => {
  const storageProvider =
    AdventureStorage.createMemoryStorage();
  const adventureStorage =
    AdventureStorage.createAdventureStorage({
      storageProvider,
    });
  const shell =
    AdventureData.createPacificCoastAdventureRecord();

  adventureStorage.saveAdventureRecord(shell);

  const startup =
    AdventureStartup.createAdventureStartup({
      storageProvider,
      adventureStorage,
    });

  startup.initializeAdventure();

  const stored =
    adventureStorage.loadAdventureRecord(
      AdventureData.PACIFIC_COAST_ADVENTURE_ID,
    );

  assert.deepEqual(
    stored.itinerary.days.map((day) => day.id),
    [
      AdventureData.PACIFIC_COAST_ARRIVAL_DAY_ID,
      ...AdventureData.PACIFIC_COAST_LAND_DAY_IDS,
    ],
  );
  assert.equal(stored.reservations.items.length, 9);
});

test("startup adds missing land days to a production-style Pacific record", () => {
  const storageProvider =
    AdventureStorage.createMemoryStorage();
  const adventureStorage =
    AdventureStorage.createAdventureStorage({
      storageProvider,
    });
  const shell =
    AdventureData.createPacificCoastAdventureRecord();
  const arrivalDay =
    AdventureData.createPacificCoastArrivalDay();
  arrivalDay.title = "Stored production Arrival Day";
  shell.itinerary.days.push(arrivalDay);

  adventureStorage.saveAdventureRecord(shell);

  const startup =
    AdventureStartup.createAdventureStartup({
      storageProvider,
      adventureStorage,
    });

  startup.initializeAdventure();

  const stored =
    adventureStorage.loadAdventureRecord(
      AdventureData.PACIFIC_COAST_ADVENTURE_ID,
    );

  assert.deepEqual(
    stored.itinerary.days.map((day) => day.id),
    [
      AdventureData.PACIFIC_COAST_ARRIVAL_DAY_ID,
      ...AdventureData.PACIFIC_COAST_LAND_DAY_IDS,
    ],
  );
  assert.equal(
    stored.itinerary.days[0].title,
    "Stored production Arrival Day",
  );
});

test("startup upgrades the stored Pacific Monday route and participants", () => {
  const storageProvider = AdventureStorage.createMemoryStorage();
  const adventureStorage = AdventureStorage.createAdventureStorage({
    storageProvider,
  });
  const adventure = AdventureData.createPacificCoastAdventureRecord();
  adventure.participants = [{ adventurerId: "emily", custom: true }];
  const monday = AdventureData.createPacificCoastLandDays().find(
    (day) => day.id === "2026-09-28",
  );
  monday.stops = monday.stops.filter((stop) => stop.id !== "castle-rock");
  monday.stops.find(
    (stop) => stop.id === "chihuly-bridge-of-glass",
  ).driveFromPrevious = "3 hr 31–57 min DIRECT";
  adventure.itinerary.days = [monday];
  adventureStorage.saveAdventureRecord(adventure);

  AdventureStartup.createAdventureStartup({
    storageProvider,
    adventureStorage,
  }).initializeAdventure();

  const stored = adventureStorage.loadAdventureRecord(
    AdventureData.PACIFIC_COAST_ADVENTURE_ID,
  );
  const storedMonday = stored.itinerary.days.find(
    (day) => day.id === "2026-09-28",
  );
  assert.equal(
    storedMonday.stops.filter((stop) => stop.id === "castle-rock").length,
    1,
  );
  assert.equal(
    storedMonday.stops.find(
      (stop) => stop.id === "chihuly-bridge-of-glass",
    ).driveFromPrevious,
    "1 hr 30 min",
  );
  assert.equal(
    storedMonday.stops.find((stop) => stop.id === "castle-rock")
      .driveFromPrevious,
    "2 hr 15 min",
  );
  assert.deepEqual(
    stored.participants.map((participant) => participant.adventurerId),
    ["emily", "carolyn"],
  );
});

test("startup upgrades the known stored Sea Grill reservation and Friday stops", () => {
  const storageProvider =
    AdventureStorage.createMemoryStorage();
  const adventureStorage =
    AdventureStorage.createAdventureStorage({
      storageProvider,
    });
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();

  const legacyFriday =
    AdventureData.createPacificCoastLandDays().find(
      (day) => day.id === "2026-09-25",
    );

  const legacySeaGrillStop = legacyFriday.stops.find(
    (stop) => stop.id === "sea-grill",
  );
  legacyFriday.stops.forEach((stop) => { delete stop.routeFromPrevious; });
  legacyFriday.stops.forEach((stop) => { delete stop.routingPassBy; });
  delete legacyFriday.travelNotes;
  legacyFriday.stops[2].driveFromPrevious = "1 hr 25 min";
  legacyFriday.stops[3].priority = legacyFriday.stops[4].priority = "planned";
  legacyFriday.stops[3].notes = "Easy-access redwood context; no hiking is assumed.";
  legacyFriday.stops[4].notes = "Keep this a short, easy redwood experience; no strenuous walking.";
  legacySeaGrillStop.priority = "target";
  legacySeaGrillStop.timeLabel =
    "Target about 7:00 PM";

  const legacyHotel = legacyFriday.stops.find(
    (stop) => stop.id === "holiday-inn-express-eureka",
  );
  legacyHotel.duration =
    "Allow 45–60 minutes to check in, rest, and freshen up";

  adventure.itinerary.days.push(legacyFriday);
  adventure.reservations.items.push({
    id: "2026-09-25::Sea Grill",
    date: "2026-09-25",
    name: "Sea Grill",
    kind: "dinner",
    status: "Target",
    notes: "Target about 7:00 PM; not confirmed.",
  });

  adventureStorage.saveAdventureRecord(adventure);

  AdventureStartup.createAdventureStartup({
    storageProvider,
    adventureStorage,
  }).initializeAdventure();

  const stored =
    adventureStorage.loadAdventureRecord(
      AdventureData.PACIFIC_COAST_ADVENTURE_ID,
    );
  const friday = stored.itinerary.days.find(
    (day) => day.id === "2026-09-25",
  );
  const seaGrillStop = friday.stops.find(
    (stop) => stop.id === "sea-grill",
  );
  const hotel = friday.stops.find(
    (stop) => stop.id === "holiday-inn-express-eureka",
  );
  const seaGrill =
    stored.reservations.items.find(
      (reservation) =>
        reservation.id === "2026-09-25::Sea Grill",
    );

  assert.equal(seaGrillStop.priority, "required");
  assert.equal(seaGrillStop.timeLabel, undefined);
  assert.equal(
    hotel.duration,
    "Quick check-in and drop bags before dinner",
  );
  assert.equal(seaGrill.status, "Confirmed");
  assert.equal(seaGrill.time, "6:45 PM");
  assert.equal(seaGrill.notes, undefined);
  assert.equal(friday.stops[2].routeFromPrevious.via[0].id, "avenue-south-entrance");
  assert.equal(friday.stops[5].routeFromPrevious.via.at(-1).id, "avenue-north-end");
  assert.equal(friday.stops[2].driveFromPrevious, "About 2 hr");
  assert.equal(friday.stops[3].priority, "optional");
  assert.equal(friday.stops[4].priority, "optional");
});

test("migrates legacy adventure data when seeding the first adventure", () => {
  const { startup } = createTestStartup({
    initialEntries: {
      acCompletedDays008: JSON.stringify([
        "2026-08-07",
      ]),
      adventureCompanionReadiness:
        JSON.stringify({
          emily: {
            state: "ready",
          },
        }),
      adventureCompanionPackingM3041:
        JSON.stringify({
          "packing-item-1": true,
        }),
    },
  });

  const result = startup.initializeAdventure();

  assert.equal(result.status, "migrated");

  assert.deepEqual(
    result.adventure.completion.completedDayIds,
    ["2026-08-07"],
  );

  assert.deepEqual(
    result.adventure.readiness.travelers,
    {
      emily: {
        state: "ready",
      },
    },
  );

  assert.deepEqual(
    result.adventure.packing.travelers,
    {
      "packing-item-1": true,
    },
  );

  assert.equal(
    result.adventure.metadata.migratedAt,
    "2026-07-31T18:00:00-04:00",
  );
});

test("does not overwrite an existing stored adventure with legacy data", () => {
  const { storageProvider, startup } =
    createTestStartup();

  storageProvider.setItem(
    "acCompletedDays008",
    JSON.stringify(["2026-08-07"]),
  );

  startup.activeAdventureService.saveActiveAdventure({
    ...AdventureData.createSmokiesAdventureRecord(),
    title: "My Saved Smokies Adventure",
  });

  const result = startup.initializeAdventure();

  assert.equal(result.status, "loaded");
  assert.equal(
    result.adventure.title,
    "My Saved Smokies Adventure",
  );

  assert.deepEqual(
    result.adventure.completion.completedDayIds,
    [],
  );
});

test("retains legacy storage after migration", () => {
  const { storageProvider, startup } =
    createTestStartup({
      initialEntries: {
        acCompletedDays008: JSON.stringify([
          "2026-08-07",
        ]),
      },
    });

  startup.initializeAdventure();

  assert.equal(
    storageProvider.getItem(
      "acCompletedDays008",
    ),
    JSON.stringify(["2026-08-07"]),
  );
});

test("returns an empty result when no seed factory exists", () => {
  const { startup } = createTestStartup({
    seedFactory: null,
  });

  const result = startup.initializeAdventure();

  assert.deepEqual(result, {
    status: "empty",
    adventure: null,
  });
});

test("initialization is idempotent after migration", () => {
  const { startup } = createTestStartup({
    initialEntries: {
      acCompletedDays008: JSON.stringify([
        "2026-08-07",
      ]),
    },
  });

  const first = startup.initializeAdventure();
  const second = startup.initializeAdventure();

  assert.equal(first.status, "migrated");
  assert.equal(second.status, "loaded");
  assert.deepEqual(
    second.adventure,
    first.adventure,
  );
});
test("loads browser modules in dependency order before app startup", () => {
  const indexHtml = fs.readFileSync(
    path.join(__dirname, "index.html"),
    "utf8",
  );

  const requiredScripts = [
    "adventure/adventurer-directory.js",
    "adventure/adventure-data.js",
    "adventure/adventure-normalization.js",
    "adventure/adventure-validation.js",
    "adventure/adventure-migration.js",
    "adventure/adventure-storage.js",
    "adventure/active-adventure.js",
    "adventure/media-store.js",
    "adventure/adventure-startup.js",
    "shared-state.js",
    "adventure-brain.js",
    "living-campfire.js",
    "app.js",
  ];

  const positions = requiredScripts.map((script) => {
    const position = indexHtml.indexOf(
      `src="${script}"`,
    );

    assert.notEqual(
      position,
      -1,
      `Expected index.html to load ${script}.`,
    );

    return position;
  });

  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(
      positions[index] > positions[index - 1],
      `${requiredScripts[index]} must load after ${requiredScripts[index - 1]}.`,
    );
  }
});

test("initializes durable adventure data before itinerary rendering and keeps reliability last", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  const durableInitialization =
    appSource.indexOf(
      "initializeDurableAdventureData();",
    );

  const itineraryAssignment =
    appSource.indexOf("DATA = {");

  const initialRender =
    appSource.indexOf("drawPhase(now);");

  const reliabilityHandshake =
    appSource.lastIndexOf(
      "window.AdventureReliability?.markAppReady",
    );

  assert.notEqual(durableInitialization, -1);
  assert.notEqual(itineraryAssignment, -1);
  assert.notEqual(initialRender, -1);
  assert.notEqual(reliabilityHandshake, -1);

  assert.ok(
    durableInitialization < itineraryAssignment,
    "Durable Adventure Data must initialize before the legacy itinerary assignment.",
  );

  assert.ok(
    itineraryAssignment < initialRender,
    "The itinerary must exist before initial rendering.",
  );

  assert.ok(
    initialRender < reliabilityHandshake,
    "The Reliability Handshake must remain after startup and rendering initialization.",
  );
});
