(function () {
"use strict";

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

const ReservationSync = Object.freeze({
  createReservationId,
  mergeReservation,
  findSharedReservation,
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
