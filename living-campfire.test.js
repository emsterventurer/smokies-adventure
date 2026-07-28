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

const normalized =
  LivingCampfire.evaluate({
    mode: "reflection",
    primaryTopic: "weather",
    dailyFocusId: "focus-1",
    avoidTopics: ["packing"],
    state: "available",
  });

assert.equal(
  normalized.meta.reason,
  "message-selected"
);

assert.equal(
  normalized.message.category,
  "reflection"
);

assert.equal(
  normalized.meta.contextKey,
  "reflection"
);

const encouragement =
  LivingCampfire.evaluate({
    mode: "encouragement",
    state: "available",
  });

assert.equal(
  encouragement.message.category,
  "encouragement"
);

assert.equal(
  encouragement.meta.contextKey,
  "encouragement"
);

const celebration =
  LivingCampfire.evaluate({
    mode: "celebration",
    state: "available",
  });

assert.equal(
  celebration.message.category,
  "celebration"
);

assert.equal(
  celebration.meta.contextKey,
  "celebration"
);

const discovery =
  LivingCampfire.evaluate({
    mode: "discovery",
    state: "available",
  });

assert.equal(
  discovery.message.category,
  "discovery"
);

assert.equal(
  discovery.meta.contextKey,
  "discovery"
);

const lightTouch =
  LivingCampfire.evaluate({
    mode: "light-touch",
    state: "available",
  });

assert.equal(
  lightTouch.message.category,
  "light-touch"
);

assert.equal(
  lightTouch.meta.contextKey,
  "light-touch"
);

const unknownMode =
  LivingCampfire.evaluate({
    mode: "not-a-real-mode",
    state: "available",
  });

assert.equal(
  unknownMode.message.category,
  "light-touch"
);

assert.equal(
  unknownMode.meta.contextKey,
  "not-a-real-mode"
);

  console.log(
    "Living Campfire foundation tests passed."
  );
}

runTests();