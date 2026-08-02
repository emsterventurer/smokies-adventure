const assert = require("node:assert/strict");
const CampfireProgression = require("./adventure/campfire-progression");

function milestoneById(progression, id) {
  return progression.milestones.find(
    (milestone) => milestone.id === id,
  );
}

function runTests() {
  assert.ok(
    CampfireProgression,
    "Campfire Progression should export an API",
  );

  const planningProgression =
    CampfireProgression.evaluate({
      startDate: "2026-08-07",
      endDate: "2026-08-14",
      now: "2026-07-20T12:00:00-04:00",
      packingComplete: false,
      adventureStarted: false,
    });

  assert.equal(
    milestoneById(
      planningProgression,
      "journey-begins",
    ).unlocked,
    true,
    "The Journey Begins should unlock during planning",
  );

  assert.equal(
    milestoneById(
      planningProgression,
      "one-week-left",
    ).unlocked,
    false,
    "One Week Left should remain locked more than seven days before departure",
  );

  const oneWeekProgression =
    CampfireProgression.evaluate({
      startDate: "2026-08-07",
      endDate: "2026-08-14",
      now: "2026-08-01T12:00:00-04:00",
      packingComplete: false,
      adventureStarted: false,
    });

  assert.equal(
    milestoneById(
      oneWeekProgression,
      "one-week-left",
    ).unlocked,
    true,
    "One Week Left should unlock within seven days of departure",
  );

  assert.equal(
    milestoneById(
      oneWeekProgression,
      "ready-to-roll",
    ).unlocked,
    false,
    "Ready to Roll should remain locked until packing is complete",
  );

  const packedProgression =
    CampfireProgression.evaluate({
      startDate: "2026-08-07",
      endDate: "2026-08-14",
      now: "2026-08-02T12:00:00-04:00",
      packingComplete: true,
      adventureStarted: false,
    });

  assert.equal(
    milestoneById(
      packedProgression,
      "ready-to-roll",
    ).unlocked,
    true,
    "Ready to Roll should unlock when family packing is complete",
  );

  const departureProgression =
    CampfireProgression.evaluate({
      startDate: "2026-08-07",
      endDate: "2026-08-14",
      now: "2026-08-07T08:00:00-04:00",
      packingComplete: false,
      adventureStarted: false,
    });

  assert.equal(
    milestoneById(
      departureProgression,
      "road-trip-begins",
    ).unlocked,
    true,
    "Road Trip Begins should unlock on departure day",
  );

  const explicitlyStartedProgression =
    CampfireProgression.evaluate({
      startDate: "2026-08-07",
      endDate: "2026-08-14",
      now: "2026-08-05T12:00:00-04:00",
      packingComplete: false,
      adventureStarted: true,
    });

  assert.equal(
    milestoneById(
      explicitlyStartedProgression,
      "road-trip-begins",
    ).unlocked,
    true,
    "Road Trip Begins should unlock when the Adventure is explicitly started",
  );

  const firstMorningProgression =
    CampfireProgression.evaluate({
      startDate: "2026-08-07",
      endDate: "2026-08-14",
      now: "2026-08-08T08:00:00-04:00",
      packingComplete: false,
      adventureStarted: true,
    });

  assert.equal(
    milestoneById(
      firstMorningProgression,
      "first-sunrise",
    ).unlocked,
    true,
    "First Sunrise should unlock on the first morning after departure",
  );

  const finalDayProgression =
    CampfireProgression.evaluate({
      startDate: "2026-08-07",
      endDate: "2026-08-14",
      now: "2026-08-14T18:00:00-04:00",
      packingComplete: false,
      adventureStarted: true,
    });

  assert.equal(
    milestoneById(
      finalDayProgression,
      "adventure-complete",
    ).unlocked,
    true,
    "Adventure Complete should unlock on the final day",
  );

  assert.deepEqual(
    planningProgression.milestones.map(
      (milestone) => milestone.id,
    ),
    [
      "journey-begins",
      "one-week-left",
      "ready-to-roll",
      "road-trip-begins",
      "first-sunrise",
      "adventure-complete",
    ],
    "Campfire milestones should remain in journey order",
  );

  console.log(
    "Campfire progression tests passed.",
  );
}

runTests();
