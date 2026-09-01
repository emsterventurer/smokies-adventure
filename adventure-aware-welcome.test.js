"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

const enabledStart = app.indexOf(
  "async function setupAdventureAwareWelcome",
);
const enabledEnd = app.indexOf(
  "async function setupWelcome()",
  enabledStart,
);
const enabledFlow = app.slice(enabledStart, enabledEnd);

test("fresh and restored Google sessions use the same trusted authorization sequence", () => {
  assert.match(
    enabledFlow,
    /await firebase\.signInWithGoogle\(\)[\s\S]*await authorizeUser\(user\)/,
  );
  assert.match(
    enabledFlow,
    /restoredGoogleUser[\s\S]*await authorizeUser\([\s\S]*restoredGoogleUser/,
  );
  assert.match(
    enabledFlow,
    /await resolveAdventureAwareAccess\(\)/,
  );
});

test("trusted authenticated identity is rendered read-only", () => {
  assert.match(enabledFlow, /button\.disabled = true/);
  assert.match(
    enabledFlow,
    /renderIdentityChoices\([\s\S]*state\.activeAdventurerId/,
  );
  assert.doesNotMatch(
    enabledFlow,
    /addEventListener\([\s\S]*data-adventurer-identity/,
  );
});

test("zero and unavailable access use approved neutral states", () => {
  assert.match(enabledFlow, /No Adventures available yet\./);
  assert.match(
    enabledFlow,
    /Adventure access couldn't be verified\. Please try again\./,
  );
  assert.match(
    html,
    /id="welcomeAccessMessage"[^>]*role="status"/,
  );
});

test("restored Adventure-aware sessions do not trust the legacy skip flag", () => {
  assert.doesNotMatch(enabledFlow, /acSkipWelcome/);
  assert.doesNotMatch(enabledFlow, /savedIdentity/);
  assert.match(
    enabledFlow,
    /if \(restored\) \{[\s\S]*modal\.hidden = true/,
  );
});
