"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  deriveInvitationEmailKey,
} = require("../src/invitation-key");

const {
  INVITATION_LIFETIME_MS,
  createInvitationService,
} = require("../src/invitation-service");

const {
  FakeFirestore,
  FakeTimestamp,
} = require("./fake-firestore");

const TEST_SECRET =
  "synthetic-test-secret-with-at-least-32-bytes";
const NOW = Date.parse("2026-09-01T12:00:00Z");
const ADVENTURE_ID = "test-adventure";
const ADMIN_UID = "admin-test-uid";
const TRAVELER_UID = "traveler-test-uid";

function request({
  uid = ADMIN_UID,
  admin = true,
  data = {},
  email = "traveler@example.com",
  emailVerified = true,
  provider = "google.com",
} = {}) {
  return {
    auth:
      uid === null
        ? null
        : {
            uid,
            token: {
              adventureAdmin: admin,
              email,
              email_verified: emailVerified,
              firebase: {
                sign_in_provider: provider,
              },
            },
          },
    data,
  };
}

function createFixture(extraDocuments = {}) {
  const database = new FakeFirestore({
    [`adventures/${ADVENTURE_ID}`]: {
      id: ADVENTURE_ID,
      participants: [
        {
          adventurerId: "traveler",
          role: "traveler",
        },
        {
          adventurerId: "another",
          role: "traveler",
        },
      ],
    },
    [`adventures/${ADVENTURE_ID}/members/${ADMIN_UID}`]: {
      adventureId: ADVENTURE_ID,
      firebaseUid: ADMIN_UID,
      adventurerId: "admin",
    },
    ...extraDocuments,
  });

  return {
    database,
    service: createInvitationService({
      database,
      Timestamp: FakeTimestamp,
      hmacSecret: () => TEST_SECRET,
      now: () => NOW,
    }),
  };
}

function invitationPath(
  email = "traveler@example.com",
) {
  const key = deriveInvitationEmailKey(
    TEST_SECRET,
    email,
  );

  return `adventures/${ADVENTURE_ID}/invitations/${key}`;
}

function createRequest(overrides = {}) {
  return request({
    ...overrides,
    data: {
      adventureId: ADVENTURE_ID,
      adventurerId: "traveler",
      email: "traveler@example.com",
      ...overrides.data,
    },
  });
}

test("rejects unauthenticated, non-admin, and non-member invitation creation", async () => {
  const { service } = createFixture();

  await assert.rejects(
    service.createAdventureInvitation(
      createRequest({ uid: null }),
    ),
    { code: "unauthenticated" },
  );

  await assert.rejects(
    service.createAdventureInvitation(
      createRequest({ admin: false }),
    ),
    { code: "permission-denied" },
  );

  const noMembership = createFixture({
    [`adventures/${ADVENTURE_ID}/members/${ADMIN_UID}`]:
      undefined,
  });

  await assert.rejects(
    noMembership.service
      .createAdventureInvitation(
        createRequest(),
      ),
    { code: "permission-denied" },
  );
});

test("validates the target Adventure and canonical Adventurer identity", async () => {
  const { service } = createFixture();

  await assert.rejects(
    service.createAdventureInvitation(
      createRequest({
        data: { adventureId: "Unsafe ID" },
      }),
    ),
    { code: "invalid-argument" },
  );

  await assert.rejects(
    service.createAdventureInvitation(
      createRequest({
        data: { adventurerId: "unknown" },
      }),
    ),
    { code: "failed-precondition" },
  );
});

test("creates a sanitized 30-day invitation without storing raw email", async () => {
  const { database, service } = createFixture();

  const response =
    await service.createAdventureInvitation(
      createRequest(),
    );

  const stored = database.get(
    invitationPath(),
  );

  assert.deepEqual(response, {
    adventureId: ADVENTURE_ID,
    adventurerId: "traveler",
    status: "pending",
    expiresAt: "2026-10-01T12:00:00.000Z",
  });
  assert.equal(
    stored.expiresAt.toMillis() -
      stored.createdAt.toMillis(),
    INVITATION_LIFETIME_MS,
  );
  assert.equal("email" in stored, false);
  assert.doesNotMatch(
    JSON.stringify({ response, stored }),
    /traveler@example\.com/i,
  );
});

