"use strict";

const AdventureNormalization = require(
  "./adventure-normalization.js",
);
const AdventureValidation = require(
  "./adventure-validation.js",
);

const STORAGE_KEY_PREFIX = "adventure-companion:adventure:";
const STORAGE_INDEX_KEY =
  "adventure-companion:adventure-index";

function isStorageProvider(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.getItem === "function" &&
    typeof value.setItem === "function" &&
    typeof value.removeItem === "function"
  );
}

function createMemoryStorage(initialEntries = {}) {
  const entries = new Map(
    Object.entries(initialEntries).map(([key, value]) => [
      String(key),
      String(value),
    ]),
  );

  return {
    getItem(key) {
      const normalizedKey = String(key);

      return entries.has(normalizedKey)
        ? entries.get(normalizedKey)
        : null;
    },

    setItem(key, value) {
      entries.set(String(key), String(value));
    },

    removeItem(key) {
      entries.delete(String(key));
    },

    clear() {
      entries.clear();
    },

    key(index) {
      return Array.from(entries.keys())[index] ?? null;
    },

    get length() {
      return entries.size;
    },
  };
}

function resolveStorageProvider(storageProvider) {
  if (isStorageProvider(storageProvider)) {
    return storageProvider;
  }

  if (
    typeof window !== "undefined" &&
    isStorageProvider(window.localStorage)
  ) {
    return window.localStorage;
  }

  return null;
}

function createAdventureStorage(options = {}) {
  const storage = resolveStorageProvider(
    options.storageProvider,
  );

  function requireStorage() {
    if (!storage) {
      throw new Error(
        "Adventure storage is unavailable in this environment.",
      );
    }

    return storage;
  }

  function getRecordKey(adventureId) {
    return `${STORAGE_KEY_PREFIX}${adventureId}`;
  }

  function readIndex() {
    const provider = requireStorage();
    const rawIndex = provider.getItem(STORAGE_INDEX_KEY);

    if (rawIndex === null) {
      return [];
    }

    try {
      const parsedIndex = JSON.parse(rawIndex);

      return Array.isArray(parsedIndex)
        ? parsedIndex.filter(
            (adventureId) =>
              typeof adventureId === "string" &&
              adventureId.trim() !== "",
          )
        : [];
    } catch {
      return [];
    }
  }

  function writeIndex(adventureIds) {
    const provider = requireStorage();
    const uniqueAdventureIds = Array.from(
      new Set(adventureIds),
    );

    provider.setItem(
      STORAGE_INDEX_KEY,
      JSON.stringify(uniqueAdventureIds),
    );
  }

  function saveAdventureRecord(record) {
    const provider = requireStorage();
    const normalized =
      AdventureNormalization.normalizeAdventureRecord(
        record,
      );
    const validation =
      AdventureValidation.validateAdventureRecord(
        normalized,
      );

    if (!validation.valid) {
      const error = new Error(
        "Adventure Record failed validation.",
      );

      error.name = "AdventureValidationError";
      error.validationErrors = validation.errors;

      throw error;
    }

    provider.setItem(
      getRecordKey(normalized.id),
      JSON.stringify(normalized),
    );

    const adventureIds = readIndex();

    if (!adventureIds.includes(normalized.id)) {
      writeIndex([...adventureIds, normalized.id]);
    }

    return structuredClone(normalized);
  }

  function loadAdventureRecord(adventureId) {
    const provider = requireStorage();

    if (
      typeof adventureId !== "string" ||
      adventureId.trim() === ""
    ) {
      return null;
    }

    const rawRecord = provider.getItem(
      getRecordKey(adventureId),
    );

    if (rawRecord === null) {
      return null;
    }

    let parsedRecord;

    try {
      parsedRecord = JSON.parse(rawRecord);
    } catch {
      return null;
    }

    const normalized =
      AdventureNormalization.normalizeAdventureRecord(
        parsedRecord,
      );
    const validation =
      AdventureValidation.validateAdventureRecord(
        normalized,
      );

    if (!validation.valid) {
      return null;
    }

    return structuredClone(normalized);
  }

  function listAdventureRecords() {
    return readIndex()
      .map(loadAdventureRecord)
      .filter(Boolean);
  }

  function deleteAdventureRecord(adventureId) {
    const provider = requireStorage();

    if (
      typeof adventureId !== "string" ||
      adventureId.trim() === ""
    ) {
      return false;
    }

    const recordKey = getRecordKey(adventureId);
    const existed = provider.getItem(recordKey) !== null;

    provider.removeItem(recordKey);

    const nextAdventureIds = readIndex().filter(
      (storedAdventureId) =>
        storedAdventureId !== adventureId,
    );

    writeIndex(nextAdventureIds);

    return existed;
  }

  function hasAdventureRecord(adventureId) {
    const provider = requireStorage();

    if (
      typeof adventureId !== "string" ||
      adventureId.trim() === ""
    ) {
      return false;
    }

    return (
      provider.getItem(getRecordKey(adventureId)) !== null
    );
  }

  return Object.freeze({
    saveAdventureRecord,
    loadAdventureRecord,
    listAdventureRecords,
    deleteAdventureRecord,
    hasAdventureRecord,
  });
}

const AdventureStorage = Object.freeze({
  STORAGE_KEY_PREFIX,
  STORAGE_INDEX_KEY,
  createAdventureStorage,
  createMemoryStorage,
  isStorageProvider,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureStorage;
}

if (typeof window !== "undefined") {
  window.AdventureStorage = AdventureStorage;
}