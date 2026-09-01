(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.AdventureAccess = api;
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function () {
    "use strict";

    const IDENTIFIER_PATTERN =
      /^[a-z0-9][a-z0-9-]{0,127}$/;

    function isIdentifier(value) {
      return (
        typeof value === "string" &&
        IDENTIFIER_PATTERN.test(value)
      );
    }

    function normalizeAccessResult(result) {
      const adventures = Array.isArray(
        result?.adventures,
      )
        ? result.adventures
        : [];
      const accessByAdventureId = new Map();
      const conflicts = new Set();

      adventures.forEach((entry) => {
        if (
          !isIdentifier(entry?.adventureId) ||
          !isIdentifier(entry?.adventurerId)
        ) {
          return;
        }

        const existing = accessByAdventureId.get(
          entry.adventureId,
        );

        if (
          existing &&
          existing.adventurerId !== entry.adventurerId
        ) {
          conflicts.add(entry.adventureId);
          return;
        }

        accessByAdventureId.set(entry.adventureId, {
          adventureId: entry.adventureId,
          adventurerId: entry.adventurerId,
        });
      });

      conflicts.forEach((adventureId) => {
        accessByAdventureId.delete(adventureId);
      });

      return Array.from(accessByAdventureId.values())
        .sort((left, right) =>
          left.adventureId.localeCompare(
            right.adventureId,
          ),
        );
    }

    function resolveAdventureAccess(options = {}) {
      const normalizedAccess = normalizeAccessResult(
        options.accessResult,
      );
      const localAdventures = Array.isArray(
        options.localAdventures,
      )
        ? options.localAdventures
        : [];
      const findAdventurer =
        typeof options.findAdventurer === "function"
          ? options.findAdventurer
          : () => null;
      const localById = new Map(
        localAdventures
          .filter(
            (adventure) =>
              isIdentifier(adventure?.id),
          )
          .map((adventure) => [adventure.id, adventure]),
      );
      const knownAccess = normalizedAccess.filter(
        (entry) => localById.has(entry.adventureId),
      );

      if (knownAccess.length === 0) {
        return Object.freeze({
          status: "empty",
          access: Object.freeze([]),
          adventures: Object.freeze([]),
          activeAdventureId: null,
          activeAdventurerId: null,
          reason: null,
        });
      }

      const persistedId =
        options.persistedActiveAdventureId;
      const activeAccess =
        knownAccess.find(
          (entry) =>
            entry.adventureId === persistedId,
        ) ?? knownAccess[0];
      const identity = findAdventurer(
        activeAccess.adventurerId,
      );

      if (!identity) {
        return Object.freeze({
          status: "unavailable",
          access: Object.freeze(knownAccess),
          adventures: Object.freeze(
            knownAccess.map((entry) =>
              localById.get(entry.adventureId),
            ),
          ),
          activeAdventureId: null,
          activeAdventurerId: null,
          reason: "identity-unavailable",
        });
      }

      return Object.freeze({
        status: "authorized",
        access: Object.freeze(knownAccess),
        adventures: Object.freeze(
          knownAccess.map((entry) =>
            localById.get(entry.adventureId),
          ),
        ),
        activeAdventureId: activeAccess.adventureId,
        activeAdventurerId: activeAccess.adventurerId,
        reason: null,
      });
    }

    function resolveAuthorizedSelection(
      state,
      adventureId,
      findAdventurer,
    ) {
      if (state?.status !== "authorized") {
        return null;
      }

      const access = state.access.find(
        (entry) => entry.adventureId === adventureId,
      );

      if (!access || !findAdventurer(access.adventurerId)) {
        return null;
      }

      return Object.freeze({
        adventureId: access.adventureId,
        adventurerId: access.adventurerId,
      });
    }

    function createAdventureAccessClient(options = {}) {
      const acceptPendingInvitations =
        options.acceptPendingInvitations;
      const listAccess = options.listAccess;

      if (
        typeof acceptPendingInvitations !== "function" ||
        typeof listAccess !== "function"
      ) {
        throw new TypeError(
          "Adventure access callables are required.",
        );
      }

      async function resolveCurrentAdventureAccess() {
        await acceptPendingInvitations();
        const result = await listAccess();

        return {
          adventures: normalizeAccessResult(result),
        };
      }

      return Object.freeze({
        resolveCurrentAdventureAccess,
      });
    }

    function canSynchronizeAdventure(
      state,
      activeAdventureId,
    ) {
      return (
        state?.status === "authorized" &&
        typeof activeAdventureId === "string" &&
        state.activeAdventureId === activeAdventureId &&
        state.access?.some(
          (entry) =>
            entry.adventureId === activeAdventureId,
        ) === true
      );
    }

    function bindTrustedIdentity(
      state,
      identityService,
    ) {
      if (
        state?.status !== "authorized" ||
        typeof identityService?.selectIdentity !==
          "function"
      ) {
        return null;
      }

      return identityService.selectIdentity(
        state.activeAdventurerId,
      );
    }

    return Object.freeze({
      normalizeAccessResult,
      resolveAdventureAccess,
      resolveAuthorizedSelection,
      createAdventureAccessClient,
      canSynchronizeAdventure,
      bindTrustedIdentity,
    });
  },
);
