"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const ReservationSync = require(
  "./adventure/reservation-sync.js",
);

test("creates a stable reservation identity from date and name", () => {
  assert.equal(
    ReservationSync.createReservationId(
      "2026-08-07",
      "Local Goat",
    ),
    "2026-08-07::Local Goat",
  );
});

test("reservation identity does not depend on list position", () => {
  const firstId =
    ReservationSync.createReservationId(
      "2026-08-07",
      "Local Goat",
    );

  const reorderedId =
    ReservationSync.createReservationId(
      "2026-08-07",
      "Local Goat",
    );

  assert.equal(firstId, reorderedId);
});

test("merges shared reservation fields over static defaults", () => {
  const defaults = {
    date: "2026-08-07",
    name: "Local Goat",
    icon: "🍽️",
    time: "6:00 PM",
    status: "Confirmed",
    phone: "",
    website: "https://localgoatpf.com/",
    notes: "Arrival-night dinner.",
  };

  const shared = {
    id: "2026-08-07::Local Goat",
    date: "2026-08-07",
    name: "Local Goat",
    confirmation: "ABC123",
    status: "Action Needed",
    phone: "865-555-0100",
    parkingNotes: "Use the rear lot.",
  };

  assert.deepEqual(
    ReservationSync.mergeReservation(
      defaults,
      shared,
    ),
    {
      ...defaults,
      ...shared,
    },
  );
});

test("returns static defaults when no shared reservation exists", () => {
  const defaults = {
    date: "2026-08-12",
    name: "Legacy Mountain Ziplines",
    status: "Confirmed",
    time: "10:30 AM",
  };

  assert.deepEqual(
    ReservationSync.mergeReservation(
      defaults,
      null,
    ),
    defaults,
  );
});

test("finds a shared reservation by stable identity", () => {
  const items = [
    {
      id: "2026-08-07::Local Goat",
      date: "2026-08-07",
      name: "Local Goat",
      confirmation: "ABC123",
    },
  ];

  assert.deepEqual(
    ReservationSync.findSharedReservation(
      items,
      "2026-08-07",
      "Local Goat",
    ),
    items[0],
  );
});
