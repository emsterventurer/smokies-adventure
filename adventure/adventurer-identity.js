(function (root, factory) {
  const adventurerDirectory =
    typeof module === "object" &&
    module.exports
      ? require("./adventurer-directory")
      : root.AdventurerDirectory;

  const api = factory(
    root,
    adventurerDirectory,
  );

  if (
    typeof module === "object" &&
    module.exports
  ) {
    module.exports = api;
  }

  root.AdventurerIdentity = api;
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : this,
  function (
    root,
    AdventurerDirectory,
  ) {
    "use strict";

    const STORAGE_KEY =
      "adventureCompanionAdventurerIdentity";

    function getStorage(storage) {
      return (
        storage ??
        root.localStorage ??
        null
      );
    }

    function getAdventurers(
      directory =
        AdventurerDirectory
          ?.createInitialAdventurerDirectory?.(),
    ) {
      return Array.isArray(
        directory?.adventurers,
      )
        ? directory.adventurers
        : [];
    }

    function findAdventurer(
      adventurerId,
      directory,
    ) {
      if (
        typeof adventurerId !==
          "string" ||
        !adventurerId.trim()
      ) {
        return null;
      }

      return (
        getAdventurers(directory).find(
          (adventurer) =>
            adventurer.id ===
              adventurerId &&
            adventurer.active !== false,
        ) ?? null
      );
    }

    function readIdentity({
      storage,
      directory,
    } = {}) {
      const provider =
        getStorage(storage);

      if (!provider) {
        return null;
      }

      try {
        const adventurerId =
          provider.getItem(
            STORAGE_KEY,
          );

        return findAdventurer(
          adventurerId,
          directory,
        );
      } catch (error) {
        return null;
      }
    }

    function selectIdentity(
      adventurerId,
      {
        storage,
        directory,
      } = {},
    ) {
      const provider =
        getStorage(storage);

      const adventurer =
        findAdventurer(
          adventurerId,
          directory,
        );

      if (
        !provider ||
        !adventurer
      ) {
        return null;
      }

      try {
        provider.setItem(
          STORAGE_KEY,
          adventurer.id,
        );

        return {
          ...adventurer,
        };
      } catch (error) {
        return null;
      }
    }

    function clearIdentity({
      storage,
    } = {}) {
      const provider =
        getStorage(storage);

      if (!provider) {
        return false;
      }

      try {
        provider.removeItem(
          STORAGE_KEY,
        );

        return true;
      } catch (error) {
        return false;
      }
    }

    function hasIdentity(options = {}) {
      return Boolean(
        readIdentity(options),
      );
    }

    return Object.freeze({
      STORAGE_KEY,
      getAdventurers,
      findAdventurer,
      readIdentity,
      selectIdentity,
      clearIdentity,
      hasIdentity,
    });
  },
);
