import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-functions.js";

import {
  app,
} from "./firebase-client.mjs";

const functions = getFunctions(app, "us-central1");

const acceptInvitationsCallable = httpsCallable(
  functions,
  "acceptPendingAdventureInvitations",
);

const listAccessCallable = httpsCallable(
  functions,
  "listMyAdventureAccess",
);

async function acceptPendingAdventureInvitations() {
  const result = await acceptInvitationsCallable();

  return {
    accepted: Array.isArray(result.data?.accepted)
      ? result.data.accepted
      : [],
  };
}

async function listMyAdventureAccess() {
  const result = await listAccessCallable();

  return result.data;
}

const accessClient = globalThis.AdventureAccess
  .createAdventureAccessClient({
    acceptPendingInvitations:
      acceptPendingAdventureInvitations,
    listAccess: listMyAdventureAccess,
  });

const AdventureAccessProvider = Object.freeze({
  acceptPendingAdventureInvitations,
  listMyAdventureAccess,
  resolveCurrentAdventureAccess:
    accessClient.resolveCurrentAdventureAccess,
});

globalThis.AdventureAccessProvider =
  AdventureAccessProvider;

globalThis.dispatchEvent(
  new CustomEvent(
    "adventure:access-provider-ready",
    {
      detail: {
        provider: AdventureAccessProvider,
      },
    },
  ),
);

export {
  AdventureAccessProvider,
};
