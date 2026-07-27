(function (root, factory) {
  const sharedState =
    typeof module === "object" && module.exports
      ? require("./shared-state")
      : root.SharedState;

  const api = factory(sharedState);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.LivingCampfire = api;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function (SharedState) {
    "use strict";

  const MESSAGE_CATEGORIES = Object.freeze({
    ENCOURAGEMENT: "encouragement",
    REFLECTION: "reflection",
    CELEBRATION: "celebration",
    DISCOVERY: "discovery",
    LIGHT_TOUCH: "light-touch",
  });

  const CONTEXT_STATES = SharedState.STATES;

  function createFallbackExperience(
    reason = "campfire-context-unavailable"
  ) {
    return {
      message: {
        category: MESSAGE_CATEGORIES.LIGHT_TOUCH,
        title: "One step at a time",
        body:
          "Every adventure begins with a single next step.",
      },

      prompt: null,

      meta: {
        contextKey: "fallback",
        state: CONTEXT_STATES.UNAVAILABLE,
        reason,
      },
    };
  }

  function evaluate(remyContext = null) {
    if (
      !remyContext ||
      typeof remyContext !== "object"
    ) {
      return createFallbackExperience(
        "invalid-remy-context"
      );
    }

    return createFallbackExperience(
      "living-campfire-foundation"
    );
  }

  return Object.freeze({
    MESSAGE_CATEGORIES,
    CONTEXT_STATES,
    createFallbackExperience,
    evaluate,
  });
});