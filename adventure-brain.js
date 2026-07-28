(function (root, factory) {
  const sharedState =
    typeof module === "object" && module.exports
      ? require("./shared-state")
      : root.SharedState;

  const api = factory(sharedState);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.AdventureBrain = api;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function (SharedState) {
    "use strict";

    const SIGNAL_STATES = SharedState.STATES;

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
      
      reservation: {
        summary: null,
        state: SIGNAL_STATES.UNKNOWN,
      },
      departure: {
        suggestion: null,
        state: SIGNAL_STATES.UNKNOWN,
      },
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
  function evaluateFamilyReadiness(
    familyReadiness = {}
  ) {
    const state =
      familyReadiness.state ??
      SIGNAL_STATES.UNKNOWN;

    const adventurers =
      familyReadiness.value?.adventurers;

    if (
      state !== SIGNAL_STATES.AVAILABLE ||
      !Array.isArray(adventurers)
    ) {
      return {
        familyEligible: false,
        blockedBy: [],
        state: SIGNAL_STATES.UNKNOWN,
      };
    }

    const blockedBy = adventurers
      .filter(
        (adventurer) =>
          adventurer?.ready !== true
      )
      .map((adventurer) => adventurer.id)
      .filter(Boolean);

    return {
      familyEligible:
        adventurers.length > 0 &&
        blockedBy.length === 0,
      blockedBy,
      state: SIGNAL_STATES.AVAILABLE,
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
  function detectFamilyReadinessTransitions(
  previousFamilyReadiness,
  currentFamilyReadiness
) {
  const previousEvaluation =
    evaluateFamilyReadiness(
      previousFamilyReadiness
    );

  const currentEvaluation =
    evaluateFamilyReadiness(
      currentFamilyReadiness
    );

  if (
    previousEvaluation.state !==
      SIGNAL_STATES.AVAILABLE ||
    currentEvaluation.state !==
      SIGNAL_STATES.AVAILABLE
  ) {
    return {
      newlyReadyAdventurerIds: [],
      familyBecameReady: false,
    };
  }

  const previousAdventurers =
    previousFamilyReadiness.value
      ?.adventurers ?? [];

  const currentAdventurers =
    currentFamilyReadiness.value
      ?.adventurers ?? [];

  const previousReadinessById =
    new Map(
      previousAdventurers
        .filter(
          (adventurer) =>
            Boolean(adventurer?.id)
        )
        .map((adventurer) => [
          adventurer.id,
          adventurer.ready === true,
        ])
    );

  const newlyReadyAdventurerIds =
    currentAdventurers
      .filter(
        (adventurer) =>
          Boolean(adventurer?.id) &&
          adventurer.ready === true &&
          previousReadinessById.get(
            adventurer.id
          ) === false
      )
      .map((adventurer) => adventurer.id);

  return {
    newlyReadyAdventurerIds,
    familyBecameReady:
      previousEvaluation.familyEligible ===
        false &&
      currentEvaluation.familyEligible ===
        true,
  };
}
  function createRecognitionCandidates(
  transitions = {}
) {
  const newlyReadyAdventurerIds =
    Array.isArray(
      transitions.newlyReadyAdventurerIds
    )
      ? transitions.newlyReadyAdventurerIds
      : [];

  const individualCandidates =
    newlyReadyAdventurerIds
      .filter(Boolean)
      .map((adventurerId) => ({
        id: `recognition-${adventurerId}`,
        category: "recognition",
        priorityTier:
          PRIORITY_TIERS.INDIVIDUAL_READINESS,
        evidence: {
          adventurerId,
        },
      }));

  const familyCandidates =
    transitions.familyBecameReady === true
      ? [
          {
            id: "family-recognition",
            category: "recognition",
            priorityTier:
              PRIORITY_TIERS.FAMILY_READINESS,
            evidence: {
              familyBecameReady: true,
            },
          },
        ]
      : [];

  return [
    ...individualCandidates,
    ...familyCandidates,
  ];
}
  function createFamilyInsightCandidates(
  familyReadiness = {}
) {
  const readiness =
    evaluateFamilyReadiness(familyReadiness);

  if (
    readiness.state !==
    SIGNAL_STATES.AVAILABLE
  ) {
    return [];
  }

  const adventurers =
    familyReadiness.value?.adventurers ?? [];

  if (readiness.familyEligible) {
    return [
      {
        id: "family-readiness-ready",
        category: "family-readiness",
        priorityTier:
          PRIORITY_TIERS.FAMILY_READINESS,
        evidence: {
          adventurerIds: adventurers
            .map(
              (adventurer) =>
                adventurer?.id
            )
            .filter(Boolean),
          familyEligible: true,
        },
      },
    ];
  }

  return adventurers
    .filter(
      (adventurer) =>
        adventurer?.ready !== true &&
        Boolean(adventurer?.id)
    )
    .map((adventurer) => ({
      id:
        `individual-readiness-${adventurer.id}`,
      category: "individual-readiness",
      priorityTier:
        PRIORITY_TIERS.INDIVIDUAL_READINESS,
      evidence: {
        adventurerId: adventurer.id,
        adventurerName:
          adventurer.name ?? null,
        ready: false,
      },
    }));
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

    state.familyReadiness = {
      state: normalizedContext.familyReadiness.state,
      value: normalizedContext.familyReadiness.value,
    };

    state.reservations = {
     state: normalizedContext.reservations.state,
    value: normalizedContext.reservations.value,
    };
    
    state.reservation = {
      summary: normalizedContext.reservations.value,
      state: normalizedContext.reservations.state,
    };
    state.departure = {
      suggestion:
        normalizedContext.itinerary.value?.leave ?? null,
    state: normalizedContext.itinerary.state,
    };
    return state;
  }
   return Object.freeze({
    SIGNAL_STATES,
    PRIORITY_TIERS,
    createFallbackState,
    normalizeContext,
    evaluateFamilyReadiness,
    detectFamilyReadinessTransitions,
    createRecognitionCandidates,
    createFamilyInsightCandidates,
    createSignal,
    createFocusCandidate,
    selectDailyFocus,
    createPhaseSignal,
    createPhaseFocusCandidate,
    evaluate,
});
});