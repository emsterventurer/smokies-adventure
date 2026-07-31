(function () {
"use strict";

const AdventureData =
  typeof module === "object" && module.exports
    ? require("./adventure-data.js")
    : globalThis.AdventureData;

const AdventureMigration =
  typeof module === "object" && module.exports
    ? require("./adventure-migration.js")
    : globalThis.AdventureMigration;

const AdventureStorage =
  typeof module === "object" && module.exports
    ? require("./adventure-storage.js")
    : globalThis.AdventureStorage;

const ActiveAdventure =
  typeof module === "object" && module.exports
    ? require("./active-adventure.js")
    : globalThis.ActiveAdventure;

function createAdventureStartup(options = {}) {
  const storageProvider =
    options.storageProvider ||
    (typeof window !== "undefined"
      ? window.localStorage
      : null);

  const adventureStorage =
    options.adventureStorage ||
    AdventureStorage.createAdventureStorage({
      storageProvider,
    });

  const activeAdventureService =
    options.activeAdventureService ||
    ActiveAdventure.createActiveAdventureService({
      adventureStorage,
      selectionStorage: storageProvider,
      seedFactory:
        options.seedFactory === undefined
          ? AdventureData.createSmokiesAdventureRecord
          : options.seedFactory,
    });

  function hasLegacyAdventureData() {
    if (
      !storageProvider ||
      typeof storageProvider.getItem !== "function"
    ) {
      return false;
    }

    return Object.values(
      AdventureMigration.LEGACY_STORAGE_KEYS,
    ).some(
      (key) => storageProvider.getItem(key) !== null,
    );
  }

  function initializeAdventure() {
    const existing =
      activeAdventureService.loadActiveAdventure();

    if (
      existing.status !== "seeded" ||
      !hasLegacyAdventureData()
    ) {
      return existing;
    }

    const migrated =
      AdventureMigration.migrateLegacyStorage({
        storage: storageProvider,
        baseRecord: existing.adventure,
        migratedAt:
          typeof options.migratedAt === "string"
            ? options.migratedAt
            : new Date().toISOString(),
      });

    const saved =
      activeAdventureService.saveActiveAdventure(
        migrated,
      );

    return {
      status: "migrated",
      adventure: saved,
    };
  }

  return Object.freeze({
    initializeAdventure,
    adventureStorage,
    activeAdventureService,
  });
}

const AdventureStartup = Object.freeze({
  createAdventureStartup,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureStartup;
}

if (typeof window !== "undefined") {
  window.AdventureStartup = AdventureStartup;
}
})();