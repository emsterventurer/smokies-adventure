"use strict";

const assert = require("assert");
const {
  SIGNAL_STATES,
  PRIORITY_TIERS,
  createFallbackState,
  normalizeContext,
  createSignal,
  createFocusCandidate,
  selectDailyFocus,
  createPhaseSignal,
  createPhaseFocusCandidate,
} = require("./adventure-brain.js");

function testSignalStates() {
  assert.deepStrictEqual(SIGNAL_STATES, {
    AVAILABLE: "available",
    UNAVAILABLE: "unavailable",
    UNKNOWN: "unknown",
  });
}

function testPriorityTiers() {
  assert.deepStrictEqual(PRIORITY_TIERS, {
    SAFETY_OR_SERIOUS_WEATHER: 1,
    CONFIRMED_RESERVATION_OR_TRAVEL_REQUIREMENT: 2,
    ADVENTURE_DISCOVERY_OR_ENCOURAGEMENT: 3,
    MEMORY_AND_REFLECTION: 4,
    TODAY_PREPARATION: 5,
    TOMORROW_PREPARATION: 6,
    INDIVIDUAL_READINESS: 7,
    FAMILY_READINESS: 8,
  });
}

function testFallbackState() {
  const state = createFallbackState();

  assert.strictEqual(state.status.state, SIGNAL_STATES.UNKNOWN);
  assert.strictEqual(state.status.reason, "brain-not-evaluated");
  assert.strictEqual(state.status.evaluatedAt, null);

  assert.strictEqual(state.phase.id, null);
  assert.strictEqual(state.phase.state, SIGNAL_STATES.UNKNOWN);

  assert.deepStrictEqual(state.signals, []);
  assert.deepStrictEqual(state.attentionItems, []);
  assert.strictEqual(state.dailyFocus, null);

  assert.deepStrictEqual(state.remyContext, {
    mode: "light-touch",
    primaryTopic: null,
    dailyFocusId: null,
    avoidTopics: [],
    state: SIGNAL_STATES.UNKNOWN,
  });

  assert.deepStrictEqual(state.celebrations, {
    newlyReadyIndividuals: [],
    familyEligible: false,
    blockedBy: [],
    state: SIGNAL_STATES.UNKNOWN,
  });
}

function testCustomFallbackReason() {
  const state = createFallbackState("evaluation-error");

  assert.strictEqual(state.status.reason, "evaluation-error");
}
function testFamilyReadinessUnknown() {
  const result =
    AdventureBrain.evaluateFamilyReadiness();

  assert.deepStrictEqual(result, {
    familyEligible: false,
    blockedBy: [],
    state: SIGNAL_STATES.UNKNOWN,
  });
}

function testFamilyReadinessWithBlockers() {
  const result =
    AdventureBrain.evaluateFamilyReadiness({
      state: SIGNAL_STATES.AVAILABLE,
      value: {
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
          {
            id: "kaseryn",
            name: "Kaseryn",
            ready: false,
          },
        ],
      },
    });

  assert.deepStrictEqual(result, {
    familyEligible: false,
    blockedBy: ["jake", "kaseryn"],
    state: SIGNAL_STATES.AVAILABLE,
  });
}

function testFamilyReadinessEligible() {
  const result =
    AdventureBrain.evaluateFamilyReadiness({
      state: SIGNAL_STATES.AVAILABLE,
      value: {
        adventurers: [
          {
            id: "emily",
            name: "Emily",
            ready: true,
          },
          {
            id: "jake",
            name: "Jake",
            ready: true,
          },
        ],
      },
    });

  assert.deepStrictEqual(result, {
    familyEligible: true,
    blockedBy: [],
    state: SIGNAL_STATES.AVAILABLE,
  });
}
function testFamilyInsightCandidatesUnknown() {
  const candidates =
    AdventureBrain.createFamilyInsightCandidates();

  assert.deepStrictEqual(candidates, []);
}

function testFamilyInsightCandidatesWithBlockers() {
  const candidates =
    AdventureBrain.createFamilyInsightCandidates({
      state: SIGNAL_STATES.AVAILABLE,
      value: {
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
          {
            id: "kaseryn",
            name: "Kaseryn",
            ready: false,
          },
        ],
      },
    });

  assert.deepStrictEqual(candidates, [
    {
      id: "individual-readiness-jake",
      category: "individual-readiness",
      priorityTier:
        AdventureBrain.PRIORITY_TIERS
          .INDIVIDUAL_READINESS,
      evidence: {
        adventurerId: "jake",
        adventurerName: "Jake",
        ready: false,
      },
    },
    {
      id: "individual-readiness-kaseryn",
      category: "individual-readiness",
      priorityTier:
        AdventureBrain.PRIORITY_TIERS
          .INDIVIDUAL_READINESS,
      evidence: {
        adventurerId: "kaseryn",
        adventurerName: "Kaseryn",
        ready: false,
      },
    },
  ]);
}

