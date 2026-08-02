import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
  database,
} from "./firebase-client.mjs";

const ADVENTURE_COLLECTION =
  "adventures";

const MEMBERS_COLLECTION =
  "members";

function requireNonEmptyString(
  value,
  fieldName,
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `A valid ${fieldName} is required.`,
    );
  }

  return value.trim();
}

function membershipDocument(
  adventureId,
  firebaseUid,
) {
  return doc(
    database,
    ADVENTURE_COLLECTION,
    requireNonEmptyString(
      adventureId,
      "adventureId",
    ),
    MEMBERS_COLLECTION,
    requireNonEmptyString(
      firebaseUid,
      "firebaseUid",
    ),
  );
}

function normalizeMembership(record) {
  if (
    !record ||
    typeof record !== "object"
  ) {
    throw new TypeError(
      "A valid Adventure membership is required.",
    );
  }

  const adventureId =
    requireNonEmptyString(
      record.adventureId,
      "adventureId",
    );

  const firebaseUid =
    requireNonEmptyString(
      record.firebaseUid,
      "firebaseUid",
    );

  const adventurerId =
    requireNonEmptyString(
      record.adventurerId,
      "adventurerId",
    );

  const timestamp =
    new Date().toISOString();

  return {
    adventureId,
    firebaseUid,
    adventurerId,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : timestamp,
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : timestamp,
  };
}

async function saveMembership(record) {
  const normalized =
    normalizeMembership(record);

  await setDoc(
    membershipDocument(
      normalized.adventureId,
      normalized.firebaseUid,
    ),
    normalized,
  );

  return normalized;
}

async function loadMembership(
  adventureId,
  firebaseUid,
) {
  const snapshot =
    await getDoc(
      membershipDocument(
        adventureId,
        firebaseUid,
      ),
    );

  return snapshot.exists()
    ? snapshot.data()
    : null;
}

async function hasMembership(
  adventureId,
  firebaseUid,
) {
  const membership =
    await loadMembership(
      adventureId,
      firebaseUid,
    );

  return Boolean(membership);
}

async function listMemberships(
  adventureId,
) {
  const snapshot =
    await getDocs(
      collection(
        database,
        ADVENTURE_COLLECTION,
        requireNonEmptyString(
          adventureId,
          "adventureId",
        ),
        MEMBERS_COLLECTION,
      ),
    );

  return snapshot.docs.map(
    (documentSnapshot) =>
      documentSnapshot.data(),
  );
}

async function deleteMembership(
  adventureId,
  firebaseUid,
) {
  const existing =
    await loadMembership(
      adventureId,
      firebaseUid,
    );

  if (!existing) {
    return false;
  }

  await deleteDoc(
    membershipDocument(
      adventureId,
      firebaseUid,
    ),
  );

  return true;
}

const FirebaseMembershipProvider =
  Object.freeze({
    saveMembership,
    loadMembership,
    hasMembership,
    listMemberships,
    deleteMembership,
  });

globalThis.FirebaseMembershipProvider =
  FirebaseMembershipProvider;

globalThis.dispatchEvent(
  new CustomEvent(
    "adventure:firebase-membership-provider-ready",
    {
      detail: {
        provider:
          FirebaseMembershipProvider,
      },
    },
  ),
);

export {
  FirebaseMembershipProvider,
};
