import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
  getStorage,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";

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

const auth =
  getAuth(app);

const userCredential =
  auth.currentUser
    ? {
        user: auth.currentUser,
      }
    : await signInAnonymously(auth);

const database = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager:
      persistentMultipleTabManager(),
  }),
});

const storage =
  getStorage(app);

globalThis.AdventureFirebase =
  Object.freeze({
    app,
    auth,
    database,
    storage,
    user:
      userCredential.user,
    isInitialized: true,
    isAuthenticated: true,
    isAnonymous:
      userCredential.user.isAnonymous,
    isFirestoreInitialized: true,
    isStorageInitialized: true,
  });

globalThis.dispatchEvent(
  new CustomEvent(
    "adventure:firebase-auth-ready",
    {
      detail: {
        user:
          userCredential.user,
      },
    },
  ),
);

export {
  app,
  auth,
  database,
  storage,
};
