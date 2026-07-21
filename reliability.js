// Build M3-04.4B · Friendly startup watchdog and diagnostics
(() => {
  "use strict";

  const BUILD = "M3-04.4B";
  const CACHE = "adventure-companion-m3-04-4b";
  const STARTUP_TIMEOUT_MS = 3500;
  let appReady = false;
  let readyDetails = {};
  let startupTimer;
  const diagnosticsStartedAt = Date.now();
  const SMART_STOPS_GRACE_MS = 2200;

  const $ = selector => document.querySelector(selector);
  const has = selector => Boolean($(selector));

  function diagnosticChecks() {
    const navButtons = document.querySelectorAll("[data-view]");
    const appScript = [...document.scripts].find(script => /(^|\/)app\.js(?:\?|$)/.test(script.src));
    return [
      { key:"startup", label:"Application startup", pass:appReady, detail:appReady ? "Initialized" : "Waiting for app.js" },
      { key:"navigation", label:"Navigation", pass:navButtons.length >= 5 && readyDetails.navigation === true, detail:`${navButtons.length} navigation controls found` },
      { key:"dashboard", label:"Dashboard", pass:has("#homeCard") && has("#journeyTrail"), detail:"Home and journey regions available" },
      { key:"dailyAdventure", label:"Daily Adventure", pass:readyDetails.dailyAdventure === true && has("#screen"), detail:"Day renderer and screen region available" },
      { key:"reservations", label:"Reservations", pass:has('[data-view="reservations"]'), detail:"Reservation route available" },
      { key:"packing", label:"Packing", pass:Boolean(window.PACKING || window.packingData || has('[data-view="packing"]')), detail:"Packing route/data available" },
      { key:"traditions", label:"Traditions", pass:has('[data-view="traditions"]'), detail:"Traditions route available" },
      { key:"smartStops", label:"Smart Stops", pass:document.documentElement.innerHTML.includes("Smart Stops") || document.documentElement.innerHTML.includes("smartStops"), pending:Date.now()-diagnosticsStartedAt<SMART_STOPS_GRACE_MS && !(document.documentElement.innerHTML.includes("Smart Stops") || document.documentElement.innerHTML.includes("smartStops")), detail:"Route guidance and stop cards are preparing" },
      { key:"weather", label:"Weather", pass:Boolean(window.AdventureWeather || window.WeatherService || has("#weatherCard")), detail:"Weather card/service available" },
      { key:"appScript", label:"app.js loaded", pass:Boolean(appScript), detail:appScript ? "Script tag present" : "Script tag missing" },
      { key:"cache", label:"Cache version", pass:true, detail:CACHE },
      { key:"build", label:"Build identity", pass:document.querySelector('meta[name="adventure-companion-build"]')?.content === BUILD, detail:BUILD }
    ];
  }

  function renderDiagnostics(target = $("#diagnosticsResults")) {
    const checks = diagnosticChecks();
    const passed = checks.filter(check => check.pass).length;
    const pending = checks.filter(check => check.pending).length;
    const complete = passed + pending;
    if (target) {
      target.hidden = false;
      target.innerHTML = `
        <div class="diagnosticsSummary ${passed === checks.length ? "healthy" : "attention"}">
          <strong>${passed === checks.length ? "✅" : pending ? "⏳" : "⚠️"} ${pending ? `${complete}/${checks.length} ready or initializing` : `${passed}/${checks.length} systems ready`}</strong>
          <small>Build ${BUILD} · Cache ${CACHE}</small>
        </div>
        <div class="diagnosticsList">
          ${checks.map(check => `<div class="${check.pending ? "pending" : ""}"><span>${check.pass ? "✅" : check.pending ? "⏳" : "⚠️"} ${check.label}</span><small>${check.pending ? "Initializing… " : ""}${check.detail}</small></div>`).join("")}
        </div>
        <button class="diagnosticsRetry" type="button">Run diagnostics again</button>`;
      target.querySelector(".diagnosticsRetry")?.addEventListener("click", () => renderDiagnostics(target));
    }
    const health = $("#buildHealthStatus");
    if (health) health.textContent = passed === checks.length ? "Ready ✅" : pending ? "Finishing setup…" : `${passed}/${checks.length} checks ready`;
    return { checks, passed, total:checks.length, healthy:passed === checks.length };
  }

  function removeRecovery() {
    $("#startupRecovery")?.remove();
    document.body.classList.remove("startupFailureOpen");
  }

  function showRecovery() {
    if (appReady || $("#startupRecovery")) return;
    const panel = document.createElement("section");
    panel.id = "startupRecovery";
    panel.className = "startupRecovery";
    panel.setAttribute("role", "alertdialog");
    panel.setAttribute("aria-modal", "true");
    panel.innerHTML = `
      <div class="startupRecoveryCard">
        <div class="startupRecoveryMark">🏔️ 🌿 💚</div>
        <span class="eyebrow">QUICK TUNE-UP NEEDED</span>
        <h2>Adventure Companion didn’t finish starting.</h2>
        <p>Your trip information is still safe. A critical script may not have loaded, or the browser may be using an older cached copy.</p>
        <div class="startupRecoveryActions">
          <button data-recovery="retry" type="button">↻ Try again</button>
          <button data-recovery="diagnostics" type="button">🩺 View diagnostics</button>
          <button data-recovery="cache" type="button">🧹 Clear app cache</button>
        </div>
        <div id="startupDiagnostics" class="diagnosticsResults" hidden></div>
        <small class="startupBuild">Build ${BUILD} · ${CACHE}</small>
      </div>`;
    document.body.appendChild(panel);
    document.body.classList.add("startupFailureOpen");
    panel.querySelector('[data-recovery="retry"]')?.addEventListener("click", () => location.reload());
    panel.querySelector('[data-recovery="diagnostics"]')?.addEventListener("click", () => renderDiagnostics($("#startupDiagnostics")));
    panel.querySelector('[data-recovery="cache"]')?.addEventListener("click", clearAppCache);
  }

  async function clearAppCache() {
    const button = document.querySelector('[data-recovery="cache"]');
    if (button) { button.disabled = true; button.textContent = "Clearing…"; }
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith("adventure-companion-")).map(key => caches.delete(key)));
      }
      location.reload();
    } catch (error) {
      if (button) { button.disabled = false; button.textContent = "Couldn’t clear automatically"; }
      alert("Please refresh with Ctrl+Shift+R. Your saved trip and packing progress have not been deleted.");
    }
  }

  function wireTools() {
    $("#runDiagnostics")?.addEventListener("click", () => renderDiagnostics());
    $("#checkForUpdates")?.addEventListener("click", async event => {
      const button = event.currentTarget;
      const original = button.textContent;
      button.disabled = true;
      button.textContent = "Checking…";
      try {
        const registration = await navigator.serviceWorker?.getRegistration();
        await registration?.update();
        button.textContent = "Checked ✓";
      } catch (_) {
        button.textContent = "Check unavailable";
      }
      setTimeout(() => { button.disabled = false; button.textContent = original; }, 1600);
    });
    const cache = $("#buildCacheVersion");
    if (cache) cache.textContent = BUILD;
  }

  function markAppReady(details = {}) {
    appReady = true;
    readyDetails = { ...readyDetails, ...details };
    clearTimeout(startupTimer);
    removeRecovery();
    document.documentElement.dataset.appReady = "true";
    window.dispatchEvent(new CustomEvent("adventurecompanion:ready", { detail:{ build:BUILD, ...readyDetails } }));
    setTimeout(() => renderDiagnostics(), 0);
  }

  window.AdventureReliability = Object.freeze({
    build:BUILD,
    cache:CACHE,
    markAppReady,
    runDiagnostics:renderDiagnostics,
    clearAppCache,
    getStatus:() => ({ appReady, ...renderDiagnostics(document.createElement("div")) })
  });

  document.addEventListener("DOMContentLoaded", () => {
    wireTools();
    startupTimer = setTimeout(showRecovery, STARTUP_TIMEOUT_MS);
  });
})();
