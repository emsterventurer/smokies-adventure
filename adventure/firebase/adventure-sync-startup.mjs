import {
  CloudAdventureProvider,
} from "./firebase-provider.mjs";

let sharedAdventureSync = null;
let activeAdventureService = null;
let accessState = null;
let subscribedAdventureId = null;

const adventureAwareAccessEnabled =
  globalThis.AdventureCompanionConfig
    ?.features?.adventureAwareAccess === true;

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
  resolvedAccess = accessState,
) {
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

  if (
    adventureAwareAccessEnabled &&
    !globalThis.AdventureAccess
      ?.canSynchronizeAdventure?.(
        resolvedAccess,
        activeAdventureService
          .getActiveAdventure()?.id,
      )
  ) {
    sharedAdventureSync?.stop?.();
    subscribedAdventureId = null;
    return null;
  }

  if (!sharedAdventureSync) {
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
  }

  const activeAdventure =
    activeAdventureService
      .getActiveAdventure();

  if (
    activeAdventure?.id &&
    subscribedAdventureId !== activeAdventure.id
  ) {
    sharedAdventureSync.subscribe(
      activeAdventure.id,
    );
    subscribedAdventureId = activeAdventure.id;
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
  if (
    adventureAwareAccessEnabled &&
    accessState?.status !== "authorized"
  ) {
    return null;
  }

  return initializeSharedAdventureSync(
    globalThis.ActiveAdventureService,
    accessState,
  );
}

globalThis.addEventListener(
  "adventure:active-service-ready",
  (event) => {
    initializeSharedAdventureSync(
      event.detail
        ?.activeAdventureService,
      accessState,
    );
  },
);

globalThis.addEventListener(
  "adventure:access-ready",
  (event) => {
    accessState = event.detail ?? null;

    if (accessState?.status !== "authorized") {
      sharedAdventureSync?.stop?.();
      subscribedAdventureId = null;
      return;
    }

    initializeFromAvailableService();
  },
);

initializeFromAvailableService();

export {
  initializeSharedAdventureSync,
};
