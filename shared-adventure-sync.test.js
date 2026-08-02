"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const SharedAdventureSync = require(
  "./adventure/shared-adventure-sync.js",
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
