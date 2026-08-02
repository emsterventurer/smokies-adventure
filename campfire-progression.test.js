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

  assert.equal(
    planningProgression.currentMilestone.id,
    "journey-begins",
    "The current milestone should be the latest unlocked journey milestone",
  );

  assert.equal(
    planningProgression.nextMilestone.id,
    "one-week-left",
    "The next milestone should be the first locked journey milestone",
  );

  assert.equal(
    oneWeekProgression.currentMilestone.id,
    "one-week-left",
    "One Week Left should become the current journey milestone",
  );

  assert.equal(
    oneWeekProgression.nextMilestone.id,
    "road-trip-begins",
    "Achievement milestones should not block the emotional journey sequence",
  );

  assert.equal(
    packedProgression.currentMilestone.id,
    "one-week-left",
    "Packing completion should not replace the current journey milestone",
  );

  assert.equal(
    packedProgression.currentAchievement.id,
    "ready-to-roll",
    "Ready to Roll should be reported as the current achievement",
  );

  assert.equal(
    departureProgression.currentMilestone.id,
    "road-trip-begins",
    "Road Trip Begins should become the current milestone on departure day",
  );

  assert.equal(
    finalDayProgression.currentMilestone.id,
    "adventure-complete",
    "Adventure Complete should become the current milestone on the final day",
  );

  assert.equal(
    finalDayProgression.nextMilestone,
    null,
    "There should be no next journey milestone after Adventure Complete",
  );

  console.log(
    "Campfire progression tests passed.",
  );
}

runTests();
