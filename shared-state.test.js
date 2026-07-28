const assert = require("node:assert/strict");
const SharedState = require("./shared-state");

function runTests() {
  assert.ok(
    SharedState,
    "Shared State should export an API"
  );

  assert.equal(
    SharedState.STATES.AVAILABLE,
    "available"
  );

  assert.equal(
    SharedState.STATES.UNAVAILABLE,
    "unavailable"
  );

  assert.equal(
    SharedState.STATES.UNKNOWN,
    "unknown"
  );

  const unknownFamily = SharedState.normalizeFamilyReadiness();

  assert.deepEqual(
    unknownFamily,
    {
      state: SharedState.STATES.UNKNOWN,
      value: {
        adventurers: [],
        familyReady: false,
      },
    }
  );

  const partiallyReadyFamily = SharedState.normalizeFamilyReadiness({
    adventurers: [
      {
        id: "emily",
        name: "Emily",
        ready: true,
      },
      {
        id: "jake",
        name: "Jake",
        ready: false,
      },
      null,
      {
        name: "Missing ID",
        ready: true,
      },
    ],
  });

  assert.equal(
    partiallyReadyFamily.state,
    SharedState.STATES.AVAILABLE
  );

  assert.deepEqual(
    partiallyReadyFamily.value.adventurers,
    [
      {
        id: "emily",
        name: "Emily",
        ready: true,
      },
      {
        id: "jake",
        name: "Jake",
        ready: false,
      },
    ]
  );

  assert.equal(
    partiallyReadyFamily.value.familyReady,
    false
  );

  const fullyReadyFamily = SharedState.normalizeFamilyReadiness({
    adventurers: [
      {
        id: "emily",
        name: "Emily",
        ready: true,
      },
      {
        id: "jake",
        ready: true,
      },
    ],
  });

  assert.deepEqual(
    fullyReadyFamily,
    {
      state: SharedState.STATES.AVAILABLE,
      value: {
        adventurers: [
          {
            id: "emily",
            name: "Emily",
            ready: true,
          },
          {
            id: "jake",
            name: "jake",
            ready: true,
          },
        ],
        familyReady: true,
      },
    }
  );

  const strictBooleanFamily = SharedState.normalizeFamilyReadiness({
    adventurers: [
      {
        id: 42,
        name: null,
        ready: "true",
      },
    ],
    });

  assert.deepEqual(
    strictBooleanFamily,
    {
      state: SharedState.STATES.AVAILABLE,
      value: {
        adventurers: [
          {
            id: "42",
            name: "42",
            ready: false,
          },
        ],
        familyReady: false,
      },
    }
  );

  assert.ok(
    Object.isFrozen(SharedState.STATES),
    "Shared state values should be frozen"
  );

  assert.ok(
    Object.isFrozen(SharedState),
    "Shared State API should be frozen"
  );

  console.log(
    "Shared State tests passed."
  );
}

runTests();