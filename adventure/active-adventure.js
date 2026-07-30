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

  function saveActiveAdventure(record) {
    const saved =
      adventureStorage.saveAdventureRecord(record);

    setActiveAdventureId(saved.id);

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

const ActiveAdventure = Object.freeze({
  ACTIVE_ADVENTURE_KEY,
  createActiveAdventureManager,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = ActiveAdventure;
}

if (typeof window !== "undefined") {
  window.ActiveAdventure = ActiveAdventure;
}