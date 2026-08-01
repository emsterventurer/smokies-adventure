(function () {
"use strict";

const REQUIRED_METHODS = Object.freeze([
  "loadAdventureRecord",
  "saveAdventureRecord",
  "listAdventureRecords",
  "deleteAdventureRecord",
  "hasAdventureRecord",
]);

function isAdventureProvider(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    REQUIRED_METHODS.every(
      (methodName) =>
        typeof value[methodName] === "function",
    )
  );
}

function requireAdventureProvider(value) {
  if (!isAdventureProvider(value)) {
    throw new TypeError(
      "A valid Adventure Provider is required.",
    );
  }

  return value;
}

const AdventureProvider = Object.freeze({
  REQUIRED_METHODS,
  isAdventureProvider,
  requireAdventureProvider,
});

if (
  typeof module !== "undefined" &&
  module.exports
) {
  module.exports = AdventureProvider;
}

if (typeof window !== "undefined") {
  window.AdventureProvider = AdventureProvider;
}
})();
