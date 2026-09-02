"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const AdventureAccess = require(
  "./adventure/adventure-access.js",
);
const AdventurerDirectory = require(
  "./adventure/adventurer-directory.js",
);
const AdventurerIdentity = require(
  "./adventure/adventurer-identity.js",
);

const localAdventures = [
  { id: "smokies-2026", title: "Smokies 2026" },
  { id: "pacific-coast-2026", title: "Pacific Coast 2026" },
];

const directory = new Set([
  "bubbe",
  "carolyn",
  "emily",
]);

function resolve(adventures, persistedActiveAdventureId = null) {
  return AdventureAccess.resolveAdventureAccess({
    accessResult: { adventures },
    localAdventures,
    persistedActiveAdventureId,
    findAdventurer: (adventurerId) =>
      directory.has(adventurerId)
        ? { id: adventurerId }
        : null,
  });
}

test("access client accepts invitations before listing access without supplying an email", async () => {
  const calls = [];
  const client = AdventureAccess.createAdventureAccessClient({
    acceptPendingInvitations(...args) {
      calls.push(["accept", args]);
      return Promise.resolve({ accepted: [] });
    },
    listAccess(...args) {
      calls.push(["list", args]);
      return Promise.resolve({
        adventures: [
          {
            adventureId: "smokies-2026",
            adventurerId: "emily",
          },
        ],
      });
    },
  });

  const result = await client.resolveCurrentAdventureAccess();

  assert.deepEqual(calls, [
    ["accept", []],
    ["list", []],
  ]);
  assert.deepEqual(result.adventures, [
    {
      adventureId: "smokies-2026",
      adventurerId: "emily",
    },
  ]);
});

test("invitation acceptance failure prevents access listing", async () => {
  let listed = false;
  const client = AdventureAccess.createAdventureAccessClient({
    acceptPendingInvitations() {
      throw new Error("backend unavailable");
    },
    listAccess() {
      listed = true;
      return { adventures: [] };
    },
  });

  await assert.rejects(
    client.resolveCurrentAdventureAccess(),
    /backend unavailable/,
  );
  assert.equal(listed, false);
});

test("zero valid locally-known Adventures resolves empty", () => {
  const state = resolve([]);

  assert.equal(state.status, "empty");
  assert.equal(state.activeAdventureId, null);
  assert.deepEqual(state.adventures, []);
});

test("one authorized Adventure is selected with its trusted identity", () => {
  const state = resolve([
    {
      adventureId: "pacific-coast-2026",
      adventurerId: "carolyn",
    },
  ]);

  assert.equal(state.status, "authorized");
  assert.equal(
    state.activeAdventureId,
    "pacific-coast-2026",
  );
  assert.equal(state.activeAdventurerId, "carolyn");
});

test("authorized persisted Adventure is preserved", () => {
  const state = resolve(
    [
      {
        adventureId: "smokies-2026",
        adventurerId: "bubbe",
      },
      {
        adventureId: "pacific-coast-2026",
        adventurerId: "bubbe",
      },
    ],
    "smokies-2026",
  );

  assert.equal(state.activeAdventureId, "smokies-2026");
});

test("unauthorized persisted Adventure uses lexical known fallback", () => {
  const state = resolve(
    [
      {
        adventureId: "smokies-2026",
        adventurerId: "bubbe",
      },
      {
        adventureId: "pacific-coast-2026",
        adventurerId: "bubbe",
      },
    ],
    "unauthorized-adventure",
  );

  assert.equal(
    state.activeAdventureId,
    "pacific-coast-2026",
  );
});

test("malformed and conflicting access entries are rejected", () => {
  const normalized = AdventureAccess.normalizeAccessResult({
    adventures: [
      { adventureId: "bad id", adventurerId: "bubbe" },
      { adventureId: "smokies-2026", adventurerId: "bubbe" },
      { adventureId: "smokies-2026", adventurerId: "emily" },
      {
        adventureId: "pacific-coast-2026",
        adventurerId: "carolyn",
      },
    ],
  });

  assert.deepEqual(normalized, [
    {
      adventureId: "pacific-coast-2026",
      adventurerId: "carolyn",
    },
  ]);
});

test("unknown cloud-only access is excluded while known access remains", () => {
  const state = resolve([
    {
      adventureId: "future-cloud-adventure",
      adventurerId: "emily",
    },
    {
      adventureId: "smokies-2026",
      adventurerId: "bubbe",
    },
  ]);

  assert.equal(state.status, "authorized");
  assert.deepEqual(
    state.adventures.map((adventure) => adventure.id),
    ["smokies-2026"],
  );
});

test("only unknown cloud Adventures resolve empty without fabricating records", () => {
  const state = resolve([
    {
      adventureId: "future-cloud-adventure",
      adventurerId: "emily",
    },
  ]);

  assert.equal(state.status, "empty");
  assert.deepEqual(state.adventures, []);
});

