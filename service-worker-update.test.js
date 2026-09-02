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
  const listeners = {};
  let skipWaitingCalls = 0;
  const worker = fs.readFileSync("service-worker.js", "utf8");
  const context = {
    importScripts() {
      context.self.AdventureCompanionBuild = {
        cache: "test-cache",
        version: "test-build",
      };
    },
    self: {
      addEventListener(type, listener) { listeners[type] = listener; },
      skipWaiting() {
        skipWaitingCalls += 1;
        return Promise.resolve();
      },
      clients: { claim() {} },
    },
    caches: {},
    fetch() {},
  };

  vm.runInNewContext(worker, context);
  let lifetime;
  listeners.message({
    data: { type: "SKIP_WAITING" },
    waitUntil(promise) { lifetime = promise; },
  });

  assert.equal(skipWaitingCalls, 1);
  assert.ok(lifetime instanceof Promise);
  await lifetime;
});
