"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createAccessService,
} = require("../src/access-service");

const {
  FakeFirestore,
} = require("./fake-firestore");

test("listMyAdventureAccess requires authentication", async () => {
  const service = createAccessService({
    database: new FakeFirestore(),
  });

  await assert.rejects(
    service.listMyAdventureAccess({}),
    { code: "unauthenticated" },
  );
});

test("returns only valid memberships for the authenticated UID", async () => {
  const uid = "traveler-test-uid";
  const database = new FakeFirestore({
    [`adventures/adventure-b/members/${uid}`]: {
      adventureId: "adventure-b",
      firebaseUid: uid,
      adventurerId: "traveler",
    },
    [`adventures/adventure-a/members/${uid}`]: {
      adventureId: "adventure-a",
      firebaseUid: uid,
      adventurerId: "traveler",
    },
    "adventures/other/members/other-uid": {
      adventureId: "other",
      firebaseUid: "other-uid",
      adventurerId: "other",
    },
    "adventures/malformed/members/wrong-id": {
      adventureId: "malformed",
      firebaseUid: uid,
      adventurerId: "traveler",
    },
  });

  const service = createAccessService({
    database,
  });

  assert.deepEqual(
    await service.listMyAdventureAccess({
      auth: {
        uid,
        token: { adventureAdmin: true },
      },
    }),
    {
      adventures: [
        {
          adventureId: "adventure-a",
          adventurerId: "traveler",
        },
        {
          adventureId: "adventure-b",
          adventurerId: "traveler",
        },
      ],
    },
  );
});

test("admin claim alone grants no Adventure access", async () => {
  const service = createAccessService({
    database: new FakeFirestore(),
  });

  assert.deepEqual(
    await service.listMyAdventureAccess({
      auth: {
        uid: "admin-without-membership",
        token: { adventureAdmin: true },
      },
    }),
    { adventures: [] },
  );
});
