const assert = require("node:assert/strict");
const AdventurerDirectory = require(
  "./adventure/adventurer-directory",
);
const AdventurerIdentity = require(
  "./adventure/adventurer-identity",
);

function createMemoryStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key)
        ? values.get(key)
        : null;
    },

    setItem(key, value) {
      values.set(
        key,
        String(value),
      );
    },

    removeItem(key) {
      values.delete(key);
    },
  };
}

function runTests() {
  const directory =
    AdventurerDirectory
      .createInitialAdventurerDirectory();

  const storage =
    createMemoryStorage();

  assert.equal(
    AdventurerIdentity.readIdentity({
      storage,
      directory,
    }),
    null,
    "Identity should begin unselected",
  );

  assert.equal(
    AdventurerIdentity.hasIdentity({
      storage,
      directory,
    }),
    false,
    "Identity should report absent before selection",
  );

  const selected =
    AdventurerIdentity.selectIdentity(
      "emily",
      {
        storage,
        directory,
      },
    );

  assert.equal(
    selected.id,
    "emily",
    "Selecting Emily should return her canonical adventurer record",
  );

  assert.equal(
    selected.displayName,
    "Emily",
  );

  assert.equal(
    AdventurerIdentity.readIdentity({
      storage,
      directory,
    }).id,
    "emily",
    "Selected identity should persist",
  );

  assert.equal(
    AdventurerIdentity.hasIdentity({
      storage,
      directory,
    }),
    true,
    "Identity should report present after selection",
  );

  assert.equal(
    AdventurerIdentity.selectIdentity(
      "not-an-adventurer",
      {
        storage,
        directory,
      },
    ),
    null,
    "Unknown adventurers should not be selected",
  );

  assert.equal(
    AdventurerIdentity.findAdventurer(
      "kaseryn",
      directory,
    ).displayName,
    "Kaseryn",
    "Identity should use the canonical Adventurer Directory",
  );

  assert.equal(
    AdventurerIdentity.clearIdentity({
      storage,
    }),
    true,
    "Identity should clear intentionally",
  );

  assert.equal(
    AdventurerIdentity.readIdentity({
      storage,
      directory,
    }),
    null,
    "Cleared identity should no longer be available",
  );

  console.log(
    "Adventurer identity tests passed.",
  );
}

runTests();
