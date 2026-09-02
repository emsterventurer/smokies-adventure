"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventurerDirectory = require(
  "./adventure/adventurer-directory.js",
);
const AdventureInvitation = require(
  "./adventure/adventure-invitation.js",
);

function createElement() {
  const listeners = {};

  return {
    value: "",
    textContent: "",
    hidden: false,
    disabled: false,
    children: [],
    appendChild(child) {
      this.children.push(child);
    },
    replaceChildren(...children) {
      this.children = [...children];
    },
    addEventListener(name, listener) {
      listeners[name] = listener;
    },
    dispatch(name) {
      return listeners[name]?.({
        preventDefault() {},
      });
    },
  };
}

function createHarness(options = {}) {
  const elements = {
    "#adventureInvitationPanel": createElement(),
    "#adventureInvitationForm": createElement(),
    "#adventureInvitationTarget": createElement(),
    "#adventureInvitationEmail": createElement(),
    "#adventureInvitationSubmit": createElement(),
    "#adventureInvitationStatus": createElement(),
  };
  const document = {
    querySelector(selector) {
      return elements[selector] ?? null;
    },
    createElement() {
      return createElement();
    },
  };
  const calls = [];
  const adventure = options.adventure ??
    AdventureData.prepareBundledAdventureRecord(
      AdventureData.createPacificCoastAdventureRecord(),
    );

  return {
    adventure,
    elements,
    calls,
    initialize(overrides = {}) {
      return AdventureInvitation.initializeAdventureInvitation({
        document,
        adventure,
        adventurers:
          AdventurerDirectory.INITIAL_ADVENTURERS,
        activeAdventurerId: "emily",
        isAdventureAdmin: true,
        createInvitation(input) {
          calls.push(input);
          return Promise.resolve({ status: "pending" });
        },
        ...overrides,
      });
    },
  };
}

test("hides invitation controls from non-admin users", () => {
  const harness = createHarness();
  const result = harness.initialize({
    isAdventureAdmin: false,
  });

  assert.equal(result.visible, false);
  assert.equal(
    harness.elements["#adventureInvitationPanel"].hidden,
    true,
  );
});

test("derives Pacific invite targets from canonical participants and includes Carolyn", () => {
  const harness = createHarness();
  const before = JSON.stringify(harness.adventure);
  const result = harness.initialize();

  assert.equal(result.visible, true);
  assert.deepEqual(
    result.targets.map((target) => target.id),
    ["carolyn"],
  );
  assert.deepEqual(
    harness.elements["#adventureInvitationTarget"].children.map(
      (option) => [option.value, option.textContent],
    ),
    [
      ["", "Choose a traveler"],
      ["carolyn", "Carolyn"],
    ],
  );
  assert.equal(JSON.stringify(harness.adventure), before);
});

test("excludes the bound admin and keeps Carolyn out of Smokies targets", () => {
  const smokies =
    AdventureData.createSmokiesAdventureRecord();
  const harness = createHarness({ adventure: smokies });
  const result = harness.initialize();

  assert.equal(
    result.targets.some((target) => target.id === "emily"),
    false,
  );
  assert.equal(
    result.targets.some((target) => target.id === "carolyn"),
    false,
  );
  assert.deepEqual(
    result.targets.map((target) => target.id),
    ["jake", "kaseryn", "bubbe", "papa"],
  );
});

test("requires a canonical target and email before calling the backend", async () => {
  const harness = createHarness();
  harness.initialize();

  await harness.elements[
    "#adventureInvitationForm"
  ].dispatch("submit");

  assert.deepEqual(harness.calls, []);
  assert.equal(
    harness.elements["#adventureInvitationStatus"].textContent,
    "Choose a traveler and enter their email address.",
  );
});

test("submits current Adventure values once and clears email only after success", async () => {
  const harness = createHarness();
  let resolveInvitation;
  harness.initialize({
    createInvitation(input) {
      harness.calls.push(input);
      return new Promise((resolve) => {
        resolveInvitation = resolve;
      });
    },
  });
  const form = harness.elements["#adventureInvitationForm"];
  const target = harness.elements["#adventureInvitationTarget"];
  const email = harness.elements["#adventureInvitationEmail"];
  target.value = "carolyn";
  email.value = "  traveler@example.com  ";

  const first = form.dispatch("submit");
  await form.dispatch("submit");

  assert.deepEqual(harness.calls, [
    {
      adventureId: "pacific-coast-2026",
      adventurerId: "carolyn",
      email: "traveler@example.com",
    },
  ]);
  assert.equal(
    harness.elements["#adventureInvitationSubmit"].disabled,
    true,
  );
  assert.equal(email.value, "  traveler@example.com  ");

  resolveInvitation({ status: "pending" });
  await first;

  assert.equal(email.value, "");
  assert.equal(
    harness.elements["#adventureInvitationStatus"].textContent,
    "Invitation ready. Share the Adventure Companion link with this traveler.",
  );
  assert.equal(
    harness.elements["#adventureInvitationSubmit"].disabled,
    false,
  );
});

test("shows a safe retry message without echoing or clearing failed email", async () => {
  const harness = createHarness();
  harness.initialize({
    createInvitation() {
      return Promise.reject(new Error("sensitive backend detail"));
    },
  });
  const target = harness.elements["#adventureInvitationTarget"];
  const email = harness.elements["#adventureInvitationEmail"];
  target.value = "carolyn";
  email.value = "traveler@example.com";

  await harness.elements[
    "#adventureInvitationForm"
  ].dispatch("submit");

  assert.equal(email.value, "traveler@example.com");
  assert.equal(
    harness.elements["#adventureInvitationStatus"].textContent,
    "We couldn't prepare that invitation. Please try again.",
  );
  assert.doesNotMatch(
    harness.elements["#adventureInvitationStatus"].textContent,
    /traveler|sensitive backend detail/i,
  );
});

test("loads the invitation module in CURRENT ADVENTURE without persistence APIs", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const app = fs.readFileSync("app.js", "utf8");
  const styles = fs.readFileSync("styles.css", "utf8");
  const source = fs.readFileSync(
    "adventure/adventure-invitation.js",
    "utf8",
  );

  assert.match(html, /id="adventureInvitationPanel"[^>]*hidden/);
  assert.ok(
    html.indexOf("adventure/adventure-invitation.js") <
      html.indexOf('src="app.js"'),
  );
  assert.doesNotMatch(
    source,
    /localStorage|sessionStorage|indexedDB|console\./,
  );
  assert.match(
    app,
    /initializeAdventureInvitationExperience\([\s\S]*hasAdventureAdminClaim/,
  );
  assert.match(
    styles,
    /@media \(max-width: 520px\)[\s\S]*\.adventureInvitationForm[\s\S]*grid-template-columns: 1fr/,
  );
});
