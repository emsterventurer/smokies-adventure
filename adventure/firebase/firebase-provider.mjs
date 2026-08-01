import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
  database,
} from "./firebase-client.mjs";

const ADVENTURE_COLLECTION =
  "adventures";

function requireAdventureId(adventureId) {
  if (
    typeof adventureId !== "string" ||
    adventureId.trim() === ""
  ) {
    throw new TypeError(
      "A valid adventureId is required.",
    );
  }

  return adventureId;
}

function adventureDocument(adventureId) {
  return doc(
    database,
    ADVENTURE_COLLECTION,
    requireAdventureId(adventureId),
  );
}

async function loadAdventureRecord(adventureId) {
  const snapshot = await getDoc(
    adventureDocument(adventureId),
  );

  return snapshot.exists()
    ? snapshot.data()
    : null;
}

async function saveAdventureRecord(record) {
  if (
    !record ||
    typeof record !== "object" ||
    typeof record.id !== "string" ||
    record.id.trim() === ""
  ) {
    throw new TypeError(
      "A valid Adventure Record is required.",
    );
  }

  await setDoc(
    adventureDocument(record.id),
    record,
  );

  return record;
}

async function listAdventureRecords() {
  const snapshot = await getDocs(
    collection(
      database,
      ADVENTURE_COLLECTION,
    ),
  );

  return snapshot.docs.map(
    (documentSnapshot) =>
      documentSnapshot.data(),
  );
}

async function deleteAdventureRecord(
  adventureId,
) {
  await deleteDoc(
    adventureDocument(adventureId),
  );

  return true;
}

async function hasAdventureRecord(
  adventureId,
) {
  const snapshot = await getDoc(
    adventureDocument(adventureId),
  );

  return snapshot.exists();
}

function subscribeToAdventure(
  adventureId,
  observer,
  errorObserver,
) {
  if (typeof observer !== "function") {
    throw new TypeError(
      "A valid Adventure observer is required.",
    );
  }

  return onSnapshot(
    adventureDocument(adventureId),
    (snapshot) => {
      observer(
        snapshot.exists()
          ? snapshot.data()
          : null,
      );
    },
    typeof errorObserver === "function"
      ? errorObserver
      : undefined,
  );
}

const CloudAdventureProvider =
  Object.freeze({
    loadAdventureRecord,
    saveAdventureRecord,
    listAdventureRecords,
    deleteAdventureRecord,
    hasAdventureRecord,
    subscribeToAdventure,
  });

globalThis.CloudAdventureProvider =
  CloudAdventureProvider;

export {
  CloudAdventureProvider,
};
