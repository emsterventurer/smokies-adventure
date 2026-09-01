"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  initializeApp: initializeAdminApp,
  deleteApp: deleteAdminApp,
} = require("firebase-admin/app");

const {
  getAuth: getAdminAuth,
} = require("firebase-admin/auth");

const {
  assertFails,
  initializeTestEnvironment,
} = require("@firebase/rules-unit-testing");

const {
  initializeApp,
  deleteApp,
} = require("firebase/app");

const {
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
} = require("firebase/auth");

const {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} = require("firebase/functions");

const {
  deriveInvitationEmailKey,
} = require("../src/invitation-key");

const PROJECT_ID =
  "demo-adventure-companion";

function requireEmulatorEnvironment() {
  assert.ok(
    process.env.FIREBASE_EMULATOR_HUB,
    "Firebase Emulator Hub is required.",
  );
  assert.ok(
    process.env.FIRESTORE_EMULATOR_HOST,
    "Firestore emulator is required.",
  );
  assert.ok(
    process.env.FIREBASE_AUTH_EMULATOR_HOST,
    "Auth emulator is required.",
  );
}

test(
  "ordinary clients cannot access invitations or write memberships",
  async () => {
    requireEmulatorEnvironment();
    const environment =
      await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
          rules: fs.readFileSync(
            path.resolve(
              __dirname,
              "../../firestore.rules",
            ),
            "utf8",
          ),
        },
      });

    try {
      const database = environment
        .authenticatedContext(
          "traveler-emulator-uid",
        )
        .firestore();

      const {
        doc,
        getDoc,
        setDoc,
      } = require("firebase/firestore");

      await assertFails(
        getDoc(
          doc(
            database,
            "adventures/test-adventure/invitations/test-key",
          ),
        ),
      );

      await assertFails(
        setDoc(
          doc(
            database,
            "adventures/test-adventure/invitations/test-key",
          ),
          { status: "pending" },
        ),
      );

      await assertFails(
        setDoc(
          doc(
            database,
            "adventures/test-adventure/members/traveler-emulator-uid",
          ),
          {
            adventureId: "test-adventure",
            firebaseUid:
              "traveler-emulator-uid",
            adventurerId: "traveler",
          },
        ),
      );
    } finally {
      await environment.cleanup();
    }
  },
);

test(
  "Auth and Functions emulators return only the signed-in UID access",
  async () => {
    requireEmulatorEnvironment();
    const app = initializeApp(
      {
        apiKey: "demo-key",
        projectId: PROJECT_ID,
      },
      "invitation-foundation-emulator-test",
    );

    const auth = getAuth(app);
    connectAuthEmulator(
      auth,
      "http://127.0.0.1:9099",
      { disableWarnings: true },
    );

    const userCredential =
      await signInAnonymously(auth);

    const environment =
      await initializeTestEnvironment({
        projectId: PROJECT_ID,
      });

    try {
      await environment.withSecurityRulesDisabled(
        async (context) => {
          const {
            doc,
            setDoc,
          } = require("firebase/firestore");

          await setDoc(
            doc(
              context.firestore(),
              `adventures/test-adventure/members/${userCredential.user.uid}`,
            ),
            {
              adventureId: "test-adventure",
              firebaseUid:
                userCredential.user.uid,
              adventurerId: "traveler",
            },
          );
        },
      );

      const functions = getFunctions(
        app,
        "us-central1",
      );
      connectFunctionsEmulator(
        functions,
        "127.0.0.1",
        5001,
      );

      const response = await httpsCallable(
        functions,
        "listMyAdventureAccess",
      )({});

      assert.deepEqual(response.data, {
        adventures: [
          {
            adventureId: "test-adventure",
            adventurerId: "traveler",
          },
        ],
      });

      await assert.rejects(
        httpsCallable(
          functions,
          "createAdventureInvitation",
        )({
          adventureId: "test-adventure",
          adventurerId: "traveler",
          email: "traveler@example.com",
        }),
        { code: "functions/permission-denied" },
      );

      await assert.rejects(
        httpsCallable(
          functions,
          "acceptPendingAdventureInvitations",
        )({}),
        { code: "functions/failed-precondition" },
      );
    } finally {
      await environment.cleanup();
      await deleteApp(app);
    }
  },
);

