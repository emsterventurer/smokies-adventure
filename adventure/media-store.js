"use strict";

const DEFAULT_DATABASE_NAME = "adventure-companion-media";
const DEFAULT_DATABASE_VERSION = 1;
const DEFAULT_OBJECT_STORE_NAME = "media";

function isIndexedDbProvider(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.open === "function"
  );
}

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return value;
}

function createMemoryMediaProvider(initialRecords = []) {
  const records = new Map();

  initialRecords.forEach((record) => {
    if (
      record &&
      typeof record === "object" &&
      typeof record.id === "string"
    ) {
      records.set(record.id, cloneValue(record));
    }
  });

  return Object.freeze({
    async save(record) {
      records.set(record.id, cloneValue(record));
      return cloneValue(record);
    },

    async get(mediaId) {
      return records.has(mediaId)
        ? cloneValue(records.get(mediaId))
        : null;
    },

    async list() {
      return Array.from(records.values()).map(cloneValue);
    },

    async delete(mediaId) {
      return records.delete(mediaId);
    },

    async clear() {
      records.clear();
    },

    async isAvailable() {
      return true;
    },
  });
}

function createIndexedDbMediaProvider(options = {}) {
  const indexedDb = options.indexedDb;
  const databaseName =
    options.databaseName || DEFAULT_DATABASE_NAME;
  const databaseVersion =
    options.databaseVersion || DEFAULT_DATABASE_VERSION;
  const objectStoreName =
    options.objectStoreName || DEFAULT_OBJECT_STORE_NAME;

  if (!isIndexedDbProvider(indexedDb)) {
    return null;
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDb.open(
        databaseName,
        databaseVersion,
      );

      request.onupgradeneeded = () => {
        const database = request.result;

        if (
          !database.objectStoreNames.contains(
            objectStoreName,
          )
        ) {
          database.createObjectStore(objectStoreName, {
            keyPath: "id",
          });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(
          request.error ||
            new Error(
              "Unable to open the Adventure Media database.",
            ),
        );
      };
    });
  }

  async function runTransaction(mode, operation) {
    const database = await openDatabase();

    try {
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(
          objectStoreName,
          mode,
        );
        const store =
          transaction.objectStore(objectStoreName);

        operation({
          store,
          resolve,
          reject,
        });

        transaction.onerror = () => {
          reject(
            transaction.error ||
              new Error(
                "Adventure Media transaction failed.",
              ),
          );
        };

        transaction.onabort = () => {
          reject(
            transaction.error ||
              new Error(
                "Adventure Media transaction was aborted.",
              ),
          );
        };
      });
    } finally {
      database.close();
    }
  }

  return Object.freeze({
    async save(record) {
      return runTransaction(
        "readwrite",
        ({ store, resolve, reject }) => {
          const request = store.put(
            cloneValue(record),
          );

          request.onsuccess = () => {
            resolve(cloneValue(record));
          };

          request.onerror = () => {
            reject(
              request.error ||
                new Error(
                  "Unable to save Adventure Media.",
                ),
            );
          };
        },
      );
    },

    async get(mediaId) {
      return runTransaction(
        "readonly",
        ({ store, resolve, reject }) => {
          const request = store.get(mediaId);

          request.onsuccess = () => {
            resolve(
              request.result
                ? cloneValue(request.result)
                : null,
            );
          };

          request.onerror = () => {
            reject(
              request.error ||
                new Error(
                  "Unable to load Adventure Media.",
                ),
            );
          };
        },
      );
    },

    async list() {
      return runTransaction(
        "readonly",
        ({ store, resolve, reject }) => {
          const request = store.getAll();

          request.onsuccess = () => {
            resolve(
              Array.isArray(request.result)
                ? request.result.map(cloneValue)
                : [],
            );
          };

          request.onerror = () => {
            reject(
              request.error ||
                new Error(
                  "Unable to list Adventure Media.",
                ),
            );
          };
        },
      );
    },

    async delete(mediaId) {
      return runTransaction(
        "readwrite",
        ({ store, resolve, reject }) => {
          const request = store.delete(mediaId);

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            reject(
              request.error ||
                new Error(
                  "Unable to delete Adventure Media.",
                ),
            );
          };
        },
      );
    },

    async clear() {
      return runTransaction(
        "readwrite",
        ({ store, resolve, reject }) => {
          const request = store.clear();

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(
              request.error ||
                new Error(
                  "Unable to clear Adventure Media.",
                ),
            );
          };
        },
      );
    },

    async isAvailable() {
      try {
        const database = await openDatabase();
        database.close();
        return true;
      } catch {
        return false;
      }
    },
  });
}

