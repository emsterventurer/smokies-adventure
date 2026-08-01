import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig =
  globalThis.ADVENTURE_FIREBASE_CONFIG;

if (
  !firebaseConfig ||
  typeof firebaseConfig !== "object"
) {
  throw new Error(
    "Adventure Companion Firebase configuration is unavailable.",
  );
}

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const database = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager:
      persistentMultipleTabManager(),
  }),
});

globalThis.AdventureFirebase =
  Object.freeze({
    app,
    database,
    isInitialized: true,
    isFirestoreInitialized: true,
  });

export {
  app,
  database,
};
