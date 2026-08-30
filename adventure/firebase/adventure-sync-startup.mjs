import {
  CloudAdventureProvider,
} from "./firebase-provider.mjs";

let sharedAdventureSync = null;
let activeAdventureService = null;

function isActiveAdventureService(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.getActiveAdventure ===
        "function" &&
      typeof value.saveActiveAdventure ===
        "function",
  );
}

function initializeSharedAdventureSync(
  service,
) {
  if (sharedAdventureSync) {
    return sharedAdventureSync;
  }

  if (
    !isActiveAdventureService(service) ||
    !globalThis.SharedAdventureSync ||
    typeof globalThis.SharedAdventureSync
      .createSharedAdventureSync !==
      "function"
  ) {
    return null;
  }

  activeAdventureService = service;

  sharedAdventureSync =
    globalThis.SharedAdventureSync
      .createSharedAdventureSync({
        activeAdventureService,
        cloudProvider:
          CloudAdventureProvider,
        prepareIncomingAdventure:
          globalThis.AdventureData
            ?.prepareBundledAdventureRecord,
      });

  const activeAdventure =
    activeAdventureService
      .getActiveAdventure();

  if (activeAdventure?.id) {
    sharedAdventureSync.subscribe(
      activeAdventure.id,
    );
  }

  globalThis.AdventureSharedSync =
    sharedAdventureSync;

  globalThis.dispatchEvent(
    new CustomEvent(
      "adventure:shared-sync-ready",
      {
        detail: {
          sharedAdventureSync,
          adventureId:
            activeAdventure?.id ?? null,
        },
      },
    ),
  );

  return sharedAdventureSync;
}

function initializeFromAvailableService() {
  return initializeSharedAdventureSync(
    globalThis.ActiveAdventureService,
  );
}

globalThis.addEventListener(
  "adventure:active-service-ready",
  (event) => {
    initializeSharedAdventureSync(
      event.detail
        ?.activeAdventureService,
    );
  },
);

initializeFromAvailableService();

export {
  initializeSharedAdventureSync,
};
