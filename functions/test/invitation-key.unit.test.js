"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  INVITATION_KEY_DOMAIN,
  normalizeInvitationEmail,
  deriveInvitationEmailKey,
} = require("../src/invitation-key");

const TEST_SECRET =
  "synthetic-test-secret-with-at-least-32-bytes";

test("normalizes invitation email with trim and lowercase only", () => {
  assert.equal(
    normalizeInvitationEmail(
      "  Traveler+Trip@Example.com  ",
    ),
    "traveler+trip@example.com",
  );
});

test("derives a deterministic versioned HMAC key", () => {
  const first = deriveInvitationEmailKey(
    TEST_SECRET,
    "traveler@example.com",
  );
  const repeated = deriveInvitationEmailKey(
    TEST_SECRET,
    " TRAVELER@example.com ",
  );

  assert.equal(first, repeated);
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(
    INVITATION_KEY_DOMAIN,
    "adventure-invitation:v1\0",
  );
});

test("different emails produce different keys", () => {
  assert.notEqual(
    deriveInvitationEmailKey(
      TEST_SECRET,
      "traveler-a@example.com",
    ),
    deriveInvitationEmailKey(
      TEST_SECRET,
      "traveler-b@example.com",
    ),
  );
});

test("rejects invalid emails and short secrets", () => {
  assert.throws(
    () => normalizeInvitationEmail("not-an-email"),
    TypeError,
  );
  assert.throws(
    () =>
      deriveInvitationEmailKey(
        "short",
        "traveler@example.com",
      ),
    TypeError,
  );
});
