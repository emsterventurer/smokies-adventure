(function () {
"use strict";

function isAdventureStorage(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.createAdventureStorage === "function"
  );
}

function createAdventureRepository(options = {}) {
  const adventureStorage =
    options.adventureStorage;

  if (!isAdventureStorage(adventureStorage)) {
    throw new Error(
      "AdventureRepository requires a valid AdventureStorage module.",
    );
  }

  const storage =
    adventureStorage.createAdventureStorage();

  return Object.freeze({
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureRepository;
}

if (typeof window !== "undefined") {
  window.AdventureRepository =
    AdventureRepository;
}
})();