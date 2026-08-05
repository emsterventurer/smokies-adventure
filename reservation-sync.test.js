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
test("builds a canonical list by merging shared items over defaults", () => {
  const defaultsByDate = {
    "2026-08-07": [
      {
        name: "Local Goat",
        icon: "🍽️",
        status: "Confirmed",
        time: "6:00 PM",
        notes: "Arrival-night dinner.",
      },
    ],
  };

  const sharedItems = [
    {
      id: "2026-08-07::Local Goat",
      date: "2026-08-07",
      name: "Local Goat",
      confirmation: "ABC123",
      notes: "Ask for the patio.",
    },
  ];

  assert.deepEqual(
    ReservationSync.buildReservationList(
      defaultsByDate,
      sharedItems,
    ),
    [
      {
        name: "Local Goat",
        icon: "🍽️",
        status: "Confirmed",
        time: "6:00 PM",
        notes: "Ask for the patio.",
        id: "2026-08-07::Local Goat",
        date: "2026-08-07",
        confirmation: "ABC123",
      },
    ],
  );
});

test("adds a stable identity and date to static reservation defaults", () => {
  const defaultsByDate = {
    "2026-08-12": [
      {
        name: "Legacy Mountain Ziplines",
        status: "Confirmed",
      },
    ],
  };

  assert.deepEqual(
    ReservationSync.buildReservationList(
      defaultsByDate,
      [],
    ),
    [
      {
        name: "Legacy Mountain Ziplines",
        status: "Confirmed",
        id:
          "2026-08-12::Legacy Mountain Ziplines",
        date: "2026-08-12",
      },
    ],
  );
});

test("updates one reservation without mutating the Adventure Record", () => {
  const adventure = {
    id: "smokies-2026",
    reservations: {
      items: [
        {
          id: "2026-08-07::Local Goat",
          date: "2026-08-07",
          name: "Local Goat",
          status: "Confirmed",
        },
      ],
    },
  };

  const nextAdventure =
    ReservationSync.updateAdventureReservation(
      adventure,
      {
        id: "2026-08-07::Local Goat",
        date: "2026-08-07",
        name: "Local Goat",
        confirmation: "ABC123",
      },
    );

  assert.notEqual(nextAdventure, adventure);
  assert.notEqual(
    nextAdventure.reservations,
    adventure.reservations,
  );
  assert.notEqual(
    nextAdventure.reservations.items,
    adventure.reservations.items,
  );

  assert.equal(
    adventure.reservations.items[0].confirmation,
    undefined,
  );

  assert.equal(
    nextAdventure.reservations.items[0]
      .confirmation,
    "ABC123",
  );
});

test("adds a reservation when no shared item exists yet", () => {
  const adventure = {
    id: "smokies-2026",
    reservations: {
      items: [],
    },
  };

  const nextAdventure =
    ReservationSync.updateAdventureReservation(
      adventure,
      {
        date: "2026-08-13",
        name: "The Greenbrier Restaurant",
        confirmation: "DINNER615",
      },
    );

  assert.deepEqual(
    nextAdventure.reservations.items,
    [
      {
        date: "2026-08-13",
        name: "The Greenbrier Restaurant",
        confirmation: "DINNER615",
        id:
          "2026-08-13::The Greenbrier Restaurant",
      },
    ],
  );
});
