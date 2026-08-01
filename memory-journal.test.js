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
const MemoryJournal = require(
  "./adventure/memory-journal.js",
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

  let nextId = 1;

  const journal = MemoryJournal.createMemoryJournal({
    activeAdventureService,
    now:
      options.now ||
      (() => "2026-08-07T20:00:00-04:00"),
    idFactory:
      options.idFactory ||
      (() => `memory-${nextId++}`),
  });

  return {
    journal,
    activeAdventureService,
  };
}

test("requires a valid Active Adventure Service", () => {
  assert.throws(
    () => MemoryJournal.createMemoryJournal(),
    {
      message:
        "A valid activeAdventureService is required.",
    },
  );
});

test("creates a minimal memory in the active Adventure Record", () => {
  const { journal, activeAdventureService } =
    createTestJournal();

  const created = journal.createMemory({
    title: "First night in the Smokies",
  });

  assert.equal(created.id, "memory-1");
  assert.equal(
    created.adventureId,
    "smokies-2026",
  );
  assert.equal(
    created.title,
    "First night in the Smokies",
  );
  assert.equal(created.note, "");
  assert.deepEqual(created.adventurerIds, []);
  assert.deepEqual(created.mediaIds, []);
  assert.equal(
    created.createdAt,
    "2026-08-07T20:00:00-04:00",
  );
  assert.equal(
    created.updatedAt,
    "2026-08-07T20:00:00-04:00",
  );

  assert.equal(
    activeAdventureService.getActiveAdventure()
      .memories.entries.length,
    1,
  );
});

test("creates a memory with travelers, date, relationships, and note", () => {
  const { journal } = createTestJournal();

  const created = journal.createMemory({
    title: "Dinner laughter",
    note: "Kaz laughed until she cried.",
    adventureDate: "2026-08-07",
    adventurerIds: ["emily", "kaseryn"],
    locationIds: ["local-goat"],
    activityIds: ["welcome-dinner"],
    mediaIds: ["photo-1"],
    tags: ["family", "funny"],
    favorite: true,
  });

  assert.equal(created.title, "Dinner laughter");
  assert.equal(
    created.note,
    "Kaz laughed until she cried.",
  );
  assert.equal(
    created.adventureDate,
    "2026-08-07",
  );
  assert.deepEqual(created.adventurerIds, [
    "emily",
    "kaseryn",
  ]);
  assert.deepEqual(created.locationIds, [
    "local-goat",
  ]);
  assert.deepEqual(created.activityIds, [
    "welcome-dinner",
  ]);
  assert.deepEqual(created.mediaIds, [
    "photo-1",
  ]);
  assert.deepEqual(created.tags, [
    "family",
    "funny",
  ]);
  assert.equal(created.favorite, true);
});

test("lists memories newest first", () => {
  const times = [
    "2026-08-07T20:00:00-04:00",
    "2026-08-08T20:00:00-04:00",
  ];

  const { journal } = createTestJournal({
    now: () => times.shift(),
  });

  journal.createMemory({
    title: "First memory",
    adventureDate: "2026-08-07",
  });

  journal.createMemory({
    title: "Second memory",
    adventureDate: "2026-08-08",
  });

  assert.deepEqual(
    journal
      .listMemories()
      .map((memory) => memory.title),
    ["Second memory", "First memory"],
  );
});

test("gets a memory by stable ID", () => {
  const { journal } = createTestJournal();

  const created = journal.createMemory({
    title: "Creekside pause",
  });

  const loaded = journal.getMemory(created.id);

  assert.deepEqual(loaded, created);
  assert.notEqual(loaded, created);
  assert.equal(journal.getMemory("missing"), null);
  assert.equal(journal.getMemory(""), null);
});

test("updates an existing memory without replacing its identity", () => {
  const times = [
    "2026-08-07T20:00:00-04:00",
    "2026-08-07T21:00:00-04:00",
  ];

  const { journal } = createTestJournal({
    now: () => times.shift(),
  });

  const created = journal.createMemory({
    title: "Sunset",
    note: "Beautiful.",
    adventurerIds: ["emily"],
  });

  const updated = journal.updateMemory(
    created.id,
    {
      title: "Protected sunset",
      note: "Everyone put their phones away.",
      adventurerIds: [
        "emily",
        "jake",
        "kaseryn",
        "bubbe",
        "papa",
      ],
    },
  );

  assert.equal(updated.id, created.id);
  assert.equal(
    updated.createdAt,
    created.createdAt,
  );
  assert.equal(
    updated.updatedAt,
    "2026-08-07T21:00:00-04:00",
  );
  assert.equal(
    updated.title,
    "Protected sunset",
  );
  assert.equal(
    updated.note,
    "Everyone put their phones away.",
  );
  assert.equal(
    updated.adventurerIds.length,
    5,
  );
});

test("returns null when updating a missing memory", () => {
  const { journal } = createTestJournal();

  assert.equal(
    journal.updateMemory("missing", {
      title: "Changed",
    }),
    null,
  );
});

test("deletes a memory intentionally", () => {
  const { journal } = createTestJournal();

  const created = journal.createMemory({
    title: "Temporary memory",
  });

  assert.equal(
    journal.deleteMemory(created.id),
    true,
  );
  assert.equal(
    journal.getMemory(created.id),
    null,
  );
  assert.equal(
    journal.deleteMemory(created.id),
    false,
  );
  assert.equal(journal.deleteMemory(""), false);
});

test("does not mutate memory input values", () => {
  const { journal } = createTestJournal();

  const input = {
    title: "Family photo",
    adventurerIds: ["emily", "jake"],
    mediaIds: ["photo-1"],
  };

  const snapshot = structuredClone(input);

  journal.createMemory(input);

  assert.deepEqual(input, snapshot);
});

test("does not allow a supplied ID to replace the generated memory ID", () => {
  const { journal } = createTestJournal();

  const created = journal.createMemory({
    id: "unsafe-external-id",
    title: "Generated safely",
  });

  assert.equal(created.id, "memory-1");
});

test("fails safely when there is no active adventure", () => {
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
      seedFactory: null,
    });

  const journal =
    MemoryJournal.createMemoryJournal({
      activeAdventureService,
    });

  assert.throws(
    () =>
      journal.createMemory({
        title: "Cannot save",
      }),
    {
      message:
        "An active Adventure Record is required.",
    },
  );
});