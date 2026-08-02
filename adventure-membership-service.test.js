const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync(
  "index.html",
  "utf8",
);

const service = fs.readFileSync(
  "adventure/firebase/adventure-membership-service.mjs",
  "utf8",
);

assert(
  html.includes(
    'src="adventure/firebase/adventure-membership-service.mjs"',
  ),
  "Adventure Membership Service should load in the browser",
);

assert(
  html.indexOf(
    'src="adventure/firebase/firebase-membership-provider.mjs"',
  ) <
    html.indexOf(
      'src="adventure/firebase/adventure-membership-service.mjs"',
    ),
  "Membership provider should load before Membership Service",
);

assert(
  service.includes(
    "isCurrentUserMember",
  ),
  "Membership Service should check the current user",
);

assert(
  service.includes(
    "auth.currentUser",
  ),
  "Membership Service should use the current Firebase user",
);

assert(
  service.includes(
    "user.isAnonymous",
  ),
  "Anonymous users should not qualify as Adventure members",
);

assert(
  service.includes(
    "FirebaseMembershipProvider.hasMembership",
  ),
  "Membership Service should delegate membership lookup to the provider",
);

assert(
  service.includes(
    "globalThis.AdventureMembershipService",
  ),
  "Membership Service should be available to the app",
);
const app = fs.readFileSync(
  "app.js",
  "utf8",
);

assert(
  app.includes(
    "globalThis.AdventureMembershipService",
  ),
  "Welcome flow should use the Adventure Membership Service",
);

assert(
  app.includes(
    ".isCurrentUserMember(",
  ) &&
    app.includes(
      '"smokies-2026"',
    ),
  "Welcome flow should verify membership for the Smokies Adventure",
);

assert(
  app.includes(
    '"This adventure is private. Your Google account has not been approved yet."',
  ),
  "Unapproved Google users should receive a private Adventure message",
);

assert(
  app.includes(
    "if (!isMember)",
  ),
  "Welcome flow should block users without Adventure membership",
);

assert(
  app.includes(
    "async function setupWelcome()",
  ),
  "Welcome setup should support restored-session membership checks",
);

assert(
  app.includes(
    "const restoredGoogleUser =",
  ),
  "Welcome setup should inspect the restored Firebase user",
);

assert(
  app.includes(
    "modal.hidden = false;",
  ),
  "Welcome should remain visible until restored membership is verified",
);

assert(
  app.includes(
    "if (isMember) {",
  ) &&
    app.includes(
      "googleUser =",
    ) &&
    app.includes(
      "restoredGoogleUser;",
    ),
  "Only restored approved members should unlock the welcome flow",
);
console.log(
  "Adventure membership service tests passed.",
);
