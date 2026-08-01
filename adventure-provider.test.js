"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureProvider = require(
  "./adventure/adventure-provider.js",
);

function createValidProvider() {
  return {
    loadAdventureRecord() {},
    saveAdventureRecord() {},
    listAdventureRecords() {},
    deleteAdventureRecord() {},
    hasAdventureRecord() {},
  };
}

test("accepts a valid Adventure Provider", () => {
  assert.equal(
    AdventureProvider.isAdventureProvider(
      createValidProvider(),
    ),
    true,
  );
});

test("rejects an invalid Adventure Provider", () => {
  assert.equal(
    AdventureProvider.isAdventureProvider({}),
    false,
  );
});

test("returns a valid Adventure Provider", () => {
  const provider = createValidProvider();

  assert.equal(
    AdventureProvider.requireAdventureProvider(
      provider,
    ),
    provider,
  );
});

test("throws for an invalid Adventure Provider", () => {
  assert.throws(
    () =>
      AdventureProvider.requireAdventureProvider(
        {},
      ),
    {
      name: "TypeError",
      message:
        "A valid Adventure Provider is required.",
    },
  );
});
