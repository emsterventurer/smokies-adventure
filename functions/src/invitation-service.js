"use strict";

const {
  HttpsError,
} = require("firebase-functions/v2/https");

const {
  deriveInvitationEmailKey,
} = require("./invitation-key");

const INVITATION_LIFETIME_MS =
  30 * 24 * 60 * 60 * 1000;

const IDENTIFIER_PATTERN =
  /^[a-z0-9][a-z0-9-]{0,127}$/;

function requireIdentifier(value, label) {
  if (
    typeof value !== "string" ||
    !IDENTIFIER_PATTERN.test(value)
  ) {
    throw new HttpsError(
      "invalid-argument",
      `A valid ${label} is required.`,
    );
  }

  return value;
}

function requireAuthenticated(request) {
  if (!request?.auth?.uid) {
    throw new HttpsError(
      "unauthenticated",
      "Authentication is required.",
    );
  }

  return request.auth;
}

function timestampMillis(value) {
  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return Number.NaN;
}

function timestampJson(value) {
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
}

function createInvitationService({
  database,
  Timestamp,
  hmacSecret,
  now = () => Date.now(),
}) {
  if (
    !database ||
    typeof database.doc !== "function" ||
    typeof database.runTransaction !== "function" ||
    typeof database.collectionGroup !== "function"
  ) {
    throw new TypeError(
      "A valid Firestore database is required.",
    );
  }

  if (typeof Timestamp?.fromMillis !== "function") {
    throw new TypeError(
      "A valid Firestore Timestamp implementation is required.",
    );
  }

  function invitationKey(email) {
    return deriveInvitationEmailKey(
      hmacSecret(),
      email,
    );
  }

  async function createAdventureInvitation(
    request,
  ) {
    const auth = requireAuthenticated(request);

    if (auth.token?.adventureAdmin !== true) {
      throw new HttpsError(
        "permission-denied",
        "Adventure administrator access is required.",
      );
    }

    const adventureId = requireIdentifier(
      request.data?.adventureId,
      "adventureId",
    );

    const adventurerId = requireIdentifier(
      request.data?.adventurerId,
      "adventurerId",
    );

    let emailKey;

    try {
      emailKey = invitationKey(
        request.data?.email,
      );
    } catch (error) {
      throw new HttpsError(
        "invalid-argument",
        "A valid invitation email is required.",
      );
    }

    const adventureRef = database.doc(
      `adventures/${adventureId}`,
    );

    const inviterMembershipRef = database.doc(
      `adventures/${adventureId}/members/${auth.uid}`,
    );

    const invitationRef = database.doc(
      `adventures/${adventureId}/invitations/${emailKey}`,
    );

    const result = await database.runTransaction(
      async (transaction) => {
        const [
          adventureSnapshot,
          membershipSnapshot,
          invitationSnapshot,
        ] = await Promise.all([
          transaction.get(adventureRef),
          transaction.get(inviterMembershipRef),
          transaction.get(invitationRef),
        ]);

        const inviterMembership =
          membershipSnapshot.exists
            ? membershipSnapshot.data()
            : null;

        if (
          !inviterMembership ||
          inviterMembership.adventureId !==
            adventureId ||
          inviterMembership.firebaseUid !== auth.uid
        ) {
          throw new HttpsError(
            "permission-denied",
            "Target Adventure membership is required.",
          );
        }

        const adventure = adventureSnapshot.exists
          ? adventureSnapshot.data()
          : null;

        const participants = Array.isArray(
          adventure?.participants,
        )
          ? adventure.participants
          : [];

        if (
          !participants.some(
            (participant) =>
              participant?.adventurerId ===
              adventurerId,
          )
        ) {
          throw new HttpsError(
            "failed-precondition",
            "The Adventurer identity is not part of the target Adventure.",
          );
        }

        const existing = invitationSnapshot.exists
          ? invitationSnapshot.data()
          : null;

        if (
          existing &&
          existing.adventurerId !== adventurerId
        ) {
          throw new HttpsError(
            "already-exists",
            "An invitation already binds this account to another Adventurer identity.",
          );
        }

        if (existing?.status === "accepted") {
          throw new HttpsError(
            "already-exists",
            "This invitation has already been accepted.",
          );
        }

        const currentTime = now();
        const existingExpiresAt =
          timestampMillis(existing?.expiresAt);

        if (
          existing?.status === "pending" &&
          existingExpiresAt > currentTime
        ) {
          return existing;
        }

        const timestamp =
          Timestamp.fromMillis(currentTime);

        const invitation = {
          adventureId,
          emailKey,
          adventurerId,
          status: "pending",
          createdByUid: auth.uid,
          createdAt:
            existing?.createdAt ?? timestamp,
          updatedAt: timestamp,
          expiresAt: Timestamp.fromMillis(
            currentTime +
              INVITATION_LIFETIME_MS,
          ),
        };

        transaction.set(
          invitationRef,
          invitation,
        );

        return invitation;
      },
    );

    return {
      adventureId: result.adventureId,
      adventurerId: result.adventurerId,
      status: result.status,
      expiresAt:
        timestampJson(result.expiresAt),
    };
  }

  async function acceptPendingAdventureInvitations(
    request,
  ) {
    const auth = requireAuthenticated(request);
    const token = auth.token ?? {};
    const provider =
      token.firebase?.sign_in_provider;

    if (
      token.email_verified !== true ||
      typeof token.email !== "string"
    ) {
      throw new HttpsError(
        "failed-precondition",
        "A verified email identity is required.",
      );
    }

    if (provider !== "google.com") {
      throw new HttpsError(
        "permission-denied",
        "Google authentication is required.",
      );
    }

    let emailKey;

    try {
      emailKey = invitationKey(token.email);
    } catch (error) {
      throw new HttpsError(
        "failed-precondition",
        "A verified email identity is required.",
      );
    }

    const invitationQuery = database
      .collectionGroup("invitations")
      .where("emailKey", "==", emailKey);

    const matchingSnapshot =
      await invitationQuery.get();

    const invitationRefs = matchingSnapshot.docs
      .map((snapshot) => snapshot.ref);

    if (invitationRefs.length === 0) {
      return {
        accepted: [],
      };
    }

    const currentTime = now();
    const timestamp =
      Timestamp.fromMillis(currentTime);

    const accepted = await database.runTransaction(
      async (transaction) => {
        const invitationSnapshots =
          await Promise.all(
            invitationRefs.map(
              (invitationRef) =>
                transaction.get(invitationRef),
            ),
          );

        const candidates = [];

        invitationSnapshots.forEach((snapshot) => {
          const invitationRef = snapshot.ref;

          if (!snapshot.exists) {
            return;
          }

          const invitation = snapshot.data();
          const adventureRef =
            invitationRef.parent.parent;
          const adventureId =
            adventureRef?.id;

          if (
            !adventureId ||
            invitationRef.path !==
              `adventures/${adventureId}/invitations/${emailKey}` ||
            invitation.adventureId !== adventureId ||
            invitation.emailKey !== emailKey ||
            !IDENTIFIER_PATTERN.test(
              invitation.adventurerId ?? "",
            )
          ) {
            throw new HttpsError(
              "data-loss",
              "Invitation data is inconsistent.",
            );
          }

          if (invitation.status === "accepted") {
            if (
              invitation.acceptedByUid !== auth.uid
            ) {
              throw new HttpsError(
                "permission-denied",
                "The invitation is no longer available.",
              );
            }
          } else if (
            invitation.status !== "pending" ||
            timestampMillis(
              invitation.expiresAt,
            ) <= currentTime
          ) {
            return;
          }

          const membershipRef = database.doc(
            `adventures/${adventureId}/members/${auth.uid}`,
          );

          candidates.push({
            adventureId,
            invitation,
            invitationRef,
            membershipRef,
          });
        });

        const membershipSnapshots =
          await Promise.all(
            candidates.map(
              ({ membershipRef }) =>
                transaction.get(membershipRef),
            ),
          );

        const invitations = [];

        candidates.forEach(
          (
            {
              adventureId,
              invitation,
              invitationRef,
              membershipRef,
            },
            index,
          ) => {
            const membershipSnapshot =
              membershipSnapshots[index];

            const existingMembership =
              membershipSnapshot.exists
                ? membershipSnapshot.data()
                : null;

            if (
              existingMembership &&
              existingMembership.adventurerId !==
                invitation.adventurerId
            ) {
              throw new HttpsError(
                "already-exists",
                "Existing Adventure membership uses another Adventurer identity.",
              );
            }

            if (!existingMembership) {
              transaction.create(
                membershipRef,
                {
                  adventureId,
                  firebaseUid: auth.uid,
                  adventurerId:
                    invitation.adventurerId,
                  createdAt: timestamp,
                  updatedAt: timestamp,
                },
              );
            }

            if (invitation.status === "pending") {
              transaction.update(
                invitationRef,
                {
                  status: "accepted",
                  acceptedAt: timestamp,
                  acceptedByUid: auth.uid,
                  updatedAt: timestamp,
                },
              );
            }

            invitations.push({
              adventureId,
              adventurerId:
                invitation.adventurerId,
            });
          },
        );

        return invitations;
      },
    );

    if (accepted.length === 0) {
      throw new HttpsError(
        "failed-precondition",
        "No pending invitation is available.",
      );
    }

    return {
      accepted: accepted.sort(
        (left, right) =>
          left.adventureId.localeCompare(
            right.adventureId,
          ),
      ),
    };
  }

  return Object.freeze({
    createAdventureInvitation,
    acceptPendingAdventureInvitations,
  });
}

module.exports = Object.freeze({
  INVITATION_LIFETIME_MS,
  createInvitationService,
});