test(
  "authorized admin creates an HMAC-addressed invitation through the Functions emulator",
  async () => {
    requireEmulatorEnvironment();

    const secret =
      process.env.ADVENTURE_INVITATION_HMAC_KEY;
    assert.equal(typeof secret, "string");
    assert.ok(secret.length >= 32);

    const app = initializeApp(
      {
        apiKey: "demo-key",
        projectId: PROJECT_ID,
      },
      "invitation-creation-emulator-test",
    );
    const adminApp = initializeAdminApp(
      { projectId: PROJECT_ID },
      "invitation-creation-emulator-admin",
    );
    const auth = getAuth(app);
    connectAuthEmulator(
      auth,
      "http://127.0.0.1:9099",
      { disableWarnings: true },
    );

    const adminUid = "admin-emulator-uid";
    const adminEmail = "admin@example.com";
    const inviteeEmail =
      "  Traveler.Invitee@Example.com  ";
    const adventureId = "test-adventure";
    const adventurerId = "invited-traveler";
    const environment =
      await initializeTestEnvironment({
        projectId: PROJECT_ID,
      });

    try {
      const adminAuth = getAdminAuth(adminApp);
      await adminAuth.createUser({
        uid: adminUid,
        email: adminEmail,
        emailVerified: true,
        password: "synthetic-emulator-password",
      });
      await adminAuth.setCustomUserClaims(
        adminUid,
        { adventureAdmin: true },
      );

      await environment.withSecurityRulesDisabled(
        async (context) => {
          const {
            doc,
            setDoc,
          } = require("firebase/firestore");

          await setDoc(
            doc(
              context.firestore(),
              `adventures/${adventureId}`,
            ),
            {
              id: adventureId,
              participants: [
                { adventurerId },
              ],
            },
          );
          await setDoc(
            doc(
              context.firestore(),
              `adventures/${adventureId}/members/${adminUid}`,
            ),
            {
              adventureId,
              firebaseUid: adminUid,
              adventurerId: "admin-traveler",
            },
          );
        },
      );

      await signInWithEmailAndPassword(
        auth,
        adminEmail,
        "synthetic-emulator-password",
      );

      const functions = getFunctions(
        app,
        "us-central1",
      );
      connectFunctionsEmulator(
        functions,
        "127.0.0.1",
        5001,
      );

      const response = await httpsCallable(
        functions,
        "createAdventureInvitation",
      )({
        adventureId,
        adventurerId,
        email: inviteeEmail,
      });

      assert.equal(response.data.adventureId, adventureId);
      assert.equal(response.data.adventurerId, adventurerId);
      assert.equal(response.data.status, "pending");
      assert.equal(typeof response.data.expiresAt, "string");
      assert.equal(
        JSON.stringify(response.data).includes(
          inviteeEmail.trim().toLowerCase(),
        ),
        false,
      );

      const emailKey = deriveInvitationEmailKey(
        secret,
        inviteeEmail,
      );

      await environment.withSecurityRulesDisabled(
        async (context) => {
          const {
            doc,
            getDoc,
          } = require("firebase/firestore");
          const invitationSnapshot = await getDoc(
            doc(
              context.firestore(),
              `adventures/${adventureId}/invitations/${emailKey}`,
            ),
          );

          assert.equal(invitationSnapshot.exists(), true);
          const invitation = invitationSnapshot.data();
          assert.equal(invitation.status, "pending");
          assert.equal(invitation.adventurerId, adventurerId);
          assert.equal(invitation.emailKey, emailKey);
          assert.equal(
            typeof invitation.expiresAt?.toMillis,
            "function",
          );
          assert.equal(
            Object.prototype.hasOwnProperty.call(
              invitation,
              "email",
            ),
            false,
          );
          assert.equal(
            JSON.stringify(invitation).includes(
              inviteeEmail.trim().toLowerCase(),
            ),
            false,
          );
        },
      );
    } finally {
      await environment.cleanup();
      await deleteApp(app);
      await deleteAdminApp(adminApp);
    }
  },
);
