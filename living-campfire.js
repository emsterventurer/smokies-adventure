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

  const MESSAGE_TEMPLATES = Object.freeze({
  encouragement: Object.freeze({
    category: MESSAGE_CATEGORIES.ENCOURAGEMENT,
    title: "The adventure is taking shape",
    body:
      "A little thoughtful preparation now will make more room for joy when the journey begins.",
  }),

  reflection: Object.freeze({
    category: MESSAGE_CATEGORIES.REFLECTION,
    title: "Hold onto this moment",
    body:
      "The smallest moments often become the stories a family remembers most.",
  }),

  celebration: Object.freeze({
    category: MESSAGE_CATEGORIES.CELEBRATION,
    title: "That deserves a celebration",
    body:
      "Another meaningful step is complete, and the adventure is closer because of it.",
  }),

  discovery: Object.freeze({
    category: MESSAGE_CATEGORIES.DISCOVERY,
    title: "There is more to discover",
    body:
      "Leave a little space for the unexpected moments that make an adventure feel entirely your own.",
  }),

  "light-touch": Object.freeze({
    category: MESSAGE_CATEGORIES.LIGHT_TOUCH,
    title: "The campfire is glowing",
    body:
      "Everything does not need attention at once. The adventure can unfold one calm step at a time.",
  }),
});
  
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

  function normalizeRemyContext(remyContext = {}) {
   return {
    mode:
      remyContext.mode ??
      "light-touch",

    primaryTopic:
      remyContext.primaryTopic ??
      null,

    dailyFocusId:
      remyContext.dailyFocusId ??
      null,

    avoidTopics:
      Array.isArray(remyContext.avoidTopics)
        ? remyContext.avoidTopics
        : [],

    state:
      remyContext.state ??
      CONTEXT_STATES.UNKNOWN,
    };
  }

  function selectMessageTemplate(mode = "light-touch") {
  return (
    MESSAGE_TEMPLATES[mode] ??
    MESSAGE_TEMPLATES["light-touch"]
  );
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

  const context =
    normalizeRemyContext(remyContext);

  const message =
    selectMessageTemplate(context.mode);

  return {
    message: {
      category: message.category,
      title: message.title,
      body: message.body,
    },

    prompt: null,

    meta: {
      contextKey: context.mode,
      state: context.state,
      reason: "message-selected",
    },
  };
}
  
  return Object.freeze({
    MESSAGE_CATEGORIES,
    CONTEXT_STATES,
    MESSAGE_TEMPLATES,
    createFallbackExperience,
    normalizeRemyContext,
    selectMessageTemplate,
    evaluate,
  });
});