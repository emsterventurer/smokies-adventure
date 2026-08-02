const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync(
  "index.html",
  "utf8",
);

const firebaseClient = fs.readFileSync(
  "adventure/firebase/firebase-client.mjs",
  "utf8",
);

const firebaseMediaProvider = fs.readFileSync(
  "adventure/firebase/firebase-media-provider.mjs",
  "utf8",
);

const app = fs.readFileSync(
  "app.js",
  "utf8",
);

assert(
  html.includes(
    'src="adventure/firebase/firebase-media-provider.mjs"',
  ),
  "Firebase media provider should load in the browser",
);

assert(
  html.indexOf(
    'src="adventure/firebase/firebase-provider.mjs"',
  ) <
    html.indexOf(
      'src="adventure/firebase/firebase-media-provider.mjs"',
    ),
  "Firebase Adventure provider should load before the media provider",
);

assert(
  firebaseClient.includes(
    "getStorage",
  ),
  "Firebase client should initialize Cloud Storage",
);

assert(
  firebaseClient.includes(
    "isStorageInitialized: true",
  ),
  "Firebase client should report Storage readiness",
);

assert(
  firebaseMediaProvider.includes(
    "uploadBytes",
  ),
  "Firebase media provider should upload File or Blob data",
);

assert(
  firebaseMediaProvider.includes(
    "getDownloadURL",
  ),
  "Firebase media provider should retrieve a shared photo URL",
);

assert(
  firebaseMediaProvider.includes(
    "deleteObject",
  ),
  "Firebase media provider should delete stored photo files",
);

assert(
  firebaseMediaProvider.includes(
    "adventureMedia",
  ),
  "Firebase media metadata should use its own Firestore collection",
);

assert(
  app.includes(
    '"adventure:firebase-media-provider-ready"',
  ),
  "App should respond when the Firebase media provider becomes ready",
);

assert(
  app.includes(
    "record.downloadUrl",
  ),
  "Adventure Book should render shared cloud photo URLs",
);

assert(
  app.includes(
    "URL.createObjectURL",
  ),
  "Adventure Book should retain local IndexedDB photo support",
);


assert(
  firebaseMediaProvider.includes(
    "listForMemory",
  ),
  "Firebase media provider should support scoped memory queries",
);

assert(
  firebaseMediaProvider.includes(
    '"adventureId"',
  ) &&
    firebaseMediaProvider.includes(
      '"memoryId"',
    ),
  "Scoped memory queries should filter by Adventure and Memory ID",
);
assert(
  app.includes(
    "activeAdventure?.id ?? null",
  ),
  "Memory deletion should scope media lookup to the active Adventure",
);

assert(
  app.includes(
    ".listMediaForMemory(",
  ) &&
    app.includes(
      "memoryId,",
    ),
  "Memory deletion should use the scoped media lookup",
);
console.log(
  "Firebase media provider tests passed.",
);