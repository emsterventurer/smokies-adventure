"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const provider = fs.readFileSync(
  "adventure/firebase/adventure-access-provider.mjs",
  "utf8",
);

test("loads the access foundation before the Firebase access provider and sync startup", () => {
  const accessScript =
    'src="adventure/adventure-access.js"';
  const providerScript =
    'src="adventure/firebase/adventure-access-provider.mjs"';
  const syncScript =
    'src="adventure/firebase/adventure-sync-startup.mjs"';

  assert.ok(html.indexOf(accessScript) >= 0);
  assert.ok(
    html.indexOf(accessScript) <
      html.indexOf(providerScript),
  );
  assert.ok(
    html.indexOf(providerScript) <
      html.indexOf(syncScript),
  );
});

test("uses the existing Firebase SDK and us-central1 callable names", () => {
  assert.match(
    provider,
    /firebasejs\/12\.17\.0\/firebase-functions\.js/,
  );
  assert.match(
    provider,
    /getFunctions\(app, "us-central1"\)/,
  );
  assert.match(provider, /acceptPendingAdventureInvitations/);
  assert.match(provider, /listMyAdventureAccess/);
});

test("invitation acceptance exposes no email input", () => {
  const start = provider.indexOf(
    "async function acceptPendingAdventureInvitations()",
  );
  const end = provider.indexOf(
    "async function listMyAdventureAccess()",
    start,
  );
  const acceptance = provider.slice(start, end);

  assert.notEqual(start, -1);
  assert.doesNotMatch(acceptance, /email/i);
  assert.match(acceptance, /acceptInvitationsCallable\(\)/);
});
