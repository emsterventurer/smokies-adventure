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
      function normalizeContext(context = {}) {
    return {
      now: {
        state:
          context.now?.state ??
          SIGNAL_STATES.UNKNOWN,
        value: context.now?.value ?? null,
      },

      trip: {
        state:
          context.trip?.state ??
          SIGNAL_STATES.UNKNOWN,
        value: context.trip?.value ?? null,
      },

      phase: {
        state:
          context.phase?.state ??
          SIGNAL_STATES.UNKNOWN,
        id: context.phase?.id ?? null,
      },

      weather: {
        state:
          context.weather?.state ??
          SIGNAL_STATES.UNKNOWN,
        value: context.weather?.value ?? null,
      },

      itinerary: {
        state:
          context.itinerary?.state ??
          SIGNAL_STATES.UNKNOWN,
        value:
          context.itinerary?.value ?? null,
      },

      packing: {
        state:
          context.packing?.state ??
          SIGNAL_STATES.UNKNOWN,
        value:
          context.packing?.value ?? null,
      },

      reservations: {
        state:
          context.reservations?.state ??
          SIGNAL_STATES.UNKNOWN,
        value:
          context.reservations?.value ?? null,
      },

      familyReadiness: {
        state:
          context.familyReadiness?.state ??
          SIGNAL_STATES.UNKNOWN,
        value:
          context.familyReadiness?.value ?? null,
      },

      campfire: {
        state:
          context.campfire?.state ??
          SIGNAL_STATES.UNKNOWN,
        value:
          context.campfire?.value ?? null,
      },
    };
  }
    function createPhaseSignal(phase = {}) {
    return createSignal({
      id: `phase-${phase.id ?? "unknown"}`,
      category: "phase",
      state:
        phase.state ?? SIGNAL_STATES.UNKNOWN,
      active: Boolean(phase.id),
      priorityTier: null,
      evidence: {
        phaseId: phase.id ?? null,
      },
    });
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

  function createPhaseFocusCandidate(phase = {}) {
    const phaseMessages = {
      dreaming: {
        title: "Enjoy imagining the adventure",
        message:
          "The journey has started before you arrive. Take time to look forward to what is ahead.",
      },

      planning: {
        title: "Prepare calmly for the adventure",
        message:
          "A few thoughtful preparations now can help the adventure feel effortless later.",
      },

      experiencing: {
        title: "Enjoy today's adventure",
        message:
          "The best moments happen when the family is present for the experience.",
      },

      remembering: {
        title: "Capture the memories",
        message:
          "Take a moment to preserve the stories that made the adventure special.",
      },
    };

    const message =
      phaseMessages[phase.id] ?? null;

    if (!message) {
      return null;
    }

    return createFocusCandidate({
      id: `phase-focus-${phase.id}`,
      priorityTier:
        PRIORITY_TIERS.ADVENTURE_DISCOVERY_OR_ENCOURAGEMENT,
      category: "phase",
      title: message.title,
      message: message.message,
    });
  }

  function evaluate(context = {}) {
    const normalizedContext = normalizeContext(context);

    const state = createFallbackState("evaluation-complete");

    state.status = {
      state: SIGNAL_STATES.AVAILABLE,
      reason: "evaluation-complete",
      evaluatedAt: new Date().toISOString(),
    };

       state.phase = {
      id: normalizedContext.phase.id,
      state: normalizedContext.phase.state,
    };
    state.itinerary = {
      state: normalizedContext.itinerary.state,
      value: normalizedContext.itinerary.value,
    };

    state.reservations = {
     state: normalizedContext.reservations.state,
      value: normalizedContext.reservations.value,
    };
    return state;
  }
   return Object.freeze({
    SIGNAL_STATES,
    PRIORITY_TIERS,
    createFallbackState,
    normalizeContext,
    createSignal,
    createFocusCandidate,
    selectDailyFocus,
    createPhaseSignal,
    createPhaseFocusCandidate,
    evaluate,
});
});