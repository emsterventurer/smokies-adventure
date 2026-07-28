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