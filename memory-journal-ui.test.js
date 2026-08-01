"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("loads the Memory Journal module before app startup", () => {
  const indexHtml = fs.readFileSync(
    path.join(__dirname, "index.html"),
    "utf8",
  );

  const journalPosition = indexHtml.indexOf(
    'src="adventure/memory-journal.js"',
  );

  const appPosition = indexHtml.indexOf(
    'src="app.js"',
  );

  assert.notEqual(
    journalPosition,
    -1,
    "Expected index.html to load adventure/memory-journal.js.",
  );

  assert.notEqual(
    appPosition,
    -1,
    "Expected index.html to load app.js.",
  );

  assert.ok(
    journalPosition < appPosition,
    "Memory Journal must load before app.js.",
  );
});

test("provides a Quick Memory Capture entry point", () => {
  const indexHtml = fs.readFileSync(
    path.join(__dirname, "index.html"),
    "utf8",
  );

  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    indexHtml,
    /data-view=["']memories["']/,
  );

  assert.match(
    appSource,
    /Adventure Book/,
  );
});

test("renders a minimal memory capture form", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /data-memory-form/,
  );

  assert.match(
    appSource,
    /name=["']title["']/,
  );

  assert.match(
    appSource,
    /name=["']note["']/,
  );

  assert.match(
    appSource,
    /name=["']adventureDate["']/,
  );

  assert.match(
    appSource,
    /name=["']adventurerIds["']/,
  );

  assert.match(
    appSource,
    /Add to Adventure Book/,
  );
});

test("creates the journal from the active Adventure Service", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /MemoryJournal\.createMemoryJournal/,
  );

  assert.match(
    appSource,
    /activeAdventureService/,
  );
});

test("saves memory form values through the Memory Journal", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /createMemory\(/,
  );

  assert.match(
    appSource,
    /formData\.get\(["']title["']\)/,
  );

  assert.match(
    appSource,
    /formData\.get\(["']note["']\)/,
  );

  assert.match(
    appSource,
    /formData\.getAll\(["']adventurerIds["']\)/,
  );
});

test("renders saved memories in the UI", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /listMemories\(\)/,
  );

  assert.match(
    appSource,
    /data-memory-id/,
  );

  assert.match(
    appSource,
    /The Adventure Book is waiting for its first page./,
  );
});

test("supports intentional memory deletion", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /data-delete-memory/,
  );

  assert.match(
    appSource,
    /deleteMemory\(/,
  );
});

test("suggests a memory title from the selected adventure date", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /function getMemoryTitleSuggestion/,
  );

  assert.match(
    appSource,
    /DATA\.days\.find/,
  );

  assert.match(
    appSource,
    /data-suggested-title/,
  );

  assert.match(
    appSource,
    /currentTitle === previousSuggestion/,
  );

  assert.match(
    appSource,
    /getMemoryTitleSuggestion\(\s*adventureDateInput\.value/,
  );
});
test("includes accessible labels for memory capture fields", () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, "app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /<label[^>]*>[\s\S]*Memory title/i,
  );

  assert.match(
    appSource,
    /<label[^>]*>[\s\S]*Tell the story/i,
  );

  assert.match(
    appSource,
    /<fieldset[\s\S]*<legend[^>]*>Who shared this moment?/i,
  );
});