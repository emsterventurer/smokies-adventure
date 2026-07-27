const assert = require("node:assert/strict");
const LivingCampfire = require("./living-campfire");

function runTests() {
  assert.ok(
    LivingCampfire,
    "Living Campfire should export an API"
  );

  assert.equal(
    LivingCampfire.MESSAGE_CATEGORIES.LIGHT_TOUCH,
    "light-touch"
  );

  assert.equal(
    LivingCampfire.CONTEXT_STATES.UNKNOWN,
    "unknown"
  );

  const fallback =
    LivingCampfire.createFallbackExperience();

  assert.equal(
    fallback.message.category,
    "light-touch"
  );

  assert.equal(
    typeof fallback.message.title,
    "string"
  );

  assert.equal(
    typeof fallback.message.body,
    "string"
  );

  assert.equal(
    fallback.prompt,
    null
  );

  assert.equal(
    fallback.meta.contextKey,
    "fallback"
  );

  assert.equal(
    fallback.meta.state,
    "unavailable"
  );

  assert.doesNotThrow(() => {
    LivingCampfire.evaluate();
    LivingCampfire.evaluate(null);
    LivingCampfire.evaluate({});
    LivingCampfire.evaluate("invalid");
  });

  const evaluated =
    LivingCampfire.evaluate(null);

  assert.equal(
    evaluated.message.category,
    "light-touch"
  );

  assert.equal(
    evaluated.meta.reason,
    "invalid-remy-context"
  );

  console.log(
    "Living Campfire foundation tests passed."
  );
}

runTests();