test("repeat invitation creation is idempotent and identity conflicts fail", async () => {
  const { database, service } = createFixture();

  const first =
    await service.createAdventureInvitation(
      createRequest(),
    );
  const writesAfterFirst = database.writeCount;
  const repeated =
    await service.createAdventureInvitation(
      createRequest(),
    );

  assert.deepEqual(repeated, first);
  assert.equal(
    database.writeCount,
    writesAfterFirst,
  );

  await assert.rejects(
    service.createAdventureInvitation(
      createRequest({
        data: { adventurerId: "another" },
      }),
    ),
    { code: "already-exists" },
  );
});

test("acceptance requires verified Google authentication and ignores client email", async () => {
  const { service } = createFixture();
  await service.createAdventureInvitation(
    createRequest(),
  );

  await assert.rejects(
    service.acceptPendingAdventureInvitations(
      request({ uid: null }),
    ),
    { code: "unauthenticated" },
  );
  await assert.rejects(
    service.acceptPendingAdventureInvitations(
      request({
        uid: TRAVELER_UID,
        emailVerified: false,
      }),
    ),
    { code: "failed-precondition" },
  );
  await assert.rejects(
    service.acceptPendingAdventureInvitations(
      request({
        uid: TRAVELER_UID,
        provider: "password",
      }),
    ),
    { code: "permission-denied" },
  );

  const accepted =
    await service.acceptPendingAdventureInvitations(
      request({
        uid: TRAVELER_UID,
        data: {
          email: "spoofed@example.com",
        },
      }),
    );

  assert.deepEqual(accepted, {
    accepted: [
      {
        adventureId: ADVENTURE_ID,
        adventurerId: "traveler",
      },
    ],
  });
});

test("acceptance creates UID membership and marks the invitation accepted transactionally", async () => {
  const { database, service } = createFixture();
  await service.createAdventureInvitation(
    createRequest(),
  );

  await service.acceptPendingAdventureInvitations(
    request({ uid: TRAVELER_UID }),
  );

  assert.deepEqual(
    database.get(
      `adventures/${ADVENTURE_ID}/members/${TRAVELER_UID}`,
    ),
    {
      adventureId: ADVENTURE_ID,
      firebaseUid: TRAVELER_UID,
      adventurerId: "traveler",
      createdAt: FakeTimestamp.fromMillis(NOW),
      updatedAt: FakeTimestamp.fromMillis(NOW),
    },
  );

  assert.deepEqual(
    {
      ...database.get(invitationPath()),
      emailKey: "redacted-for-test",
    },
    {
      adventureId: ADVENTURE_ID,
      emailKey: "redacted-for-test",
      adventurerId: "traveler",
      status: "accepted",
      createdByUid: ADMIN_UID,
      createdAt: FakeTimestamp.fromMillis(NOW),
      updatedAt: FakeTimestamp.fromMillis(NOW),
      expiresAt: FakeTimestamp.fromMillis(
        NOW + INVITATION_LIFETIME_MS,
      ),
      acceptedAt: FakeTimestamp.fromMillis(NOW),
      acceptedByUid: TRAVELER_UID,
    },
  );
});

test("repeat acceptance is idempotent", async () => {
  const { database, service } = createFixture();
  await service.createAdventureInvitation(
    createRequest(),
  );
  const first =
    await service.acceptPendingAdventureInvitations(
      request({ uid: TRAVELER_UID }),
    );
  const writesAfterFirst = database.writeCount;
  const repeated =
    await service.acceptPendingAdventureInvitations(
      request({ uid: TRAVELER_UID }),
    );

  assert.deepEqual(repeated, first);
  assert.equal(
    database.writeCount,
    writesAfterFirst,
  );
});

