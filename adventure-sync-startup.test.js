const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync(
  "index.html",
  "utf8",
);

const app = fs.readFileSync(
  "app.js",
  "utf8",
);

const syncStartup = fs.readFileSync(
  "adventure/firebase/adventure-sync-startup.mjs",
  "utf8",
);

assert(
  html.includes(
    'src="adventure/firebase/adventure-sync-startup.mjs"',
  ),
  "Firebase sync startup module should load in the browser",
);

assert(
  html.indexOf(
    'src="adventure/firebase/firebase-provider.mjs"',
  ) <
    html.indexOf(
      'src="adventure/firebase/adventure-sync-startup.mjs"',
    ),
  "Firebase provider should load before sync startup",
);

assert(
  app.includes(
    "globalThis.ActiveAdventureService",
  ),
  "App startup should expose the active Adventure service",
);

assert(
  app.includes(
    '"adventure:active-service-ready"',
  ),
  "App startup should announce active service readiness",
);

assert(
  syncStartup.includes(
    "createSharedAdventureSync",
  ),
  "Sync startup should create Shared Adventure Sync",
);

assert(
  !app.includes(
    "createSharedAdventureSync",
  ) &&
    !app.includes(
      "SHARED_ADVENTURE_SYNC.subscribe",
    ),
  "app.js should not create a competing Shared Adventure Sync controller",
);

assert(
  syncStartup.includes(
    "adventureAwareAccessEnabled",
  ) &&
    syncStartup.includes(
      "canSynchronizeAdventure",
    ),
  "Adventure-aware sync should remain locked until authorized access resolves",
);

assert(
  syncStartup.includes(
    '"adventure:access-ready"',
  ) &&
    syncStartup.includes(
      "sharedAdventureSync?.stop?.()",
    ),
  "Empty or unavailable access should stop synchronization",
);

assert.equal(
  (
    syncStartup.match(
      /createSharedAdventureSync/g,
    ) ?? []
  ).length,
  2,
  "The sole sync startup module should contain one capability check and one construction call",
);

assert(
  syncStartup.includes(
    "CloudAdventureProvider",
  ),
  "Sync startup should use the Firebase cloud provider",
);

assert(
  syncStartup.includes(
    "sharedAdventureSync.subscribe",
  ),
  "Sync startup should subscribe to the active Adventure",
);

assert(
  syncStartup.includes(
    "globalThis.AdventureSharedSync",
  ),
  "Sync startup should expose its runtime controller",
);

assert(
  syncStartup.includes(
    '"adventure:shared-sync-ready"',
  ),
  "Sync startup should announce readiness",
);

console.log(
  "Adventure sync startup tests passed.",
);
