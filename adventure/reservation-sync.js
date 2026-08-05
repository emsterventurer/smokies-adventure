(function () {
"use strict";

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function normalizeIdentityPart(value) {
  return String(value ?? "").trim();
}

function createReservationId(date, name) {
  const normalizedDate =
    normalizeIdentityPart(date);
  const normalizedName =
    normalizeIdentityPart(name);

  return `${normalizedDate}::${normalizedName}`;
}

function mergeReservation(
  defaults,
  sharedReservation,
) {
  if (!sharedReservation) {
    return {
      ...defaults,
    };
  }

  return {
    ...defaults,
    ...sharedReservation,
  };
}

function findSharedReservation(
  items,
  date,
  name,
) {
  if (!Array.isArray(items)) {
    return null;
  }

  const reservationId =
    createReservationId(date, name);

  return (
    items.find((item) => {
      const itemId =
        item?.id ||
        createReservationId(
          item?.date,
          item?.name,
        );

      return itemId === reservationId;
    }) || null
  );
}

function buildReservationList(
  defaultsByDate,
  sharedItems,
) {
  const defaults =
    defaultsByDate &&
    typeof defaultsByDate === "object"
      ? defaultsByDate
      : {};

  const shared = Array.isArray(sharedItems)
    ? sharedItems
    : [];

  return Object.entries(defaults).flatMap(
    ([date, items]) =>
      (Array.isArray(items) ? items : []).map(
        (item) => {
          const defaultReservation = {
            ...item,
            id: createReservationId(
              date,
              item?.name,
            ),
            date,
          };

          const sharedReservation =
            findSharedReservation(
              shared,
              date,
              item?.name,
            );

          return mergeReservation(
            defaultReservation,
            sharedReservation,
          );
        },
      ),
  );
}

function updateAdventureReservation(
  adventure,
  reservation,
) {
  if (!adventure || typeof adventure !== "object") {
    throw new TypeError(
      "A valid Adventure Record is required.",
    );
  }

  if (
    !reservation ||
    typeof reservation !== "object"
  ) {
    throw new TypeError(
      "A valid reservation is required.",
    );
  }

  const reservationId =
    reservation.id ||
    createReservationId(
      reservation.date,
      reservation.name,
    );

  const nextReservation = {
    ...cloneValue(reservation),
    id: reservationId,
  };

  const currentItems = Array.isArray(
    adventure?.reservations?.items,
  )
    ? adventure.reservations.items
    : [];

  const existingIndex =
    currentItems.findIndex((item) => {
      const itemId =
        item?.id ||
        createReservationId(
          item?.date,
          item?.name,
        );

      return itemId === reservationId;
    });

  const nextItems = cloneValue(currentItems);

  if (existingIndex >= 0) {
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...nextReservation,
    };
  } else {
    nextItems.push(nextReservation);
  }

  return {
    ...adventure,
    reservations: {
      ...adventure.reservations,
      items: nextItems,
    },
  };
}

const ReservationSync = Object.freeze({
  createReservationId,
  mergeReservation,
  findSharedReservation,
  buildReservationList,
  updateAdventureReservation,
});

if (
  typeof module !== "undefined" &&
  module.exports
) {
  module.exports = ReservationSync;
}

if (typeof window !== "undefined") {
  window.ReservationSync = ReservationSync;
}
})();
