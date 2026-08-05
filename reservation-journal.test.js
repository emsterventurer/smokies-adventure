"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
);
const ActiveAdventure = require(
  "./adventure/active-adventure.js",
);
const ReservationSync = require(
  "./adventure/reservation-sync.js",
);
const ReservationJournal = require(
  "./adventure/reservation-journal.js",
);

function createTestJournal(options = {}) {
  const storageProvider =
    AdventureStorage.createMemoryStorage();

  const adventureStorage =
    AdventureStorage.createAdventureStorage({
      storageProvider,
    });

  const activeAdventureService =
    ActiveAdventure.createActiveAdventureService({
      adventureStorage,
      selectionStorage: storageProvider,
      seedFactory:
        AdventureData.createSmokiesAdventureRecord,
    });

  activeAdventureService.loadActiveAdventure();

  const legacyStorage =
    options.legacyStorage || {
      getItem() {
        return null;
      },
      removeItem() {},
    };

  const journal =
   ReservationJournal.createReservationJournal({
    activeAdventureService,
    legacyStorage,
    reservationSync: ReservationSync,
    now:
      options.now ||
      (() => "2026-08-05T14:30:00-04:00"),
  });

  return {
    journal,
    activeAdventureService,
  };
}

test("requires a valid Active Adventure Service", () => {
  assert.throws(
    () =>
      ReservationJournal.createReservationJournal(),
    {
      message:
        "A valid activeAdventureService is required.",
    },
  );
});

test("saves a reservation through the active Adventure Service", () => {
  const {
    journal,
    activeAdventureService,
  } = createTestJournal();

  const saved = journal.saveReservation({
    date: "2026-08-07",
    name: "Local Goat",
    confirmation: "ABC123",
    status: "Confirmed",
  });

  assert.equal(
    saved.confirmation,
    "ABC123",
  );

  const activeAdventure =
    activeAdventureService.getActiveAdventure();

  assert.equal(
    activeAdventure.reservations.items.length,
    1,
  );

  assert.equal(
    activeAdventure.reservations.items[0].id,
    "2026-08-07::Local Goat",
  );

  assert.equal(
    activeAdventure.reservations.items[0]
      .confirmation,
    "ABC123",
  );
});

test("lists shared reservations from the active Adventure Record", () => {
  const {
    journal,
  } = createTestJournal();

  journal.saveReservation({
    date: "2026-08-12",
    name: "Legacy Mountain Ziplines",
    confirmation: "ZIP1030",
  });

  assert.deepEqual(
    journal.listReservations(),
    [
      {
        date: "2026-08-12",
        name: "Legacy Mountain Ziplines",
        confirmation: "ZIP1030",
        id:
          "2026-08-12::Legacy Mountain Ziplines",
        updatedAt:
          "2026-08-05T14:30:00-04:00",
      },
    ],
  );
});

test("migrates legacy browser overrides into the Adventure Record", () => {
  let removedKey = null;

  const legacyStorage = {
    getItem(key) {
      if (
        key !==
        "adventureCompanionReservationOverridesV1"
      ) {
        return null;
      }

      return JSON.stringify({
        "2026-08-07::1::Local Goat": {
          confirmation: "LOCAL123",
          status: "Confirmed",
          notes: "Window table requested.",
          updatedAt:
            "2026-08-04T12:00:00-04:00",
        },
      });
    },

    removeItem(key) {
      removedKey = key;
    },
  };

  const {
    journal,
    activeAdventureService,
  } = createTestJournal({
    legacyStorage,
  });

  const result =
    journal.migrateLegacyOverrides();

  assert.equal(result.migrated, 1);

  const items =
    activeAdventureService.getActiveAdventure()
      .reservations.items;

  assert.equal(items.length, 1);
  assert.deepEqual(items[0], {
    confirmation: "LOCAL123",
    status: "Confirmed",
    notes: "Window table requested.",
    updatedAt:
      "2026-08-04T12:00:00-04:00",
    date: "2026-08-07",
    name: "Local Goat",
    id: "2026-08-07::Local Goat",
  });

  assert.equal(
    removedKey,
    "adventureCompanionReservationOverridesV1",
  );
});

test("legacy migration is idempotent", () => {
  const legacyStorage = {
    getItem() {
      return JSON.stringify({
        "2026-08-07::1::Local Goat": {
          confirmation: "LOCAL123",
        },
      });
    },

    removeItem() {},
  };

  const {
    journal,
    activeAdventureService,
  } = createTestJournal({
    legacyStorage,
  });

  journal.migrateLegacyOverrides();
  journal.migrateLegacyOverrides();

  assert.equal(
    activeAdventureService.getActiveAdventure()
      .reservations.items.length,
    1,
  );
});
