"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const SharedAdventureSync = require(
  "./adventure/shared-adventure-sync.js",
);
const AdventureData = require(
  "./adventure/adventure-data.js",
);

function createActiveAdventureService() {
  let activeAdventure = {
    id: "smokies-2026",
    title: "Smokies 2026",
  };

  return {
    getActiveAdventure() {
      return activeAdventure;
    },

    saveActiveAdventure(record) {
      activeAdventure = record;
      return record;
    },
  };
}

function createCloudProvider() {
  let storedAdventure = null;

  return {
    async loadAdventureRecord() {
      return storedAdventure;
    },

    async saveAdventureRecord(record) {
      storedAdventure = record;
      return record;
    },

    subscribeToAdventure(
      adventureId,
      observer,
    ) {
      observer(storedAdventure);

      return () => {};
    },
  };
}

test("creates Shared Adventure Sync", () => {
  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService:
        createActiveAdventureService(),
      cloudProvider:
        createCloudProvider(),
    });

  assert.equal(
    sync.getStatus().status,
    "idle",
  );
});

test("pushes the active Adventure", async () => {
  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService:
        createActiveAdventureService(),
      cloudProvider:
        createCloudProvider(),
    });

  const saved =
    await sync.pushActiveAdventure();

  assert.equal(
    saved.id,
    "smokies-2026",
  );

  assert.equal(
    sync.getStatus().status,
    "synced",
  );
});

test("pulls an Adventure", async () => {
  const provider =
    createCloudProvider();

  await provider.saveAdventureRecord({
    id: "cloud-trip",
  });

  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService:
        createActiveAdventureService(),
      cloudProvider: provider,
    });

  const record =
    await sync.pullAdventure(
      "cloud-trip",
    );

  assert.equal(
    record.id,
    "cloud-trip",
  );
});

test("pulls an Adventure without pushing it back to the cloud", async () => {
  const provider =
    createCloudProvider();

  await provider.saveAdventureRecord({
    id: "cloud-trip",
  });

  let pushToCloud = false;

  const activeAdventureService =
    createActiveAdventureService();

  const originalSave =
    activeAdventureService.saveActiveAdventure;

  activeAdventureService.saveActiveAdventure =
    (record, options) => {
      pushToCloud =
        options?.pushToCloud !== false;

      return originalSave.call(
        activeAdventureService,
        record,
        options,
      );
    };

  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService,
      cloudProvider: provider,
    });

  await sync.pullAdventure("cloud-trip");

  assert.equal(
    pushToCloud,
    false,
    "Cloud pulls should not request another cloud push",
  );
});

test("prepares an inbound cloud Adventure before saving it locally", async () => {
  const provider = createCloudProvider();
  const activeAdventureService =
    createActiveAdventureService();
  let savedAdventure = null;

  activeAdventureService.saveActiveAdventure =
    (record) => {
      savedAdventure = record;
      return record;
    };

  await provider.saveAdventureRecord({
    id: "pacific-coast-2026",
    itinerary: {
      days: [],
    },
  });

  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService,
      cloudProvider: provider,
      prepareIncomingAdventure: (record) => ({
        ...record,
        itinerary: {
          days: [{ id: "2026-09-24" }],
        },
      }),
    });

  await sync.pullAdventure(
    "pacific-coast-2026",
  );

  assert.deepEqual(
    savedAdventure.itinerary.days,
    [{ id: "2026-09-24" }],
  );
});

test("an empty Pacific cloud subscription receives all bundled land days", async () => {
  const provider = createCloudProvider();
  const activeAdventureService =
    createActiveAdventureService();

  await provider.saveAdventureRecord(
    AdventureData.createPacificCoastAdventureRecord(),
  );

  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService,
      cloudProvider: provider,
      prepareIncomingAdventure:
        AdventureData.prepareBundledAdventureRecord,
    });

  sync.subscribe(
    AdventureData.PACIFIC_COAST_ADVENTURE_ID,
  );

  const saved =
    activeAdventureService.getActiveAdventure();

  assert.deepEqual(
    saved.itinerary.days.map((day) => day.id),
    [
      AdventureData.PACIFIC_COAST_ARRIVAL_DAY_ID,
      ...AdventureData.PACIFIC_COAST_LAND_DAY_IDS,
    ],
  );
  assert.equal(saved.reservations.items.length, 9);
});

