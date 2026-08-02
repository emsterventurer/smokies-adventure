const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync(
  "index.html",
  "utf8",
);

const provider = fs.readFileSync(
  "adventure/firebase/firebase-membership-provider.mjs",
  "utf8",
);

assert(
  html.includes(
    'src="adventure/firebase/firebase-membership-provider.mjs"',
  ),
  "Firebase membership provider should load in the browser",
);

assert(
  html.indexOf(
    'src="adventure/firebase/firebase-provider.mjs"',
  ) <
    html.indexOf(
      'src="adventure/firebase/firebase-membership-provider.mjs"',
    ),
  "Firebase Adventure provider should load before membership provider",
);

assert(
  provider.includes(
    "MEMBERS_COLLECTION",
  ) &&
    provider.includes(
      '"members"',
    ),
  "Memberships should use an Adventure members subcollection",
);

assert(
  provider.includes(
    "saveMembership",
  ),
  "Membership provider should save memberships",
);

assert(
  provider.includes(
    "loadMembership",
  ),
  "Membership provider should load memberships",
);

assert(
  provider.includes(
    "hasMembership",
  ),
  "Membership provider should check membership",
);

assert(
  provider.includes(
    "listMemberships",
  ),
  "Membership provider should list Adventure memberships",
);

assert(
  provider.includes(
    "deleteMembership",
  ),
  "Membership provider should delete memberships",
);

assert(
  provider.includes(
    "firebaseUid",
  ),
  "Membership records should bind Firebase users to Adventures",
);

assert(
  provider.includes(
    "adventurerId",
  ),
  "Membership records should bind Firebase users to adventurer identities",
);

assert(
  !provider.includes(
    "email:",
  ),
  "Membership records should not store family email addresses",
);

console.log(
  "Firebase membership provider tests passed.",
);