test("expired invitations are not accepted", async () => {
  const expiredAt = FakeTimestamp.fromMillis(
    NOW - 1,
  );
  const path = invitationPath();
  const { database, service } = createFixture({
    [path]: {
      adventureId: ADVENTURE_ID,
      emailKey: path.split("/").at(-1),
      adventurerId: "traveler",
      status: "pending",
      expiresAt: expiredAt,
    },
  });

  await assert.rejects(
    service.acceptPendingAdventureInvitations(
      request({ uid: TRAVELER_UID }),
    ),
    { code: "failed-precondition" },
  );
  assert.equal(
    database.get(
      `adventures/${ADVENTURE_ID}/members/${TRAVELER_UID}`,
    ),
    undefined,
  );
  assert.equal(
    database.get(path).status,
    "pending",
  );
});

test("conflicting membership identity fails without accepting the invitation", async () => {
  const { database, service } = createFixture({
    [`adventures/${ADVENTURE_ID}/members/${TRAVELER_UID}`]: {
      adventureId: ADVENTURE_ID,
      firebaseUid: TRAVELER_UID,
      adventurerId: "another",
    },
  });
  await service.createAdventureInvitation(
    createRequest(),
  );

  await assert.rejects(
    service.acceptPendingAdventureInvitations(
      request({ uid: TRAVELER_UID }),
    ),
    { code: "already-exists" },
  );

  assert.equal(
    database.get(invitationPath()).status,
    "pending",
  );
  assert.equal(
    database.get(
      `adventures/${ADVENTURE_ID}/members/${TRAVELER_UID}`,
    ).adventurerId,
    "another",
  );
});

test("matching one email cannot accept another email invitation", async () => {
  const otherPath = invitationPath(
    "other-traveler@example.com",
  );
  const { database, service } = createFixture({
    [otherPath]: {
      adventureId: ADVENTURE_ID,
      emailKey: otherPath.split("/").at(-1),
      adventurerId: "traveler",
      status: "pending",
      expiresAt: FakeTimestamp.fromMillis(
        NOW + INVITATION_LIFETIME_MS,
      ),
    },
  });
  await service.createAdventureInvitation(
    createRequest(),
  );

  const response =
    await service.acceptPendingAdventureInvitations(
      request({ uid: TRAVELER_UID }),
    );

  assert.equal(response.accepted.length, 1);
  assert.equal(
    database.get(otherPath).status,
    "pending",
  );
});

test("one authenticated email accepts matching Adventure invitations without cross-Adventure leakage", async () => {
  const secondAdventureId = "second-adventure";
  const { database, service } = createFixture({
    [`adventures/${secondAdventureId}`]: {
      id: secondAdventureId,
      participants: [
        { adventurerId: "traveler" },
      ],
    },
    [`adventures/${secondAdventureId}/members/${ADMIN_UID}`]: {
      adventureId: secondAdventureId,
      firebaseUid: ADMIN_UID,
      adventurerId: "admin",
    },
  });

  await service.createAdventureInvitation(
    createRequest(),
  );
  await service.createAdventureInvitation(
    createRequest({
      data: {
        adventureId: secondAdventureId,
      },
    }),
  );

  const response =
    await service.acceptPendingAdventureInvitations(
      request({ uid: TRAVELER_UID }),
    );

  assert.deepEqual(response.accepted, [
    {
      adventureId: secondAdventureId,
      adventurerId: "traveler",
    },
    {
      adventureId: ADVENTURE_ID,
      adventurerId: "traveler",
    },
  ]);
  assert.equal(
    database.get(
      `adventures/${secondAdventureId}/members/${TRAVELER_UID}`,
    ).adventurerId,
    "traveler",
  );
});
