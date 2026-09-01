"use strict";

const {
  HttpsError,
} = require("firebase-functions/v2/https");

function createAccessService({ database }) {
  if (
    !database ||
    typeof database.collectionGroup !== "function"
  ) {
    throw new TypeError(
      "A valid Firestore database is required.",
    );
  }

  async function listMyAdventureAccess(request) {
    const uid = request?.auth?.uid;

    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "Authentication is required.",
      );
    }

    const snapshot = await database
      .collectionGroup("members")
      .where("firebaseUid", "==", uid)
      .get();

    const accessByAdventureId = new Map();

    snapshot.docs.forEach((documentSnapshot) => {
      const membership =
        documentSnapshot.data();
      const adventureId =
        documentSnapshot.ref.parent.parent?.id;

      if (
        documentSnapshot.id !== uid ||
        membership?.firebaseUid !== uid ||
        membership?.adventureId !== adventureId ||
        typeof membership?.adventurerId !== "string" ||
        membership.adventurerId.length === 0
      ) {
        return;
      }

      accessByAdventureId.set(
        adventureId,
        {
          adventureId,
          adventurerId:
            membership.adventurerId,
        },
      );
    });

    return {
      adventures: Array.from(
        accessByAdventureId.values(),
      ).sort((left, right) =>
        left.adventureId.localeCompare(
          right.adventureId,
        ),
      ),
    };
  }

  return Object.freeze({
    listMyAdventureAccess,
  });
}

module.exports = Object.freeze({
  createAccessService,
});
