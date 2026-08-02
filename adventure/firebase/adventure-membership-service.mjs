import {
  FirebaseMembershipProvider,
} from "./firebase-membership-provider.mjs";

import {
  auth,
} from "./firebase-client.mjs";

async function isCurrentUserMember(
  adventureId,
) {
  const user =
    auth.currentUser;

  if (
    !user ||
    user.isAnonymous
  ) {
    return false;
  }

  return FirebaseMembershipProvider.hasMembership(
    adventureId,
    user.uid,
  );
}

const AdventureMembershipService =
  Object.freeze({
    isCurrentUserMember,
  });

globalThis.AdventureMembershipService =
  AdventureMembershipService;

globalThis.dispatchEvent(
  new CustomEvent(
    "adventure:membership-service-ready",
    {
      detail: {
        service:
          AdventureMembershipService,
      },
    },
  ),
);

export {
  AdventureMembershipService,
};
