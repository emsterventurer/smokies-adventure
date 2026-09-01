"use strict";

class FakeTimestamp {
  constructor(milliseconds) {
    this.milliseconds = milliseconds;
  }

  static fromMillis(milliseconds) {
    return new FakeTimestamp(milliseconds);
  }

  toMillis() {
    return this.milliseconds;
  }

  toDate() {
    return new Date(this.milliseconds);
  }
}

function cloneValue(value) {
  if (value instanceof FakeTimestamp) {
    return FakeTimestamp.fromMillis(
      value.toMillis(),
    );
  }

  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, item]) => [
          key,
          cloneValue(item),
        ],
      ),
    );
  }

  return value;
}

class FakeDocumentReference {
  constructor(database, path) {
    this.database = database;
    this.path = path;
    const segments = path.split("/");
    this.id = segments.at(-1);
    this.parent = {
      id: segments.at(-2),
      parent:
        segments.length > 2
          ? new FakeDocumentReference(
              database,
              segments.slice(0, -2).join("/"),
            )
          : null,
    };
  }
}

class FakeDocumentSnapshot {
  constructor(reference, value) {
    this.ref = reference;
    this.id = reference.id;
    this.exists = value !== undefined;
    this.value = value;
  }

  data() {
    return cloneValue(this.value);
  }
}

class FakeFirestore {
  constructor(initialDocuments = {}) {
    this.documents = new Map(
      Object.entries(initialDocuments).map(
        ([path, value]) => [
          path,
          cloneValue(value),
        ],
      ),
    );
    this.writeCount = 0;
  }

  doc(path) {
    return new FakeDocumentReference(
      this,
      path,
    );
  }

  snapshot(reference) {
    return new FakeDocumentSnapshot(
      reference,
      this.documents.get(reference.path),
    );
  }

  get(path) {
    return cloneValue(this.documents.get(path));
  }

  collectionGroup(collectionName) {
    return {
      where: (field, operator, value) => {
        if (operator !== "==") {
          throw new Error(
            "Only equality queries are supported.",
          );
        }

        return {
          get: async () => ({
            docs: Array.from(
              this.documents.entries(),
            )
              .filter(([path, document]) => {
                const segments = path.split("/");
                return (
                  segments.at(-2) ===
                    collectionName &&
                  document?.[field] === value
                );
              })
              .map(
                ([path, document]) =>
                  new FakeDocumentSnapshot(
                    this.doc(path),
                    document,
                  ),
              ),
          }),
        };
      },
    };
  }

  async runTransaction(callback) {
    const operations = [];
    const transaction = {
      get: async (reference) =>
        this.snapshot(reference),
      set: (reference, value) => {
        operations.push([
          "set",
          reference,
          value,
        ]);
      },
      create: (reference, value) => {
        if (
          this.documents.has(reference.path) ||
          operations.some(
            ([, pendingReference]) =>
              pendingReference.path ===
              reference.path,
          )
        ) {
          throw new Error(
            "Document already exists.",
          );
        }

        operations.push([
          "set",
          reference,
          value,
        ]);
      },
      update: (reference, value) => {
        if (!this.documents.has(reference.path)) {
          throw new Error(
            "Document does not exist.",
          );
        }

        operations.push([
          "update",
          reference,
          value,
        ]);
      },
    };

    const result = await callback(transaction);

    operations.forEach(
      ([operation, reference, value]) => {
        const nextValue =
          operation === "update"
            ? {
                ...this.documents.get(
                  reference.path,
                ),
                ...cloneValue(value),
              }
            : cloneValue(value);

        this.documents.set(
          reference.path,
          nextValue,
        );
        this.writeCount += 1;
      },
    );

    return result;
  }
}

module.exports = Object.freeze({
  FakeFirestore,
  FakeTimestamp,
});
