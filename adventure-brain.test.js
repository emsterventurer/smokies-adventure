"use strict";

const assert = require("assert");
const {
  SIGNAL_STATES,
  PRIORITY_TIERS,
  createFallbackState,
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

function runTests() {
  testSignalStates();
  testPriorityTiers();
  testFallbackState();
  testCustomFallbackReason();

  console.log("Adventure Brain foundation tests passed.");
}

runTests();