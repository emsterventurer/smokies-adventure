(function () {
"use strict";

const ADVENTURER_DIRECTORY_SCHEMA_VERSION = 1;

const INITIAL_ADVENTURERS = Object.freeze([
  Object.freeze({
    id: "emily",
    displayName: "Emily",
    relationshipLabel: null,
    avatar: null,
    active: true,
  }),
  Object.freeze({
    id: "jake",
    displayName: "Jake",
    relationshipLabel: "Son",
    avatar: null,
    active: true,
  }),
  Object.freeze({
    id: "kaseryn",
    displayName: "Kaseryn",
    relationshipLabel: "Daughter",
    avatar: null,
    active: true,
  }),
  Object.freeze({
    id: "bubbe",
    displayName: "Bubbe",
    relationshipLabel: "Mother",
    avatar: null,
    active: true,
  }),
  Object.freeze({
    id: "papa",
    displayName: "Papa",
    relationshipLabel: "Father",
    avatar: null,
    active: true,
  }),
  Object.freeze({
    id: "carolyn",
    displayName: "Carolyn",
    relationshipLabel: null,
    avatar: null,
    active: true,
  }),
]);

function cloneAdventurer(adventurer) {
  return {
    ...adventurer,
  };
}

function createInitialAdventurerDirectory() {
  return {
    schemaVersion: ADVENTURER_DIRECTORY_SCHEMA_VERSION,
    adventurers: INITIAL_ADVENTURERS.map(cloneAdventurer),
  };
}

const AdventurerDirectory = Object.freeze({
  SCHEMA_VERSION: ADVENTURER_DIRECTORY_SCHEMA_VERSION,
  INITIAL_ADVENTURERS,
  createInitialAdventurerDirectory,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventurerDirectory;
}

if (typeof window !== "undefined") {
  window.AdventurerDirectory = AdventurerDirectory;
}
})();