function testFamilyInsightCandidatesReady() {
  const candidates =
    AdventureBrain.createFamilyInsightCandidates({
      state: SIGNAL_STATES.AVAILABLE,
      value: {
        adventurers: [
          {
            id: "emily",
            name: "Emily",
            ready: true,
          },
          {
            id: "jake",
            name: "Jake",
            ready: true,
          },
        ],
      },
    });

  assert.deepStrictEqual(candidates, [
    {
      id: "family-readiness-ready",
      category: "family-readiness",
      priorityTier:
        AdventureBrain.PRIORITY_TIERS
          .FAMILY_READINESS,
      evidence: {
        adventurerIds: ["emily", "jake"],
        familyEligible: true,
      },
    },
  ]);
}
function testFamilyReadinessTransitionsWithoutHistory() {
  const transitions =
    AdventureBrain.detectFamilyReadinessTransitions(
      undefined,
      {
        state: SIGNAL_STATES.AVAILABLE,
        value: {
          adventurers: [
            {
              id: "emily",
              name: "Emily",
              ready: true,
            },
          ],
        },
      }
    );

  assert.deepStrictEqual(transitions, {
    newlyReadyAdventurerIds: [],
    familyBecameReady: false,
  });
}

function testFamilyReadinessTransitionsIndividualReady() {
  const transitions =
    AdventureBrain.detectFamilyReadinessTransitions(
      {
        state: SIGNAL_STATES.AVAILABLE,
        value: {
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
          ],
        },
      },
      {
        state: SIGNAL_STATES.AVAILABLE,
        value: {
          adventurers: [
            {
              id: "emily",
              name: "Emily",
              ready: true,
            },
            {
              id: "jake",
              name: "Jake",
              ready: true,
            },
          ],
        },
      }
    );

  assert.deepStrictEqual(transitions, {
    newlyReadyAdventurerIds: ["jake"],
    familyBecameReady: true,
  });
}

function testFamilyReadinessTransitionsRemainReady() {
  const readiness = {
    state: SIGNAL_STATES.AVAILABLE,
    value: {
      adventurers: [
        {
          id: "emily",
          name: "Emily",
          ready: true,
        },
        {
          id: "jake",
          name: "Jake",
          ready: true,
        },
      ],
    },
  };

  const transitions =
    AdventureBrain.detectFamilyReadinessTransitions(
      readiness,
      readiness
    );

  assert.deepStrictEqual(transitions, {
    newlyReadyAdventurerIds: [],
    familyBecameReady: false,
  });
}
function testRecognitionCandidatesWithoutTransitions() {
  const candidates =
    AdventureBrain.createRecognitionCandidates({
      newlyReadyAdventurerIds: [],
      familyBecameReady: false,
    });

  assert.deepStrictEqual(candidates, []);
}

function testRecognitionCandidatesIndividual() {
  const candidates =
    AdventureBrain.createRecognitionCandidates({
      newlyReadyAdventurerIds: [
        "jake",
        "kaseryn",
      ],
      familyBecameReady: false,
    });

  assert.deepStrictEqual(candidates, [
    {
      id: "recognition-jake",
      category: "recognition",
      priorityTier:
        AdventureBrain.PRIORITY_TIERS
          .INDIVIDUAL_READINESS,
      evidence: {
        adventurerId: "jake",
      },
    },
    {
      id: "recognition-kaseryn",
      category: "recognition",
      priorityTier:
        AdventureBrain.PRIORITY_TIERS
          .INDIVIDUAL_READINESS,
      evidence: {
        adventurerId: "kaseryn",
      },
    },
  ]);
}

