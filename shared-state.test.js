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