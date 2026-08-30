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

const AdventureRepository =
  typeof module === "object" && module.exports
    ? require("./adventure-repository.js")
    : globalThis.AdventureRepository;

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
    AdventureRepository.createAdventureRepository({
      adventureStorageModule: AdventureStorage,
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

  const bundledAdventureFactories =
    options.seedFactory === null
      ? []
      : options.bundledAdventureFactories ?? [
          AdventureData
            .createPacificCoastAdventureRecord,
        ];

  function ensureBundledAdventures() {
    bundledAdventureFactories.forEach(
      (createAdventureRecord) => {
        if (typeof createAdventureRecord !== "function") {
          return;
        }

        const record = createAdventureRecord();

        if (
          !adventureStorage.hasAdventureRecord(
            record.id,
          )
        ) {
          adventureStorage.saveAdventureRecord(record);
        }

        const storedRecord =
          adventureStorage.loadAdventureRecord(
            record.id,
          );
        const preparedRecord =
          AdventureData.prepareBundledAdventureRecord?.(
            storedRecord,
          ) ?? storedRecord;

        if (
          storedRecord &&
          preparedRecord !== storedRecord
        ) {
          adventureStorage.saveAdventureRecord(
            preparedRecord,
          );
        }
      },
    );
  }

  function refreshResultAdventure(result) {
    const activeAdventure =
      activeAdventureService.getActiveAdventure();

    return activeAdventure
      ? {
          ...result,
          adventure: activeAdventure,
        }
      : result;
  }

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
      ensureBundledAdventures();
      return refreshResultAdventure(existing);
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

    ensureBundledAdventures();

    return refreshResultAdventure({
      status: "migrated",
      adventure: saved,
    });
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
