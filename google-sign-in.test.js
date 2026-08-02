const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync(
  "index.html",
  "utf8",
);

const app = fs.readFileSync(
  "app.js",
  "utf8",
);

const firebaseClient = fs.readFileSync(
  "adventure/firebase/firebase-client.mjs",
  "utf8",
);

assert(
  html.includes(
    'id="googleSignIn"',
  ),
  "Welcome screen should include the Google Sign-In button",
);

assert(
  firebaseClient.includes(
    "GoogleAuthProvider",
  ),
  "Firebase client should load GoogleAuthProvider",
);

assert(
  firebaseClient.includes(
    "signInWithPopup",
  ),
  "Firebase client should use popup-based Google Sign-In",
);

assert(
  firebaseClient.includes(
    "function signInWithGoogle()",
  ),
  "Firebase client should expose a Google Sign-In function",
);

assert(
  firebaseClient.includes(
    "signInWithGoogle,",
  ),
  "Firebase runtime should expose Google Sign-In to the app",
);

assert(
  app.includes(
    "googleSignInButton",
  ) &&
    app.includes(
      '$("#googleSignIn")',
    ),
  "Welcome setup should load the Google Sign-In button",
);

assert(
  app.includes(
    "await firebase.signInWithGoogle()",
  ),
  "Google Sign-In button should call the Firebase sign-in function",
);
assert(
  app.includes(
    "button.disabled =",
  ) &&
    app.includes(
      "!isGoogleSignedIn;",
    ),
  "Family identity choices should stay disabled until Google sign-in succeeds",
);

assert(
  app.includes(
    "enterButton.disabled =",
  ) &&
    app.includes(
      "!isGoogleSignedIn ||",
    ) &&
    app.includes(
      "!selectedAdventurerId;",
    ),
  "Adventure entry should require both Google sign-in and identity selection",
);

assert(
  app.includes(
    '"Sign in with Google to continue"',
  ),
  "Welcome flow should clearly prompt for Google sign-in first",
);

assert(
  app.includes(
    "googleUser = user;",
  ) &&
    app.includes(
      "updateSelection();",
    ),
  "Successful Google sign-in should refresh the welcome state",
);
assert(
  firebaseClient.includes(
    "onAuthStateChanged(",
  ),
  "Firebase startup should wait for authentication state restoration",
);

assert(
  firebaseClient.includes(
    "unsubscribe();",
  ) &&
    firebaseClient.includes(
      "resolve(user);",
    ),
  "Firebase startup should resolve the restored user exactly once",
);

assert(
  !firebaseClient.includes(
    "const currentUser =\n  auth.currentUser;",
  ),
  "Firebase startup should not trust auth.currentUser before restoration completes",
);
console.log(
  "Google sign-in tests passed.",
);
