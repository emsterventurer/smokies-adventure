(function () {
"use strict";

const LEGACY_RESERVATION_OVERRIDES_KEY =
  "adventureCompanionReservationOverridesV1";

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function createReservationJournal(options = {}) {
  const activeAdventureService =
    options.activeAdventureService;

  if (
    !activeAdventureService ||
    typeof activeAdventureService
      .getActiveAdventure !== "function" ||
    typeof activeAdventureService
      .saveActiveAdventure !== "function"
  ) {
    throw new TypeError(
      "A valid activeAdventureService is required.",
    );
  }

  const legacyStorage =
    options.legacyStorage ||
    (
      typeof localStorage !== "undefined"
        ? localStorage
        : null
    );

  const now =
    typeof options.now === "function"
      ? options.now
      : () => new Date().toISOString();

  const reservationSync =
    options.reservationSync ||
    (
      typeof ReservationSync !== "undefined"
        ? ReservationSync
        : null
    );

  if (
    !reservationSync ||
    typeof reservationSync
      .createReservationId !== "function" ||
    typeof reservationSync
      .updateAdventureReservation !== "function"
  ) {
    throw new TypeError(
      "A valid ReservationSync service is required.",
    );
  }

  function requireActiveAdventure() {
    const adventure =
      activeAdventureService.getActiveAdventure();

    if (!adventure) {
      throw new Error(
        "An active Adventure Record is required.",
      );
    }

    return adventure;
  }

  function listReservations() {
    const adventure =
      requireActiveAdventure();

    return Array.isArray(
      adventure?.reservations?.items,
    )
      ? cloneValue(
          adventure.reservations.items,
        )
      : [];
  }

  function saveReservation(input = {}) {
    const adventure =
      requireActiveAdventure();

    const date =
      String(input.date ?? "").trim();
    const name =
      String(input.name ?? "").trim();

    if (!date || !name) {
      throw new TypeError(
        "Reservation date and name are required.",
      );
    }

    const reservation = {
      ...cloneValue(input),
      date,
      name,
      id:
        input.id ||
        reservationSync.createReservationId(
          date,
          name,
        ),
      updatedAt:
        input.updatedAt ||
        now(),
    };

    const nextAdventure =
      reservationSync
        .updateAdventureReservation(
          adventure,
          reservation,
        );

    activeAdventureService
      .saveActiveAdventure(nextAdventure);

    return cloneValue(reservation);
  }

  function parseLegacyReservationKey(key) {
    const parts =
      String(key ?? "").split("::");

    if (parts.length < 3) {
      return null;
    }

    const date =
      String(parts.shift() ?? "").trim();

    parts.shift();

    const name =
      parts.join("::").trim();

    if (!date || !name) {
      return null;
    }

    return {
      date,
      name,
    };
  }

  function readLegacyOverrides() {
    if (
      !legacyStorage ||
      typeof legacyStorage.getItem !==
        "function"
    ) {
      return {};
    }

    try {
      const raw =
        legacyStorage.getItem(
          LEGACY_RESERVATION_OVERRIDES_KEY,
        );

      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);

      return (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      )
        ? parsed
        : {};
    } catch (error) {
      return {};
    }
  }

  function migrateLegacyOverrides() {
    const overrides =
      readLegacyOverrides();

    let migrated = 0;

    Object.entries(overrides).forEach(
      ([key, values]) => {
        const identity =
          parseLegacyReservationKey(key);

        if (
          !identity ||
          !values ||
          typeof values !== "object"
        ) {
          return;
        }

        saveReservation({
          ...cloneValue(values),
          ...identity,
          id:
            reservationSync
              .createReservationId(
                identity.date,
                identity.name,
              ),
        });

        migrated += 1;
      },
    );

    if (
      migrated > 0 &&
      legacyStorage &&
      typeof legacyStorage.removeItem ===
        "function"
    ) {
      legacyStorage.removeItem(
        LEGACY_RESERVATION_OVERRIDES_KEY,
      );
    }

    return {
      migrated,
    };
  }

  return Object.freeze({
    listReservations,
    saveReservation,
    migrateLegacyOverrides,
  });
}

const ReservationJournal = Object.freeze({
  createReservationJournal,
});

if (
  typeof module !== "undefined" &&
  module.exports
) {
  module.exports = ReservationJournal;
}

if (typeof window !== "undefined") {
  window.ReservationJournal =
    ReservationJournal;
}
})();
