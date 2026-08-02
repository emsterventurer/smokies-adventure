(function (root, factory) {
  const api = factory();

  if (
    typeof module === "object" &&
    module.exports
  ) {
    module.exports = api;
  }

  root.CampfireProgression = api;
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : this,
  function () {
    "use strict";

    const MILESTONES = Object.freeze([
      Object.freeze({
        id: "journey-begins",
        title: "The Journey Begins",
        icon: "🌱",
        type: "journey",
      }),
      Object.freeze({
        id: "one-week-left",
        title: "One Week Left",
        icon: "📅",
        type: "journey",
      }),
      Object.freeze({
        id: "ready-to-roll",
        title: "Ready to Roll",
        icon: "🎒",
        type: "achievement",
      }),
      Object.freeze({
        id: "road-trip-begins",
        title: "Road Trip Begins",
        icon: "🚗",
        type: "journey",
      }),
      Object.freeze({
        id: "first-sunrise",
        title: "First Sunrise",
        icon: "🌄",
        type: "journey",
      }),
      Object.freeze({
        id: "adventure-complete",
        title: "Adventure Complete",
        icon: "🏕️",
        type: "journey",
      }),
    ]);

  function toLocalDate(value) {
      if (!value) {
        return null;
      }

      if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        const [
          year,
          month,
          day,
        ] = value
          .split("-")
          .map(Number);

        return new Date(
          year,
          month - 1,
          day,
        );
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
    }

    function addDays(date, amount) {
      if (!date) {
        return null;
      }

      const result = new Date(date);
      result.setDate(result.getDate() + amount);

      return result;
    }

    function isOnOrAfter(date, threshold) {
      return Boolean(
        date &&
          threshold &&
          date.getTime() >= threshold.getTime(),
      );
    }

    function evaluate({
      startDate,
      endDate,
      now = new Date(),
      packingComplete = false,
      adventureStarted = false,
    } = {}) {
      const currentDate = toLocalDate(now);
      const departureDate = toLocalDate(startDate);
      const completionDate = toLocalDate(endDate);

      const oneWeekDate = addDays(
        departureDate,
        -7,
      );

      const firstMorningDate = addDays(
        departureDate,
        1,
      );

      const unlockedById = {
        "journey-begins": Boolean(
          departureDate,
        ),

        "one-week-left": isOnOrAfter(
          currentDate,
          oneWeekDate,
        ),

        "ready-to-roll": Boolean(
          packingComplete,
        ),

        "road-trip-begins":
          Boolean(adventureStarted) ||
          isOnOrAfter(
            currentDate,
            departureDate,
          ),

        "first-sunrise": isOnOrAfter(
          currentDate,
          firstMorningDate,
        ),

        "adventure-complete": isOnOrAfter(
          currentDate,
          completionDate,
        ),
      };

      const milestones = MILESTONES.map(
        (milestone) => ({
          ...milestone,
          unlocked: Boolean(
            unlockedById[milestone.id],
          ),
        }),
      );

            const journeyMilestones =
        milestones.filter(
          (milestone) =>
            milestone.type === "journey",
        );

      const achievementMilestones =
        milestones.filter(
          (milestone) =>
            milestone.type === "achievement",
        );

      const unlockedJourneyMilestones =
        journeyMilestones.filter(
          (milestone) =>
            milestone.unlocked,
        );

      const unlockedAchievements =
        achievementMilestones.filter(
          (milestone) =>
            milestone.unlocked,
        );

      const currentPhase =
        unlockedJourneyMilestones.at(-1) ??
        null;

      const nextMilestone =
        journeyMilestones.find(
          (milestone) =>
            !milestone.unlocked,
        ) ?? null;

      const currentAchievement =
        unlockedAchievements.at(-1) ??
        null;

      const featuredCampfire =
        currentPhase?.id ===
          "one-week-left"
          ? journeyMilestones.find(
              (milestone) =>
                milestone.id ===
                "journey-begins",
            ) ?? currentPhase
          : currentPhase;

      return {
        milestones,

        unlockedMilestones:
          milestones.filter(
            (milestone) =>
              milestone.unlocked,
          ),

        lockedMilestones:
          milestones.filter(
            (milestone) =>
              !milestone.unlocked,
          ),

        currentMilestone:
          currentPhase,
        currentPhase,
        featuredCampfire,
        nextMilestone,
        currentAchievement,
      };
    }

    return Object.freeze({
      MILESTONES,
      toLocalDate,
      addDays,
      isOnOrAfter,
      evaluate,
    });
  },
);
