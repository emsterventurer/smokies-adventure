import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";

import {
  database,
  storage,
} from "./firebase-client.mjs";

const MEDIA_COLLECTION =
  "adventureMedia";

function requireMediaId(mediaId) {
  if (
    typeof mediaId !== "string" ||
    mediaId.trim() === ""
  ) {
    throw new TypeError(
      "A valid mediaId is required.",
    );
  }

  return mediaId;
}

function requireMediaRecord(record) {
  if (
    !record ||
    typeof record !== "object" ||
    typeof record.id !== "string" ||
    record.id.trim() === "" ||
    typeof record.adventureId !== "string" ||
    record.adventureId.trim() === "" ||
    typeof record.memoryId !== "string" ||
    record.memoryId.trim() === ""
  ) {
    throw new TypeError(
      "A valid Adventure Media record is required.",
    );
  }

  return record;
}

function mediaDocument(mediaId) {
  return doc(
    database,
    MEDIA_COLLECTION,
    requireMediaId(mediaId),
  );
}

function mediaStoragePath(record) {
  return [
    "adventures",
    record.adventureId,
    "memories",
    record.memoryId,
    record.id,
  ].join("/");
}

function normalizeCloudRecord(
  record,
  {
    downloadUrl,
    storagePath,
  } = {},
) {
  return {
    id: record.id,
    adventureId: record.adventureId,
    memoryId: record.memoryId,
    type:
      typeof record.type === "string"
        ? record.type
        : "image",
    mimeType:
      typeof record.mimeType === "string"
        ? record.mimeType
        : "application/octet-stream",
    fileName:
      typeof record.fileName === "string"
        ? record.fileName
        : null,
    size:
      Number.isFinite(record.size)
        ? record.size
        : null,
    downloadUrl:
      typeof downloadUrl === "string"
        ? downloadUrl
        : record.downloadUrl ?? null,
    storagePath:
      typeof storagePath === "string"
        ? storagePath
        : record.storagePath ?? null,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : null,
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : null,
  };
}

async function save(record) {
  requireMediaRecord(record);

  if (
    !record.data ||
    (
      typeof Blob !== "undefined" &&
      !(record.data instanceof Blob)
    )
  ) {
    throw new TypeError(
      "Adventure Media data must be a File or Blob.",
    );
  }

  const storagePath =
    mediaStoragePath(record);

  const storageReference =
    ref(storage, storagePath);

  await uploadBytes(
    storageReference,
    record.data,
    {
      contentType:
        record.mimeType ||
        record.data.type ||
        "application/octet-stream",
    },
  );

  const downloadUrl =
    await getDownloadURL(
      storageReference,
    );

  const cloudRecord =
    normalizeCloudRecord(
      record,
      {
        downloadUrl,
        storagePath,
      },
    );

  await setDoc(
    mediaDocument(record.id),
    cloudRecord,
  );

  return cloudRecord;
}

async function get(mediaId) {
  const snapshot =
    await getDoc(
      mediaDocument(mediaId),
    );

  return snapshot.exists()
    ? snapshot.data()
    : null;
}

async function list() {
  const snapshot =
    await getDocs(
      collection(
        database,
        MEDIA_COLLECTION,
      ),
    );

  return snapshot.docs.map(
    (documentSnapshot) =>
      documentSnapshot.data(),
  );
}

async function remove(mediaId) {
  const existing =
    await get(mediaId);

  if (!existing) {
    return false;
  }

  if (existing.storagePath) {
    await deleteObject(
      ref(
        storage,
        existing.storagePath,
      ),
    );
  }

  await deleteDoc(
    mediaDocument(mediaId),
  );

  return true;
}

async function clear() {
  const records =
    await list();

  for (const record of records) {
    await remove(record.id);
  }
}

async function isAvailable() {
  return Boolean(
    database &&
    storage,
  );
}

const FirebaseMediaProvider =
  Object.freeze({
    save,
    get,
    list,
    delete: remove,
    clear,
    isAvailable,
  });

globalThis.FirebaseMediaProvider =
  FirebaseMediaProvider;

globalThis.dispatchEvent(
  new CustomEvent(
    "adventure:firebase-media-provider-ready",
    {
      detail: {
        provider:
          FirebaseMediaProvider,
      },
    },
  ),
);

export {
  FirebaseMediaProvider,
};
