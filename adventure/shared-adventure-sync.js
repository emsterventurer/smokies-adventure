(function () {
"use strict";

function isActiveAdventureService(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.getActiveAdventure === "function" &&
    typeof value.saveActiveAdventure === "function"
  );
}

function isCloudAdventureProvider(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.loadAdventureRecord === "function" &&
    typeof value.saveAdventureRecord === "function" &&
    typeof value.subscribeToAdventure === "function"
  );
}

function createSharedAdventureSync(options = {}) {
  const activeAdventureService =
    options.activeAdventureService;
  const cloudProvider =
    options.cloudProvider;

  if (
    !isActiveAdventureService(
      activeAdventureService,
    )
  ) {
    throw new TypeError(
      "SharedAdventureSync requires a valid Active Adventure Service.",
    );
  }

  if (!isCloudAdventureProvider(cloudProvider)) {
    throw new TypeError(
      "SharedAdventureSync requires a valid Cloud Adventure Provider.",
    );
  }

  let unsubscribe = null;
  let status = "idle";
  let lastError = null;

  function getStatus() {
    return Object.freeze({
      status,
      lastError,
      isSubscribed:
        typeof unsubscribe === "function",
    });
  }

  async function pushActiveAdventure() {
    const adventure =
      activeAdventureService.getActiveAdventure();

    if (!adventure) {
      return null;
    }

    status = "syncing";
    lastError = null;

    try {
      const saved =
        await cloudProvider.saveAdventureRecord(
          adventure,
        );

      status = "synced";

      return saved;
    } catch (error) {
      status = "error";
      lastError = error;
      throw error;
    }
  }

  async function pullAdventure(adventureId) {
    status = "syncing";
    lastError = null;

    try {
      const cloudAdventure =
        await cloudProvider.loadAdventureRecord(
          adventureId,
        );

      if (!cloudAdventure) {
        status = "synced";
        return null;
      }

      const saved =
        activeAdventureService.saveActiveAdventure(
          cloudAdventure,
          {
            pushToCloud: false,
          },
        );

      status = "synced";

      return saved;
    } catch (error) {
      status = "error";
      lastError = error;
      throw error;
    }
  }

  function subscribe(adventureId) {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }

    status = "syncing";
    lastError = null;

    unsubscribe =
      cloudProvider.subscribeToAdventure(
        adventureId,
        (cloudAdventure) => {
          if (!cloudAdventure) {
            status = "synced";
            return;
          }

                   const saved =
            activeAdventureService.saveActiveAdventure(
              cloudAdventure,
              {
                pushToCloud: false,
              },
            );

          status = "synced";
          lastError = null;

          if (
            typeof globalThis.dispatchEvent ===
              "function" &&
            typeof globalThis.CustomEvent ===
              "function"
          ) {
            globalThis.dispatchEvent(
              new CustomEvent(
                "adventure:cloud-update-received",
                {
                  detail: {
                    adventure: saved,
                  },
                },
              ),
            );
          }
        },
        (error) => {
          status = "error";
          lastError = error;
        },
      );

    return unsubscribe;
  }

  function stop() {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }

    unsubscribe = null;
    status = "idle";
  }

  return Object.freeze({
    getStatus,
    pushActiveAdventure,
    pullAdventure,
    subscribe,
    stop,
  });
}

const SharedAdventureSync = Object.freeze({
  createSharedAdventureSync,
});

if (
  typeof module !== "undefined" &&
  module.exports
) {
  module.exports = SharedAdventureSync;
}

if (typeof window !== "undefined") {
  window.SharedAdventureSync =
    SharedAdventureSync;
}
})();