function testRecognitionCandidatesFamily() {
  const candidates =
    AdventureBrain.createRecognitionCandidates({
      newlyReadyAdventurerIds: [],
      familyBecameReady: true,
    });

  assert.deepStrictEqual(candidates, [
    {
      id: "family-recognition",
      category: "recognition",
      priorityTier:
        AdventureBrain.PRIORITY_TIERS
          .FAMILY_READINESS,
      evidence: {
        familyBecameReady: true,
      },
    },
  ]);
}
function testFamilyIntelligencePipeline() {
  const previous = {
    state: SIGNAL_STATES.AVAILABLE,
    value: {
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
      ],
    },
  };

  const current = {
    state: SIGNAL_STATES.AVAILABLE,
    value: {
      adventurers: [
        {
          id: "emily",
          name: "Emily",
          ready: true,
        },
        {
          id: "jake",
          name: "Jake",
          ready: true,
        },
      ],
    },
  };

  const result =
    AdventureBrain.buildFamilyIntelligence(
      previous,
      current
    );

  assert.deepStrictEqual(result, {
    evaluation: {
      familyEligible: true,
      blockedBy: [],
      state: SIGNAL_STATES.AVAILABLE,
    },
    insightCandidates: [
      {
        id: "family-readiness-ready",
        category: "family-readiness",
        priorityTier:
          AdventureBrain.PRIORITY_TIERS
            .FAMILY_READINESS,
        evidence: {
          adventurerIds: [
            "emily",
            "jake",
          ],
          familyEligible: true,
        },
      },
    ],
    transitions: {
      newlyReadyAdventurerIds: [
        "jake",
      ],
      familyBecameReady: true,
    },
    recognitionCandidates: [
      {
        id: "recognition-jake",
        category: "recognition",
        priorityTier:
          AdventureBrain.PRIORITY_TIERS
            .INDIVIDUAL_READINESS,
        evidence: {
          adventurerId: "jake",
        },
      },
      {
        id: "family-recognition",
        category: "recognition",
        priorityTier:
          AdventureBrain.PRIORITY_TIERS
            .FAMILY_READINESS,
        evidence: {
          familyBecameReady: true,
        },
      },
    ],
  });
}
function testEvaluation() {
  const state = require("./adventure-brain.js").evaluate({
    phase: {
      id: "planning",
      state: SIGNAL_STATES.AVAILABLE,
    },
    familyReadiness: {
      state: SIGNAL_STATES.AVAILABLE,
      value: {
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
        ],
        familyReady: false,
      },
    },
  });

  assert.strictEqual(
    state.status.state,
    SIGNAL_STATES.AVAILABLE
  );

  assert.strictEqual(
    state.status.reason,
    "evaluation-complete"
  );

  assert.strictEqual(
    state.phase.id,
    "planning"
  );

  assert.strictEqual(
    state.familyReadiness.state,
    SIGNAL_STATES.AVAILABLE
  );

  assert.deepEqual(
    state.familyReadiness.value,
    {
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
      ],
      familyReady: false,
    }
  );
}
function runTests() {
  testSignalStates();
  testPriorityTiers();
  testFallbackState();
  testCustomFallbackReason();
  testFamilyReadinessUnknown();
  testFamilyReadinessWithBlockers();
  testFamilyReadinessEligible();
  testFamilyInsightCandidatesUnknown();
  testFamilyInsightCandidatesWithBlockers();
  testFamilyInsightCandidatesReady();
  testFamilyReadinessTransitionsWithoutHistory();
  testFamilyReadinessTransitionsIndividualReady();
  testFamilyReadinessTransitionsRemainReady();
  testRecognitionCandidatesWithoutTransitions();
  testRecognitionCandidatesIndividual();
  testRecognitionCandidatesFamily();
  testFamilyIntelligencePipeline();
  testEvaluation();
  testCreateSignal();
  testDailyFocusSelection();
  testQuietStateSelection();
  testContextNormalization();
  testPhaseSignal();
  testPhaseFocusCandidate();
  testUnknownPhaseFocus();

   console.log("Adventure Brain foundation tests passed.");

}
function testCreateSignal() {
  const signal = createSignal({
    id: "weather-risk",
    category: "weather",
    priorityTier: PRIORITY_TIERS.SAFETY_OR_SERIOUS_WEATHER,
    active: true,
    state: SIGNAL_STATES.AVAILABLE,
  });

  assert.strictEqual(signal.id, "weather-risk");
  assert.strictEqual(signal.active, true);
  assert.strictEqual(
    signal.priorityTier,
    1
  );
}


function testDailyFocusSelection() {
  const focus = selectDailyFocus([
    createFocusCandidate({
      id: "tomorrow-packing",
      priorityTier: PRIORITY_TIERS.TOMORROW_PREPARATION,
      category: "packing",
      title: "Prepare tomorrow",
      message: "Prepare ahead.",
    }),

    createFocusCandidate({
      id: "reservation",
      priorityTier:
        PRIORITY_TIERS.CONFIRMED_RESERVATION_OR_TRAVEL_REQUIREMENT,
      category: "timing",
      title: "Confirmed reservation",
      message: "A reservation is approaching.",
    }),
  ]);

  assert.strictEqual(
    focus.id,
    "reservation"
  );
}


function testQuietStateSelection() {
  const focus = selectDailyFocus([]);

  assert.strictEqual(
    focus,
    null
  );
}

function testContextNormalization() {
  const context = normalizeContext({
    phase: {
      id: "planning",
      state: SIGNAL_STATES.AVAILABLE,
    },
  });

  assert.strictEqual(
    context.phase.id,
    "planning"
  );

  assert.strictEqual(
    context.weather.state,
    SIGNAL_STATES.UNKNOWN
  );

  assert.strictEqual(
    context.packing.state,
    SIGNAL_STATES.UNKNOWN
  );
}

function testPhaseSignal() {
  const signal = createPhaseSignal({
    id: "planning",
    state: SIGNAL_STATES.AVAILABLE,
  });

  assert.strictEqual(
    signal.id,
    "phase-planning"
  );

  assert.strictEqual(
    signal.category,
    "phase"
  );
}


function testPhaseFocusCandidate() {
  const focus = createPhaseFocusCandidate({
    id: "experiencing",
  });

  assert.strictEqual(
    focus.category,
    "phase"
  );

  assert.strictEqual(
    focus.priorityTier,
    PRIORITY_TIERS.ADVENTURE_DISCOVERY_OR_ENCOURAGEMENT
  );
}


function testUnknownPhaseFocus() {
  const focus = createPhaseFocusCandidate({
    id: "unknown-phase",
  });

  assert.strictEqual(
    focus,
    null
  );
}


runTests();