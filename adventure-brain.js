(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.AdventureBrain = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SIGNAL_STATES = Object.freeze({
    AVAILABLE: "available",
    UNAVAILABLE: "unavailable",
    UNKNOWN: "unknown",
  });

  const PRIORITY_TIERS = Object.freeze({
    SAFETY_OR_SERIOUS_WEATHER: 1,
    CONFIRMED_RESERVATION_OR_TRAVEL_REQUIREMENT: 2,
    ADVENTURE_DISCOVERY_OR_ENCOURAGEMENT: 3,
    MEMORY_AND_REFLECTION: 4,
    TODAY_PREPARATION: 5,
    TOMORROW_PREPARATION: 6,
    INDIVIDUAL_READINESS: 7,
    FAMILY_READINESS: 8,
  });

  function createFallbackState(reason = "brain-not-evaluated") {
    return {
      status: {
        state: SIGNAL_STATES.UNKNOWN,
        reason,
        evaluatedAt: null,
      },
      phase: {
        id: null,
        state: SIGNAL_STATES.UNKNOWN,
      },
      signals: [],
      attentionItems: [],
      dailyFocus: null,
      remyContext: {
        mode: "light-touch",
        primaryTopic: null,
        dailyFocusId: null,
        avoidTopics: [],
        state: SIGNAL_STATES.UNKNOWN,
      },
      celebrations: {
        newlyReadyIndividuals: [],
        familyEligible: false,
        blockedBy: [],
        state: SIGNAL_STATES.UNKNOWN,
      },
    };
  }

  return Object.freeze({
    SIGNAL_STATES,
    PRIORITY_TIERS,
    createFallbackState,
  });
});