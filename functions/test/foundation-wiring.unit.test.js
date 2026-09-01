"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const index = fs.readFileSync(
  "index.js",
  "utf8",
);

const firebase = JSON.parse(
  fs.readFileSync(
    "../firebase.json",
    "utf8",
  ),
);

test("uses second-generation Node 22 callable Functions in us-central1", () => {
  assert.equal(
    firebase.functions.runtime,
    "nodejs22",
  );
  assert.match(
    index,
    /firebase-functions\/v2\/https/,
  );
  assert.match(index, /region: "us-central1"/);
});

test("binds the HMAC secret only to invitation callables", () => {
  assert.match(
    index,
    /defineSecret\(\s*"ADVENTURE_INVITATION_HMAC_KEY"/,
  );
  assert.match(
    index,
    /createAdventureInvitation[\s\S]*secrets: \[invitationHmacKey\]/,
  );
  assert.match(
    index,
    /acceptPendingAdventureInvitations[\s\S]*secrets: \[invitationHmacKey\]/,
  );
  assert.doesNotMatch(
    index.slice(
      index.indexOf(
        "exports.listMyAdventureAccess",
      ),
    ),
    /secrets:/,
  );
});

test("keeps App Check unenforced for the dark foundation", () => {
  assert.match(
    index,
    /enforceAppCheck: false/,
  );
});
