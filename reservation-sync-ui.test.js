"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("saves reservation edits through the Reservation Journal", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /RESERVATION_JOURNAL\s*\.\s*saveReservation\(\s*reservation\s*\)/,
  );

  const journalSource = fs.readFileSync(
    path.join(
      __dirname,
      "adventure",
      "reservation-journal.js",
    ),
    "utf8",
  );

  assert.match(
    journalSource,
    /saveActiveAdventure\(\s*nextAdventure\s*\)/,
  );
});

test("reads reservation edits from the active Adventure Record", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /activeAdventure\?\.reservations\?\.items/,
  );
});

test("refreshes reservation views after a cloud update", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /CURRENT_VIEW\s*===\s*["']reservations["']/,
  );

  assert.match(
    appSource,
    /CURRENT_VIEW\s*===\s*["']reservation-manager["']/,
  );
});
