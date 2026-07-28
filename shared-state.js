(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.SharedState = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STATES = Object.freeze({
    AVAILABLE: "available",
    UNAVAILABLE: "unavailable",
    UNKNOWN: "unknown",
  });

  function normalizeFamilyReadiness(input = {}) {
    const adventurers = Array.isArray(input.adventurers)
      ? input.adventurers
          .filter((adventurer) => adventurer && adventurer.id)
          .map((adventurer) => ({
            id: String(adventurer.id),
            name: String(adventurer.name ?? adventurer.id),
            ready: adventurer.ready === true,
          }))
      : [];

    const hasFamilyData = adventurers.length > 0;

    return {
      state: hasFamilyData ? STATES.AVAILABLE : STATES.UNKNOWN,
      value: {
        adventurers,
        familyReady:
          hasFamilyData &&
          adventurers.every((adventurer) => adventurer.ready === true),
      },
    };
  }

  return Object.freeze({
    STATES,
    normalizeFamilyReadiness,
  });
});