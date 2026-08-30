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

test("an empty Pacific cloud subscription cannot replace the bundled Arrival Day", async () => {
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

  assert.equal(
    saved.itinerary.days[0].id,
    AdventureData.PACIFIC_COAST_ARRIVAL_DAY_ID,
  );
  assert.equal(saved.reservations.items.length, 2);
});
