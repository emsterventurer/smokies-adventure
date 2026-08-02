(function () {
    "use strict";

const ACTIVE_ADVENTURE_KEY =
  "adventure-companion:active-adventure-id";

function createActiveAdventureManager(options = {}) {
  const adventureStorage = options.adventureStorage;
  const selectionStorage = options.selectionStorage;

  if (
    !adventureStorage ||
    typeof adventureStorage.loadAdventureRecord !== "function" ||
    typeof adventureStorage.saveAdventureRecord !== "function" ||
    typeof adventureStorage.hasAdventureRecord !== "function"
  ) {
    throw new TypeError(
      "A valid adventureStorage instance is required.",
    );
  }

  if (
    !selectionStorage ||
    typeof selectionStorage.getItem !== "function" ||
    typeof selectionStorage.setItem !== "function" ||
    typeof selectionStorage.removeItem !== "function"
  ) {
    throw new TypeError(
      "A valid selectionStorage provider is required.",
    );
  }

  function getActiveAdventureId() {
    const adventureId = selectionStorage.getItem(
      ACTIVE_ADVENTURE_KEY,
    );

    return typeof adventureId === "string" &&
      adventureId.trim() !== ""
      ? adventureId
      : null;
  }

  function setActiveAdventureId(adventureId) {
    if (
      typeof adventureId !== "string" ||
      adventureId.trim() === ""
    ) {
      throw new TypeError(
        "A valid adventureId is required.",
      );
    }

    if (!adventureStorage.hasAdventureRecord(adventureId)) {
      throw new Error(
        `Adventure Record not found: ${adventureId}`,
      );
    }

    selectionStorage.setItem(
      ACTIVE_ADVENTURE_KEY,
      adventureId,
    );

    return adventureId;
  }

  function getActiveAdventure() {
    const adventureId = getActiveAdventureId();

    if (!adventureId) {
      return null;
    }

    const adventure =
      adventureStorage.loadAdventureRecord(adventureId);

    if (!adventure) {
      selectionStorage.removeItem(ACTIVE_ADVENTURE_KEY);
      return null;
    }

    return adventure;
  }

function saveActiveAdventure(
  record,
  options = {},
) {
  const saved =
    adventureStorage.saveAdventureRecord(record);

  setActiveAdventureId(saved.id);

  const shouldPushToCloud =
    options.pushToCloud !== false;

  if (
    shouldPushToCloud &&
    globalThis.AdventureSharedSync &&
    typeof globalThis.AdventureSharedSync
      .pushActiveAdventure === "function"
  ) {
    globalThis.AdventureSharedSync
      .pushActiveAdventure()
      .catch((error) => {
        console.warn(
          "Shared Adventure push failed safely.",
          error,
        );
      });
  }

  return saved;
}

  function clearActiveAdventure() {
    const hadActiveAdventure =
      getActiveAdventureId() !== null;

    selectionStorage.removeItem(ACTIVE_ADVENTURE_KEY);

    return hadActiveAdventure;
  }

  return Object.freeze({
    getActiveAdventureId,
    setActiveAdventureId,
    getActiveAdventure,
    saveActiveAdventure,
    clearActiveAdventure,
  });
}

function createActiveAdventureService(options = {}) {
  const manager = createActiveAdventureManager(options);
  const adventureStorage = options.adventureStorage;
  const seedFactory =
    typeof options.seedFactory === "function"
      ? options.seedFactory
      : null;

  function loadActiveAdventure() {
    const currentAdventure =
      manager.getActiveAdventure();

    if (currentAdventure) {
      return {
        status: "loaded",
        adventure: currentAdventure,
      };
    }

    const storedAdventures =
      adventureStorage.listAdventureRecords();

    if (storedAdventures.length > 0) {
      const selectedAdventure = storedAdventures[0];

      manager.setActiveAdventureId(
        selectedAdventure.id,
      );

      return {
        status: "selected",
        adventure: selectedAdventure,
      };
    }

    if (!seedFactory) {
      return {
        status: "empty",
        adventure: null,
      };
    }

    const seedAdventure = seedFactory();
    const savedAdventure =
      manager.saveActiveAdventure(seedAdventure);

    return {
      status: "seeded",
      adventure: savedAdventure,
    };
  }

  function exportActiveAdventure() {
    const activeAdventure =
      manager.getActiveAdventure();

    if (!activeAdventure) {
      return null;
    }

    return JSON.stringify(
      {
        exportType: "adventure-companion",
        exportVersion: 1,
        exportedAt: new Date().toISOString(),
        adventure: activeAdventure,
      },
      null,
      2,
    );
  }

  return Object.freeze({
    ...manager,
    loadActiveAdventure,
    exportActiveAdventure,
  });
}
const ActiveAdventure = Object.freeze({
  ACTIVE_ADVENTURE_KEY,
  createActiveAdventureManager,
  createActiveAdventureService,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = ActiveAdventure;
}

if (typeof window !== "undefined") {
  window.ActiveAdventure = ActiveAdventure;
}
})();