test("an inbound Pacific Arrival Day is preserved while missing land days are prepared", async () => {
  const provider = createCloudProvider();
  const activeAdventureService =
    createActiveAdventureService();
  const cloudAdventure =
    AdventureData.createPacificCoastAdventureRecord();
  const storedArrival = {
    ...AdventureData.createPacificCoastArrivalDay(),
    title: "Cloud-authored Arrival Day",
    custom: { preserved: true },
  };
  cloudAdventure.itinerary.days.push(storedArrival);

  await provider.saveAdventureRecord(cloudAdventure);

  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService,
      cloudProvider: provider,
      prepareIncomingAdventure:
        AdventureData.prepareBundledAdventureRecord,
    });

  await sync.pullAdventure(
    AdventureData.PACIFIC_COAST_ADVENTURE_ID,
  );

  const saved =
    activeAdventureService.getActiveAdventure();

  assert.deepEqual(
    saved.itinerary.days[0],
    storedArrival,
  );
  assert.deepEqual(
    saved.itinerary.days.map((day) => day.id),
    [
      AdventureData.PACIFIC_COAST_ARRIVAL_DAY_ID,
      ...AdventureData.PACIFIC_COAST_LAND_DAY_IDS,
    ],
  );
});

test("inbound Pacific preparation upgrades the known legacy Sea Grill reservation and Friday stops", async () => {
  const provider = createCloudProvider();
  const activeAdventureService =
    createActiveAdventureService();
  const cloudAdventure =
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

  cloudAdventure.itinerary.days.push(legacyFriday);
  cloudAdventure.reservations.items.push({
    id: "2026-09-25::Sea Grill",
    date: "2026-09-25",
    name: "Sea Grill",
    kind: "dinner",
    status: "Target",
    notes: "Target about 7:00 PM; not confirmed.",
  });

  await provider.saveAdventureRecord(cloudAdventure);

  const sync =
    SharedAdventureSync.createSharedAdventureSync({
      activeAdventureService,
      cloudProvider: provider,
      prepareIncomingAdventure:
        AdventureData.prepareBundledAdventureRecord,
    });

  await sync.pullAdventure(
    AdventureData.PACIFIC_COAST_ADVENTURE_ID,
  );

  const saved =
    activeAdventureService.getActiveAdventure();
  const friday = saved.itinerary.days.find(
    (day) => day.id === "2026-09-25",
  );
  const seaGrillStop = friday.stops.find(
    (stop) => stop.id === "sea-grill",
  );
  const hotel = friday.stops.find(
    (stop) => stop.id === "holiday-inn-express-eureka",
  );
  const seaGrill =
    saved.reservations.items.find(
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

test("inbound Pacific preparation upgrades Monday and adds Carolyn consistently", async () => {
  const provider = createCloudProvider();
  const activeAdventureService = createActiveAdventureService();
  const cloudAdventure = AdventureData.createPacificCoastAdventureRecord();
  cloudAdventure.participants = [{ adventurerId: "bubbe", custom: true }];
  const monday = AdventureData.createPacificCoastLandDays().find(
    (day) => day.id === "2026-09-28",
  );
  monday.stops = monday.stops.filter((stop) => stop.id !== "castle-rock");
  monday.stops.find(
    (stop) => stop.id === "chihuly-bridge-of-glass",
  ).driveFromPrevious = "3 hr 31–57 min DIRECT";
  cloudAdventure.itinerary.days = [monday];
  await provider.saveAdventureRecord(cloudAdventure);

  const sync = SharedAdventureSync.createSharedAdventureSync({
    activeAdventureService,
    cloudProvider: provider,
    prepareIncomingAdventure: AdventureData.prepareBundledAdventureRecord,
  });
  await sync.pullAdventure(AdventureData.PACIFIC_COAST_ADVENTURE_ID);

  const saved = activeAdventureService.getActiveAdventure();
  const savedMonday = saved.itinerary.days.find(
    (day) => day.id === "2026-09-28",
  );
  assert.deepEqual(
    saved.participants.map((participant) => participant.adventurerId),
    ["bubbe", "carolyn"],
  );
  assert.equal(
    savedMonday.stops.filter((stop) => stop.id === "castle-rock").length,
    1,
  );
  assert.equal(
    savedMonday.stops.find(
      (stop) => stop.id === "chihuly-bridge-of-glass",
    ).driveFromPrevious,
    "1 hr 30 min",
  );
  assert.equal(
    savedMonday.stops.find((stop) => stop.id === "castle-rock")
      .driveFromPrevious,
    "2 hr 15 min",
  );
});
