(function () {
"use strict";

function isAdventureStorageModule(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.createAdventureStorage === "function"
  );
}

function createAdventureRepository(options = {}) {
  const adventureStorageModule =
    options.adventureStorageModule;

  if (
    !isAdventureStorageModule(
      adventureStorageModule,
    )
  ) {
    throw new TypeError(
      "AdventureRepository requires a valid AdventureStorage module.",
    );
  }

  const storage =
    options.storage ||
    adventureStorageModule.createAdventureStorage({
      storageProvider:
        options.storageProvider,
    });

  return Object.freeze({
    loadAdventureRecord(adventureId) {
      return storage.loadAdventureRecord(
        adventureId,
      );
    },

    saveAdventureRecord(record) {
      return storage.saveAdventureRecord(
        record,
      );
    },

    listAdventureRecords() {
      return storage.listAdventureRecords();
    },

    deleteAdventureRecord(adventureId) {
      return storage.deleteAdventureRecord(
        adventureId,
      );
    },

    hasAdventureRecord(adventureId) {
      return storage.hasAdventureRecord(
        adventureId,
      );
    },

    loadAdventure(adventureId) {
      return storage.loadAdventureRecord(
        adventureId,
      );
    },

    saveAdventure(record) {
      return storage.saveAdventureRecord(
        record,
      );
    },

    listAdventures() {
      return storage.listAdventureRecords();
    },

    deleteAdventure(adventureId) {
      return storage.deleteAdventureRecord(
        adventureId,
      );
    },

    hasAdventure(adventureId) {
      return storage.hasAdventureRecord(
        adventureId,
      );
    },
  });
}

const AdventureRepository = Object.freeze({
  createAdventureRepository,
});

if (
  typeof module !== "undefined" &&
  module.exports
) {
  module.exports = AdventureRepository;
}

if (typeof window !== "undefined") {
  window.AdventureRepository =
    AdventureRepository;
}
})();
