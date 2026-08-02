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
