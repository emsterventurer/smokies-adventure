(function () {
"use strict";

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function createMemoryJournal(options = {}) {
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

  const now =
    typeof options.now === "function"
      ? options.now
      : () => new Date().toISOString();

  const idFactory =
    typeof options.idFactory === "function"
      ? options.idFactory
      : () =>
          `memory-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

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

  function getEntries(adventure) {
    return Array.isArray(
      adventure?.memories?.entries,
    )
      ? adventure.memories.entries
      : [];
  }

  function normalizeString(value, fallback = "") {
    return typeof value === "string"
      ? value
      : fallback;
  }

  function normalizeNullableString(value) {
    return typeof value === "string"
      ? value
      : null;
  }

  function normalizeArray(value) {
    return Array.isArray(value)
      ? cloneValue(value)
      : [];
  }

  function normalizeMemoryInput(
    input = {},
    existing = null,
  ) {
    const timestamp = now();

    return {
      id: existing?.id ?? idFactory(),
      adventureId:
        existing?.adventureId ?? "",
      title:
        input.title !== undefined
          ? normalizeString(input.title)
          : existing?.title ?? "",
      note:
        input.note !== undefined
          ? normalizeString(input.note)
          : existing?.note ?? "",
      adventureDate:
        input.adventureDate !== undefined
          ? normalizeNullableString(
              input.adventureDate,
            )
          : existing?.adventureDate ?? null,
      adventurerIds:
        input.adventurerIds !== undefined
          ? normalizeArray(
              input.adventurerIds,
            )
          : normalizeArray(
              existing?.adventurerIds,
            ),
      locationIds:
        input.locationIds !== undefined
          ? normalizeArray(input.locationIds)
          : normalizeArray(
              existing?.locationIds,
            ),
      activityIds:
        input.activityIds !== undefined
          ? normalizeArray(input.activityIds)
          : normalizeArray(
              existing?.activityIds,
            ),
      mediaIds:
        input.mediaIds !== undefined
          ? normalizeArray(input.mediaIds)
          : normalizeArray(
              existing?.mediaIds,
            ),
      tags:
        input.tags !== undefined
          ? normalizeArray(input.tags)
          : normalizeArray(existing?.tags),
      favorite:
        input.favorite !== undefined
          ? input.favorite === true
          : existing?.favorite === true,
      createdAt:
        existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  }

  function saveEntries(
    adventure,
    entries,
  ) {
    const nextAdventure = {
      ...adventure,
      memories: {
        ...adventure.memories,
        entries: cloneValue(entries),
      },
    };

    return activeAdventureService.saveActiveAdventure(
      nextAdventure,
    );
  }

  function createMemory(input = {}) {
    const adventure =
      requireActiveAdventure();

    const memory = normalizeMemoryInput(
      input,
    );

    memory.adventureId = adventure.id;

    const entries = [
      ...getEntries(adventure),
      memory,
    ];

    saveEntries(adventure, entries);

    return cloneValue(memory);
  }

  function listMemories() {
    const adventure =
      activeAdventureService.getActiveAdventure();

    if (!adventure) {
      return [];
    }

    return cloneValue(
      getEntries(adventure),
    ).sort((first, second) => {
      const firstTime =
        Date.parse(
          first.updatedAt ||
            first.createdAt ||
            "",
        ) || 0;

      const secondTime =
        Date.parse(
          second.updatedAt ||
            second.createdAt ||
            "",
        ) || 0;

      return secondTime - firstTime;
    });
  }

  function getMemory(memoryId) {
    if (
      typeof memoryId !== "string" ||
      memoryId.trim() === ""
    ) {
      return null;
    }

    const memory = listMemories().find(
      (entry) => entry.id === memoryId,
    );

    return memory
      ? cloneValue(memory)
      : null;
  }

  function updateMemory(
    memoryId,
    updates = {},
  ) {
    if (
      typeof memoryId !== "string" ||
      memoryId.trim() === ""
    ) {
      return null;
    }

    const adventure =
      activeAdventureService.getActiveAdventure();

    if (!adventure) {
      return null;
    }

    const entries = getEntries(adventure);
    const index = entries.findIndex(
      (entry) => entry.id === memoryId,
    );

    if (index === -1) {
      return null;
    }

    const updated =
      normalizeMemoryInput(
        updates,
        entries[index],
      );

    updated.id = entries[index].id;
    updated.adventureId =
      entries[index].adventureId ||
      adventure.id;
    updated.createdAt =
      entries[index].createdAt;

    const nextEntries = [
      ...entries.slice(0, index),
      updated,
      ...entries.slice(index + 1),
    ];

    saveEntries(
      adventure,
      nextEntries,
    );

    return cloneValue(updated);
  }

  function deleteMemory(memoryId) {
    if (
      typeof memoryId !== "string" ||
      memoryId.trim() === ""
    ) {
      return false;
    }

    const adventure =
      activeAdventureService.getActiveAdventure();

    if (!adventure) {
      return false;
    }

    const entries = getEntries(adventure);
    const nextEntries = entries.filter(
      (entry) => entry.id !== memoryId,
    );

    if (
      nextEntries.length === entries.length
    ) {
      return false;
    }

    saveEntries(
      adventure,
      nextEntries,
    );

    return true;
  }

  return Object.freeze({
    createMemory,
    listMemories,
    getMemory,
    updateMemory,
    deleteMemory,
  });
}

const MemoryJournal = Object.freeze({
  createMemoryJournal,
});

if (
  typeof module !== "undefined" &&
  module.exports
) {
  module.exports = MemoryJournal;
}

if (typeof window !== "undefined") {
  window.MemoryJournal = MemoryJournal;
}
})();