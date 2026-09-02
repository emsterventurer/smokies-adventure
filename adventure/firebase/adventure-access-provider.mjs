import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-functions.js";

import {
  getIdTokenResult,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
  app,
  auth,
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

const createInvitationCallable = httpsCallable(
  functions,
  "createAdventureInvitation",
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

async function hasAdventureAdminClaim() {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  const tokenResult = await getIdTokenResult(
    user,
    true,
  );

  return tokenResult.claims?.adventureAdmin === true;
}

async function createAdventureInvitation(input) {
  const result = await createInvitationCallable({
    adventureId: input?.adventureId,
    adventurerId: input?.adventurerId,
    email: input?.email,
  });

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
  hasAdventureAdminClaim,
  createAdventureInvitation,
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
