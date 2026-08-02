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

import {
  getStorage,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

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

const currentUser =
  await new Promise((resolve) => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
      );
  });

async function signInWithGoogle() {
  const provider =
    new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  const result =
    await signInWithPopup(
      auth,
      provider,
    );

  return result.user;
}

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
      currentUser,
    signInWithGoogle,
    isInitialized: true,
    isAuthenticated: true,
    isAnonymous:
      currentUser?.isAnonymous ?? false,
    isFirestoreInitialized: true,
    isStorageInitialized: true,
  });

globalThis.dispatchEvent(
  new CustomEvent(
    "adventure:firebase-auth-ready",
    {
      detail: {
        user:
          currentUser,
      },
    },
  ),
);

export {
  app,
  auth,
  database,
  storage,
  signInWithGoogle,
};