test("missing trusted directory identity fails closed", () => {
  const state = resolve([
    {
      adventureId: "smokies-2026",
      adventurerId: "missing-person",
    },
  ]);

  assert.equal(state.status, "unavailable");
  assert.equal(state.reason, "identity-unavailable");
  assert.equal(state.activeAdventureId, null);
});

test("authorized switch resolution rejects unknown Adventures and missing identities", () => {
  const state = resolve([
    {
      adventureId: "smokies-2026",
      adventurerId: "bubbe",
    },
    {
      adventureId: "pacific-coast-2026",
      adventurerId: "carolyn",
    },
  ]);

  assert.deepEqual(
    AdventureAccess.resolveAuthorizedSelection(
      state,
      "pacific-coast-2026",
      (id) => directory.has(id) ? { id } : null,
    ),
    {
      adventureId: "pacific-coast-2026",
      adventurerId: "carolyn",
    },
  );
  assert.equal(
    AdventureAccess.resolveAuthorizedSelection(
      state,
      "unauthorized-adventure",
      () => ({ id: "bubbe" }),
    ),
    null,
  );
});

test("sync remains locked until the resolved active Adventure is authorized", () => {
  const state = resolve([
    {
      adventureId: "smokies-2026",
      adventurerId: "bubbe",
    },
  ]);

  assert.equal(
    AdventureAccess.canSynchronizeAdventure(
      { status: "unresolved", access: [] },
      "smokies-2026",
    ),
    false,
  );
  assert.equal(
    AdventureAccess.canSynchronizeAdventure(
      { status: "empty", access: [] },
      "smokies-2026",
    ),
    false,
  );
  assert.equal(
    AdventureAccess.canSynchronizeAdventure(
      state,
      "pacific-coast-2026",
    ),
    false,
  );
  assert.equal(
    AdventureAccess.canSynchronizeAdventure(
      state,
      "smokies-2026",
    ),
    true,
  );
});

test("trusted membership identity replaces stale local identity", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
  const directoryRecord =
    AdventurerDirectory
      .createInitialAdventurerDirectory();
  const identityService = {
    selectIdentity(adventurerId) {
      return AdventurerIdentity.selectIdentity(
        adventurerId,
        {
          storage,
          directory: directoryRecord,
        },
      );
    },
  };

  AdventurerIdentity.selectIdentity("emily", {
    storage,
    directory: directoryRecord,
  });

  const state = resolve([
    {
      adventureId: "smokies-2026",
      adventurerId: "bubbe",
    },
  ]);
  const selected = AdventureAccess.bindTrustedIdentity(
    state,
    identityService,
  );

  assert.equal(selected.id, "bubbe");
  assert.equal(
    AdventurerIdentity.readIdentity({
      storage,
      directory: directoryRecord,
    }).id,
    "bubbe",
  );
});

test("invitation accepted during startup is visible in the same access resolution", async () => {
  let invitationAccepted = false;
  const client = AdventureAccess.createAdventureAccessClient({
    async acceptPendingInvitations() {
      invitationAccepted = true;
    },
    async listAccess() {
      return {
        adventures: invitationAccepted
          ? [
              {
                adventureId: "pacific-coast-2026",
                adventurerId: "carolyn",
              },
            ]
          : [],
      };
    },
  });

  const access = await client.resolveCurrentAdventureAccess();
  const state = AdventureAccess.resolveAdventureAccess({
    accessResult: access,
    localAdventures,
    findAdventurer: (id) =>
      directory.has(id) ? { id } : null,
  });

  assert.equal(state.status, "authorized");
  assert.equal(
    state.activeAdventureId,
    "pacific-coast-2026",
  );
});

test("access listing failure fails the resolution sequence", async () => {
  const client = AdventureAccess.createAdventureAccessClient({
    async acceptPendingInvitations() {},
    async listAccess() {
      throw new Error("access listing failed");
    },
  });

  await assert.rejects(
    client.resolveCurrentAdventureAccess(),
    /access listing failed/,
  );
});

test("activation is enabled while the legacy membership path remains available for rollback", () => {
  const config = require("./config.js");
  const app = fs.readFileSync("app.js", "utf8");

  assert.equal(
    config.features.adventureAwareAccess,
    true,
  );
  assert.match(
    app,
    /if \(!ADVENTURE_AWARE_ACCESS_ENABLED\)/,
  );
  assert.match(
    app,
    /\.isCurrentUserMember\(/,
  );
});

test("enabled failure path does not invoke legacy membership fallback", () => {
  const app = fs.readFileSync("app.js", "utf8");
  const start = app.indexOf(
    "async function setupAdventureAwareWelcome",
  );
  const end = app.indexOf(
    "async function setupWelcome()",
    start,
  );
  const enabledFlow = app.slice(start, end);

  assert.doesNotMatch(enabledFlow, /smokies-2026/);
  assert.doesNotMatch(enabledFlow, /isCurrentUserMember/);
  assert.match(
    enabledFlow,
    /Adventure access couldn't be verified/,
  );
});
