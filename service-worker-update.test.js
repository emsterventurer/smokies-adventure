"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const update = require("./service-worker-update.js");
const app = fs.readFileSync("app.js", "utf8");

function createHarness() {
  const messages = [];
  let reloads = 0;
  let hides = 0;
  const controller = update.createController({
    reload: () => { reloads += 1; },
    hideBanner: () => { hides += 1; },
  });

  return {
    controller,
    messages,
    reloads: () => reloads,
    hides: () => hides,
    registration: {
      waiting: {
        postMessage(message) { messages.push(message); },
      },
    },
  };
}

function createWorkerHarness({
  cacheName = "corrected-release-cache",
  existingCaches = [],
  addAll = () => Promise.resolve(),
} = {}) {
  const listeners = {};
  const events = [];
  const cachesInUse = new Set(existingCaches);
  let skipWaitingCalls = 0;
  let claimCalls = 0;
  const worker = fs.readFileSync("service-worker.js", "utf8");
  const context = {
    importScripts() {
      context.self.AdventureCompanionBuild = {
        cache: cacheName,
        version: "corrected-release",
      };
    },
    self: {
      addEventListener(type, listener) { listeners[type] = listener; },
      skipWaiting() {
        skipWaitingCalls += 1;
        events.push("skipWaiting");
        return Promise.resolve();
      },
      clients: {
        claim() {
          claimCalls += 1;
          events.push("clients.claim");
          return Promise.resolve();
        },
      },
    },
    caches: {
      open(name) {
        cachesInUse.add(name);
        return Promise.resolve({
          addAll(assets) {
            events.push("cache.addAll:start");
            return addAll(assets).then((result) => {
              events.push("cache.addAll:complete");
              return result;
            });
          },
        });
      },
      keys() { return Promise.resolve([...cachesInUse]); },
      delete(name) {
        events.push(`cache.delete:${name}`);
        return Promise.resolve(cachesInUse.delete(name));
      },
      match() { return Promise.resolve(); },
    },
    fetch() {},
  };

  vm.runInNewContext(worker, context);

  return {
    listeners,
    events,
    cachesInUse,
    skipWaitingCalls: () => skipWaitingCalls,
    claimCalls: () => claimCalls,
  };
}

function dispatchLifetimeEvent(listener, event = {}) {
  let lifetime;
  listener({
    ...event,
    waitUntil(promise) { lifetime = promise; },
  });
  assert.ok(lifetime instanceof Promise);
  return lifetime;
}

test("Refresh now requests activation without reloading under the old controller", () => {
  const harness = createHarness();

  assert.equal(
    harness.controller.requestActivation(harness.registration),
    true,
  );
  assert.deepEqual(harness.messages, [{ type: "SKIP_WAITING" }]);
  assert.equal(harness.reloads(), 0);
});

test("controllerchange hides the banner and reloads exactly once", () => {
  const harness = createHarness();

  harness.controller.handleControllerChange();
  harness.controller.handleControllerChange();

  assert.equal(harness.hides(), 1);
  assert.equal(harness.reloads(), 1);
});

test("a missing waiting worker is a safe no-op", () => {
  const harness = createHarness();

  assert.equal(harness.controller.requestActivation(null), false);
  assert.equal(harness.controller.requestActivation({}), false);
  assert.deepEqual(harness.messages, []);
  assert.equal(harness.reloads(), 0);
});

test("application preserves waiting-worker and updatefound detection", () => {
  assert.match(app, /if\(reg\.waiting\)\{\s*showUpdateToast\(\)/);
  assert.match(app, /reg\.addEventListener\("updatefound"/);
  assert.match(app, /worker\.state==="installed"[\s\S]*showUpdateToast\(\)/);
  assert.doesNotMatch(app, /#refreshApp[\s\S]*location\.reload/);
});

test("browser flow intercepts an old Refresh handler until controllerchange", async () => {
  const listeners = {};
  const messages = [];
  let reloads = 0;
  let hides = 0;
  let prevented = 0;
  let stopped = 0;
  const root = {
    document: {
      querySelector() {
        return {
          addEventListener(type, listener, capture) {
            listeners[`button:${type}`] = { listener, capture };
          },
        };
      },
    },
    navigator: {
      serviceWorker: {
        async getRegistration() {
          return {
            waiting: {
              postMessage(message) { messages.push(message); },
            },
          };
        },
        addEventListener(type, listener) {
          listeners[`worker:${type}`] = listener;
        },
      },
    },
    location: { reload() { reloads += 1; } },
    hideUpdateToast() { hides += 1; },
  };

  update.installBrowserFlow(root);
  assert.equal(listeners["button:click"].capture, true);
  await listeners["button:click"].listener({
    preventDefault() { prevented += 1; },
    stopImmediatePropagation() { stopped += 1; },
  });

  assert.equal(prevented, 1);
  assert.equal(stopped, 1);
  assert.deepEqual(messages, [{ type: "SKIP_WAITING" }]);
  assert.equal(reloads, 0);

  listeners["worker:controllerchange"]();
  listeners["worker:controllerchange"]();
  assert.equal(hides, 1);
  assert.equal(reloads, 1);
});

test("waiting worker keeps skipWaiting alive when an old client reloads", async () => {
  const harness = createWorkerHarness();
  const lifetime = dispatchLifetimeEvent(harness.listeners.message, {
    data: { type: "SKIP_WAITING" },
  });

  assert.equal(harness.skipWaitingCalls(), 1);
  await lifetime;
});

test("install caches every release asset before automatic activation", async () => {
  let finishCaching;
  let cachedAssets;
  const caching = new Promise((resolve) => { finishCaching = resolve; });
  const harness = createWorkerHarness({
    addAll(assets) {
      cachedAssets = [...assets];
      return caching;
    },
  });

  const lifetime = dispatchLifetimeEvent(harness.listeners.install);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(harness.skipWaitingCalls(), 0);

  finishCaching();
  await lifetime;

  assert.ok(cachedAssets.includes("./index.html"));
  assert.ok(cachedAssets.includes("./service-worker-update.js"));
  assert.deepEqual(harness.events, [
    "cache.addAll:start",
    "cache.addAll:complete",
    "skipWaiting",
  ]);
  assert.equal(harness.skipWaitingCalls(), 1);
});

test("failed release caching prevents automatic activation", async () => {
  const cacheError = new Error("synthetic cache failure");
  const harness = createWorkerHarness({
    addAll() { return Promise.reject(cacheError); },
  });

  await assert.rejects(
    dispatchLifetimeEvent(harness.listeners.install),
    cacheError,
  );

  assert.equal(harness.skipWaitingCalls(), 0);
  assert.deepEqual(harness.events, ["cache.addAll:start"]);
});

test("a repeated release replaces the previous cache and claims clients automatically", async () => {
  const previousCache = "adventure-companion-m4-03-build-3";
  const correctedCache = "corrected-release-cache";
  const harness = createWorkerHarness({
    cacheName: correctedCache,
    existingCaches: [previousCache],
  });

  await dispatchLifetimeEvent(harness.listeners.install);
  await dispatchLifetimeEvent(harness.listeners.activate);

  assert.deepEqual(harness.events, [
    "cache.addAll:start",
    "cache.addAll:complete",
    "skipWaiting",
    `cache.delete:${previousCache}`,
    "clients.claim",
  ]);
  assert.equal(harness.skipWaitingCalls(), 1);
  assert.equal(harness.claimCalls(), 1);
  assert.deepEqual([...harness.cachesInUse], [correctedCache]);
});
