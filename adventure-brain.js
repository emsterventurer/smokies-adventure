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
    function createSignal({
    id,
    category,
    state = SIGNAL_STATES.UNKNOWN,
    active = false,
    priorityTier = null,
    evidence = {},
  }) {
    return {
      id,
      category,
      state,
      active,
      priorityTier,
      evidence,
    };
  }

  function createFocusCandidate({
    id,
    priorityTier,
    category,
    title,
    message,
    actionLabel = null,
    actionTarget = null,
    tone = "calm",
  }) {
    return {
      id,
      priorityTier,
      category,
      title,
      message,
      actionLabel,
      actionTarget,
      tone,
    };
  }

  function selectDailyFocus(candidates = []) {
    const validCandidates = candidates
      .filter((candidate) => candidate)
      .sort((a, b) => {
        const priorityDifference =
          (a.priorityTier ?? Infinity) -
          (b.priorityTier ?? Infinity);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return a.id.localeCompare(b.id);
      });

    return validCandidates[0] ?? null;
  }
  function evaluate(context = {}) {
    const state = createFallbackState("evaluation-complete");

    state.status = {
      state: SIGNAL_STATES.AVAILABLE,
      reason: "evaluation-complete",
      evaluatedAt: new Date().toISOString(),
    };

    if (context.phase) {
      state.phase = {
        id: context.phase.id ?? null,
        state:
          context.phase.state ?? SIGNAL_STATES.UNKNOWN,
      };
    }

    return state;
  }
      return Object.freeze({
    SIGNAL_STATES,
    PRIORITY_TIERS,
    createFallbackState,
    createSignal,
    createFocusCandidate,
    selectDailyFocus,
    evaluate,
  });
});