function resolveMediaProvider(options = {}) {
  if (
    options.provider &&
    typeof options.provider.save === "function" &&
    typeof options.provider.get === "function" &&
    typeof options.provider.list === "function" &&
    typeof options.provider.delete === "function" &&
    typeof options.provider.clear === "function" &&
    typeof options.provider.isAvailable === "function"
  ) {
    return options.provider;
  }

  const indexedDb =
    options.indexedDb ||
    (typeof window !== "undefined"
      ? window.indexedDB
      : null);

  return createIndexedDbMediaProvider({
    indexedDb,
    databaseName: options.databaseName,
    databaseVersion: options.databaseVersion,
    objectStoreName: options.objectStoreName,
  });
}

function createMediaStore(options = {}) {
  const provider = resolveMediaProvider(options);

  function requireProvider() {
    if (!provider) {
      throw new Error(
        "Adventure media storage is unavailable in this environment.",
      );
    }

    return provider;
  }

  function validateMediaRecord(record) {
    if (
      !record ||
      typeof record !== "object" ||
      Array.isArray(record)
    ) {
      throw new TypeError(
        "Adventure Media record must be an object.",
      );
    }

    if (
      typeof record.id !== "string" ||
      record.id.trim() === ""
    ) {
      throw new TypeError(
        "Adventure Media record id must be a non-empty string.",
      );
    }

    if (
      typeof record.adventureId !== "string" ||
      record.adventureId.trim() === ""
    ) {
      throw new TypeError(
        "Adventure Media adventureId must be a non-empty string.",
      );
    }

    if (
      typeof record.memoryId !== "string" ||
      record.memoryId.trim() === ""
    ) {
      throw new TypeError(
        "Adventure Media memoryId must be a non-empty string.",
      );
    }
  }

  function normalizeMediaRecord(record) {
    return {
      ...cloneValue(record),
      type:
        typeof record.type === "string"
          ? record.type
          : "image",
      mimeType:
        typeof record.mimeType === "string"
          ? record.mimeType
          : "application/octet-stream",
      fileName:
        typeof record.fileName === "string"
          ? record.fileName
          : null,
      createdAt:
        typeof record.createdAt === "string"
          ? record.createdAt
          : null,
      updatedAt:
        typeof record.updatedAt === "string"
          ? record.updatedAt
          : null,
    };
  }

  async function saveMedia(record) {
    validateMediaRecord(record);

    return requireProvider().save(
      normalizeMediaRecord(record),
    );
  }

  async function getMedia(mediaId) {
    if (
      typeof mediaId !== "string" ||
      mediaId.trim() === ""
    ) {
      return null;
    }

    return requireProvider().get(mediaId);
  }

  async function listMedia() {
    return requireProvider().list();
  }

  async function listMediaForMemory(memoryId) {
    if (
      typeof memoryId !== "string" ||
      memoryId.trim() === ""
    ) {
      return [];
    }

    const records = await listMedia();

    return records.filter(
      (record) => record.memoryId === memoryId,
    );
  }

  async function listMediaForAdventure(adventureId) {
    if (
      typeof adventureId !== "string" ||
      adventureId.trim() === ""
    ) {
      return [];
    }

    const records = await listMedia();

    return records.filter(
      (record) =>
        record.adventureId === adventureId,
    );
  }

  async function deleteMedia(mediaId) {
    if (
      typeof mediaId !== "string" ||
      mediaId.trim() === ""
    ) {
      return false;
    }

    const existing = await getMedia(mediaId);

    if (!existing) {
      return false;
    }

    await requireProvider().delete(mediaId);

    return true;
  }

  async function clearMedia() {
    await requireProvider().clear();
  }

  async function isAvailable() {
    return provider
      ? provider.isAvailable()
      : false;
  }

  return Object.freeze({
    saveMedia,
    getMedia,
    listMedia,
    listMediaForMemory,
    listMediaForAdventure,
    deleteMedia,
    clearMedia,
    isAvailable,
  });
}

const MediaStore = Object.freeze({
  DEFAULT_DATABASE_NAME,
  DEFAULT_DATABASE_VERSION,
  DEFAULT_OBJECT_STORE_NAME,
  createMediaStore,
  createMemoryMediaProvider,
  createIndexedDbMediaProvider,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = MediaStore;
}

if (typeof window !== "undefined") {
  window.MediaStore = MediaStore;
}