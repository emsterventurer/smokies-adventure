import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

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

globalThis.AdventureFirebase =
  Object.freeze({
    app,
    isInitialized: true,
  });
  