(function () {
"use strict";

function initializeAdventureSwitcher(options = {}) {
  const document = options.document;
  const adventures = Array.isArray(options.adventures)
    ? options.adventures
    : [];
  const activeAdventureService =
    options.activeAdventureService;
  const selectActiveAdventure =
    options.selectActiveAdventure;
  const smokiesAdventureId =
    options.smokiesAdventureId;
  const supportsCanonicalItinerary =
    typeof options.supportsCanonicalItinerary ===
    "function"
      ? options.supportsCanonicalItinerary
      : (adventure) =>
          Array.isArray(
            adventure?.itinerary?.days,
          ) &&
          adventure.itinerary.days.length > 0;
  const reload =
    typeof options.reload === "function"
      ? options.reload
      : () => {};

  const switcher =
    document?.querySelector("#adventureSwitcher");

  if (
    !switcher ||
    typeof activeAdventureService
      ?.getActiveAdventureId !== "function" ||
    typeof activeAdventureService
      ?.getActiveAdventure !== "function" ||
    typeof selectActiveAdventure !== "function"
  ) {
    return null;
  }

  const activeAdventureId =
    activeAdventureService.getActiveAdventureId();
  const activeAdventure =
    activeAdventureService.getActiveAdventure();

  switcher.replaceChildren();

  adventures.forEach((adventure) => {
    const option = document.createElement("option");
    option.value = adventure.id;
    option.textContent = adventure.title;
    switcher.appendChild(option);
  });

  switcher.value = activeAdventureId ?? "";

  const heading =
    document.querySelector("#activeAdventureTitle");

  if (heading && activeAdventure?.title) {
    heading.textContent = activeAdventure.title;
  }

  const isSmokiesAdventure =
    activeAdventureId === smokiesAdventureId;
  const hasCanonicalItinerary =
    !isSmokiesAdventure &&
    supportsCanonicalItinerary(
      activeAdventure,
    );

  document.body?.classList.toggle(
    "nonSmokiesAdventure",
    !isSmokiesAdventure,
  );
  document.body?.classList.toggle(
    "canonicalItineraryAdventure",
    hasCanonicalItinerary,
  );

  const unavailable =
    document.querySelector("#adventureUnavailable");

  if (unavailable) {
    unavailable.hidden =
      isSmokiesAdventure ||
      hasCanonicalItinerary;
  }

  const canonicalItinerary =
    document.querySelector(
      "#canonicalAdventureItinerary",
    );

  if (canonicalItinerary) {
    canonicalItinerary.hidden =
      !hasCanonicalItinerary;
  }

  switcher.addEventListener("change", () => {
    selectActiveAdventure(switcher.value);
    reload();
  });

  return {
    adventures,
    activeAdventureId,
    isSmokiesAdventure,
    hasCanonicalItinerary,
  };
}

const AdventureSwitcher = Object.freeze({
  initializeAdventureSwitcher,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventureSwitcher;
}

if (typeof window !== "undefined") {
  window.AdventureSwitcher = AdventureSwitcher;
}
})();
