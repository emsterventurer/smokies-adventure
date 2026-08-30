"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  initializeAdventureSwitcher,
} = require("./adventure/adventure-switcher.js");
const AdventureItinerary = require(
  "./adventure/adventure-itinerary.js",
);

function createElement() {
  const listeners = {};

  return {
    value: "",
    textContent: "",
    hidden: false,
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
    replaceChildren() {
      this.children = [];
    },
    addEventListener(name, listener) {
      listeners[name] = listener;
    },
    dispatch(name) {
      listeners[name]?.();
    },
  };
}

function createHarness(
  activeAdventureId = "smokies-2026",
  activeItineraryDays = [],
) {
  const adventures = [
    { id: "smokies-2026", title: "Smokies 2026" },
    {
      id: "pacific-2027",
      title: "Pacific Coast 2027",
      itinerary: {
        days:
          activeAdventureId === "pacific-2027"
            ? activeItineraryDays
            : [],
      },
    },
  ];
  const elements = {
    "#adventureSwitcher": createElement(),
    "#activeAdventureTitle": createElement(),
    "#adventureUnavailable": createElement(),
    "#canonicalAdventureItinerary": createElement(),
  };
  const classes = new Set();
  const selections = [];
  let reloads = 0;

  const document = {
    body: {
      classList: {
        toggle(name, force) {
          if (force) classes.add(name);
          else classes.delete(name);
        },
      },
    },
    querySelector(selector) {
      return elements[selector] ?? null;
    },
    createElement() {
      return createElement();
    },
  };
  const activeAdventureService = {
    getActiveAdventureId() {
      return activeAdventureId;
    },
    getActiveAdventure() {
      return adventures.find(
        (adventure) => adventure.id === activeAdventureId,
      );
    },
    setActiveAdventureId(adventureId) {
      selections.push(adventureId);
      activeAdventureId = adventureId;
    },
  };

  return {
    adventures,
    elements,
    classes,
    selections,
    get reloads() {
      return reloads;
    },
    initialize() {
      return initializeAdventureSwitcher({
        document,
        adventures,
        activeAdventureService,
        selectActiveAdventure: (adventureId) =>
          activeAdventureService
            .setActiveAdventureId(adventureId),
        smokiesAdventureId: "smokies-2026",
        supportsCanonicalItinerary:
          (adventure) =>
            adventure?.itinerary?.days?.some(
              AdventureItinerary.isSupportedDay,
            ) === true,
        reload: () => {
          reloads += 1;
        },
      });
    },
  };
}

test("populates stored Adventures using canonical IDs and titles", () => {
  const harness = createHarness();
  harness.initialize();

  assert.deepEqual(
    harness.elements["#adventureSwitcher"].children.map(
      (option) => [option.value, option.textContent],
    ),
    [
      ["smokies-2026", "Smokies 2026"],
      ["pacific-2027", "Pacific Coast 2027"],
    ],
  );
});

test("selects and displays the active Adventure", () => {
  const harness = createHarness("pacific-2027");
  harness.initialize();

  assert.equal(
    harness.elements["#adventureSwitcher"].value,
    "pacific-2027",
  );
  assert.equal(
    harness.elements["#activeAdventureTitle"].textContent,
    "Pacific Coast 2027",
  );
});

test("persists a changed selection through the Active Adventure service and reloads", () => {
  const harness = createHarness();
  harness.initialize();

  const switcher = harness.elements["#adventureSwitcher"];
  switcher.value = "pacific-2027";
  switcher.dispatch("change");

  assert.deepEqual(harness.selections, ["pacific-2027"]);
  assert.equal(harness.reloads, 1);
});

test("hides Smokies-only UI for a non-Smokies Adventure", () => {
  const harness = createHarness("pacific-2027");
  const result = harness.initialize();
  const styles = fs.readFileSync(
    path.join(__dirname, "styles.css"),
    "utf8",
  );

  assert.equal(result.isSmokiesAdventure, false);
  assert.equal(
    harness.classes.has("nonSmokiesAdventure"),
    true,
  );
  assert.equal(
    harness.elements["#adventureUnavailable"].hidden,
    false,
  );
  assert.match(
    styles,
    /\.nonSmokiesAdventure main > :not\(\.top\):not\(#adventureUnavailable\)/,
  );
  assert.match(
    styles,
    /\.nonSmokiesAdventure \.top > :not\(:first-child\)/,
  );
  assert.match(styles, /\.nonSmokiesAdventure nav/);
  assert.match(
    styles,
    /\.nonSmokiesAdventure \.sideParty/,
  );
});

test("preserves the existing Smokies itinerary UI for Smokies", () => {
  const harness = createHarness();
  const result = harness.initialize();

  assert.equal(result.isSmokiesAdventure, true);
  assert.equal(
    harness.classes.has("nonSmokiesAdventure"),
    false,
  );
  assert.equal(
    harness.elements["#adventureUnavailable"].hidden,
    true,
  );
});

test("shows canonical itinerary UI for a non-Smokies Adventure with days", () => {
  const harness = createHarness(
    "pacific-2027",
    [
      {
        id: "2027-09-24",
        date: "2027-09-24",
        title: "Arrival day",
        summary: "Arrive and settle in.",
        routeLabel: "Airport → Coast",
        pace: "Easy",
        stops: [
          {
            id: "arrival",
            name: "Airport",
            kind: "arrival",
            timeLabel: "Time pending",
            priority: "required",
            navigationQuery: "Airport",
          },
        ],
      },
    ],
  );
  const result = harness.initialize();

  assert.equal(result.isSmokiesAdventure, false);
  assert.equal(result.hasCanonicalItinerary, true);
  assert.equal(
    harness.classes.has(
      "canonicalItineraryAdventure",
    ),
    true,
  );
  assert.equal(
    harness.elements["#adventureUnavailable"].hidden,
    true,
  );
  assert.equal(
    harness.elements["#canonicalAdventureItinerary"].hidden,
    false,
  );
});

test("app uses startup Adventure Storage and the existing service APIs", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(appSource, /startup\.adventureStorage/);
  assert.match(
    appSource,
    /\.adventureStorage[\s\S]*?\.listAdventureRecords\?\.\s*\(/,
  );
  assert.match(appSource, /setActiveAdventureId\?\.\s*\(/);
  assert.match(appSource, /getActiveAdventure\?\.\s*\(/);
});

test("provides the Adventure Switcher and unavailable-itinerary shell", () => {
  const indexHtml = fs.readFileSync(
    path.join(__dirname, "index.html"),
    "utf8",
  );

  assert.match(indexHtml, /id="adventureSwitcher"/);
  assert.match(indexHtml, /id="activeAdventureTitle"/);
  assert.match(indexHtml, /id="adventureUnavailable"/);
  assert.match(
    indexHtml,
    /Adventure itinerary is not available yet/,
  );
});
