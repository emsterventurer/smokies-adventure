"use strict";

const {
  initializeApp,
} = require("firebase-admin/app");

const {
  getFirestore,
  Timestamp,
} = require("firebase-admin/firestore");

const {
  onCall,
} = require("firebase-functions/v2/https");

const {
  defineSecret,
} = require("firebase-functions/params");

const {
  createInvitationService,
} = require("./src/invitation-service");

const {
  createAccessService,
} = require("./src/access-service");

initializeApp();

const database = getFirestore();

const invitationHmacKey = defineSecret(
  "ADVENTURE_INVITATION_HMAC_KEY",
);

const invitationService =
  createInvitationService({
    database,
    Timestamp,
    hmacSecret: () =>
      invitationHmacKey.value(),
  });

const accessService = createAccessService({
  database,
});

const callableOptions = Object.freeze({
  region: "us-central1",
  enforceAppCheck: false,
});

exports.createAdventureInvitation = onCall(
  {
    ...callableOptions,
    secrets: [invitationHmacKey],
  },
  (request) =>
    invitationService
      .createAdventureInvitation(request),
);

exports.acceptPendingAdventureInvitations =
  onCall(
    {
      ...callableOptions,
      secrets: [invitationHmacKey],
    },
    (request) =>
      invitationService
        .acceptPendingAdventureInvitations(
          request,
        ),
  );

exports.listMyAdventureAccess = onCall(
  callableOptions,
  (request) =>
    accessService.listMyAdventureAccess(
      request,
    ),
);
