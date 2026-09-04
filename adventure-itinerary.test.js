"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const AdventureData = require(
  "./adventure/adventure-data.js",
);
const AdventureNormalization = require(
  "./adventure/adventure-normalization.js",
);
const AdventureStorage = require(
  "./adventure/adventure-storage.js",
);
const AdventureItinerary = require(
  "./adventure/adventure-itinerary.js",
);

function createArrivalAdventure() {
  const shell =
    AdventureData.createPacificCoastAdventureRecord();

  return AdventureData
    .enrichPacificCoastAdventureRecord(shell)
    .adventure;
}

function createStoredAdventureWithoutDriveMetadata() {
  const adventure = createArrivalAdventure();

  adventure.itinerary.days.forEach((day) => {
    day.stops?.forEach((stop) => {
      delete stop.driveFromPrevious;
    });
    day.alternativeRouteStops?.forEach((stop) => {
      delete stop.driveFromPrevious;
    });
    day.routeAlternatives?.forEach((route) => {
      delete route.driveFromPreviousByStopId;
    });
  });

  return adventure;
}

test("Friday route-only Avenue anchors reach both ends without adding activities", () => {
  const adventure = createArrivalAdventure();
  const before = structuredClone(adventure);
  const friday = AdventureItinerary.createItineraryViewModel(adventure)
    .find((day) => day.id === "2026-09-25");
  const activityIds = ["healdsburg-inn-departure", "nelson-family-vineyards",
    "avenue-cafe-miranda", "humboldt-redwoods-visitor-center", "founders-grove",
    "ferndale", "holiday-inn-express-eureka", "sea-grill"];
  assert.deepEqual(friday.stops.map((stop) => stop.id), activityIds);
  const flatten = (segments) => segments.flatMap((segment, index) =>
    segment.points.slice(index ? 1 : 0).map((point) => point.id));
  assert.deepEqual(flatten(friday.dayMapSegments), [
    ...activityIds.slice(0, 2), "avenue-south-entrance", activityIds[2],
    "avenue-myers-flat-approach", ...activityIds.slice(3, 5),
    "avenue-south-of-redcrest", "avenue-north-of-redcrest", "avenue-pepperwood-approach",
    "avenue-north-end", ...activityIds.slice(5),
  ]);
  const nelson = friday.stops[1];
  const founders = friday.stops[4];
  assert.equal(new URL(nelson.navigation.nextStop).searchParams.get("waypoints"),
    "40.182939,-123.773775");
  assert.equal(new URL(friday.stops[2].navigation.nextStop).searchParams.get("waypoints"),
    "40.272306,-123.850154");
  assert.deepEqual(flatten(founders.navigation.nextSegments), [
    "founders-grove", "avenue-south-of-redcrest", "avenue-north-of-redcrest",
    "avenue-pepperwood-approach", "avenue-north-end", "ferndale",
  ]);
  assert.equal(founders.navigation.nextSegments.length, 2);
  assert.equal(founders.navigation.nextStop, null); // No misleading truncated one-click route.
  for (const segment of [...friday.dayMapSegments, ...founders.navigation.nextSegments]) {
    const url = new URL(segment.url);
    assert.equal(url.searchParams.get("origin"), segment.points[0].query);
    assert.equal(url.searchParams.get("destination"), segment.points.at(-1).query);
    const via = segment.points.slice(1, -1).map((point) => point.query);
    assert.equal(url.searchParams.get("waypoints"), via.length ? via.join("|") : null);
    assert.ok(via.length <= 3);
    assert.ok(segment.url.length < 2048);
  }
  const html = AdventureItinerary.renderCanonicalItinerary(adventure, { selectedDayId: friday.id });
  assert.equal((html.match(/<article class="stopCard/g) || []).length, 8);
  assert.match(html, /Stay on CA-254 all the way through the Avenue to its northern end near Pepperwood/);
  assert.match(html, /Avenue Drive 1 of 2/);
  assert.match(html, /Avenue Drive 2 of 2/);
  assert.doesNotMatch(html, /Next stop · route part/);
  assert.match(html, /6:45 PM/);
  assert.equal(friday.stops.at(-1).reservation.status, "Confirmed");
  assert.deepEqual(adventure, before);
});

test("optional Friday visits can be skipped without losing the scenic routing anchors", () => {
  const adventure = createArrivalAdventure();
  const original = structuredClone(adventure);
  const model = AdventureItinerary.createItineraryViewModel(adventure);
  const friday = model.find((day) => day.id === "2026-09-25");
  const ids = (segments) => segments.flatMap((segment, index) =>
    segment.points.slice(index ? 1 : 0).map((point) => point.id));
  assert.deepEqual(friday.stops.map((stop) => stop.priority),
    ["required", "planned", "planned", "optional", "optional", "planned", "required", "required"]);
  assert.equal(friday.stops[1].nextDrive, "About 2 hr");
  assert.deepEqual(friday.stops.map((stop) => stop.timeLabel), [
    "Depart 9:30 AM", "About 10:25 AM", "About 1:10 PM", "Optional stop after lunch",
    "Optional stop along the Avenue", "About 4:15–4:30 PM", "About 5:45–6:00 PM", "6:45 PM",
  ]);
  const [skipVisitor, skipBoth] = friday.stops[2].navigation.optionalBypasses;
  assert.deepEqual(ids(skipVisitor.segments), ["avenue-cafe-miranda", "avenue-myers-flat-approach",
    "avenue-visitor-center-pass-by", "founders-grove"]);
  assert.deepEqual(ids(skipBoth.segments), ["avenue-cafe-miranda", "avenue-myers-flat-approach",
    "avenue-visitor-center-pass-by", "avenue-founders-pass-by", "avenue-south-of-redcrest",
    "avenue-north-of-redcrest", "avenue-pepperwood-approach", "avenue-north-end", "ferndale"]);
  assert.deepEqual(ids(friday.stops[3].navigation.optionalBypasses[0].segments),
    ["humboldt-redwoods-visitor-center", "avenue-founders-pass-by", "avenue-south-of-redcrest",
      "avenue-north-of-redcrest", "avenue-pepperwood-approach", "avenue-north-end", "ferndale"]);
  const full = ids(friday.withoutOptionalMapSegments);
  assert.deepEqual(full, ["healdsburg-inn-departure", "nelson-family-vineyards", "avenue-south-entrance",
    ...ids(skipBoth.segments), "holiday-inn-express-eureka", "sea-grill"]);
  for (const segment of [...skipBoth.segments, ...friday.withoutOptionalMapSegments]) {
    const url = new URL(segment.url);
    assert.deepEqual((url.searchParams.get("waypoints") || "").split("|").filter(Boolean),
      segment.points.slice(1, -1).map((point) => point.query));
    assert.ok(segment.points.length <= 5);
    assert.doesNotMatch(decodeURIComponent(segment.url), /Dyerville Loop|Founders Grove|Visitor Center/);
  }
  assert.ok(model.filter((day) => day !== friday).every((day) =>
    day.withoutOptionalMapSegments.length === 0 && day.stops.every((stop) => !stop.navigation.optionalBypasses.length)));
  const html = AdventureItinerary.renderCanonicalItinerary(adventure, { selectedDayId: friday.id });
  assert.equal((html.match(/canonicalPriority optional/g) || []).length, 2);
  assert.equal((html.match(/<article class="stopCard/g) || []).length, 8);
  assert.match(html, /Next drive · About 2 hr →/);
  assert.doesNotMatch(html, /~About/);
  assert.doesNotMatch(html, /Open Day Map/);
  assert.doesNotMatch(html, /Map without optional visits/);
  assert.doesNotMatch(html, /Skip .*continue to .*Follow all numbered route parts/);
  assert.match(html, /If you skip it, simply stay on CA-254 and continue north/);
  assert.match(html, /Quick check-in and drop bags before dinner/);
  assert.match(html, /6:45 PM/);
  assert.equal(friday.stops[7].reservation.status, "Confirmed");
  assert.deepEqual(adventure, original);
});

test("routing metadata applies only to the intended adjacent leg and handles malformed metadata", () => {
  const adventure = createArrivalAdventure();
  const friday = adventure.itinerary.days.find((day) => day.id === "2026-09-25");
  const cafe = friday.stops[2];
  for (const route of [null, {}, { fromStopId: "someone-else", via: cafe.routeFromPrevious.via },
    { fromStopId: "nelson-family-vineyards", via: [null] },
    { fromStopId: "nelson-family-vineyards", via: [{ id: "bad", name: "bad", navigationQuery: "" }] }]) {
    cafe.routeFromPrevious = route;
    const model = AdventureItinerary.createItineraryViewModel(adventure).find((day) => day.id === friday.id);
    assert.equal(new URL(model.stops[1].navigation.nextStop).searchParams.get("waypoints"), null);
    assert.equal(model.stops[1].nextRouteGuidance, null);
  }
});

test("September 24 survives Adventure normalization and storage", () => {
  const adventure = createArrivalAdventure();
  const normalized =
    AdventureNormalization.normalizeAdventureRecord(
      adventure,
    );
  const storageProvider =
    AdventureStorage.createMemoryStorage();
  const storage =
    AdventureStorage.createAdventureStorage({
      storageProvider,
    });

  storage.saveAdventureRecord(normalized);

  const loaded = storage.loadAdventureRecord(
    adventure.id,
  );

  assert.deepEqual(
    loaded.itinerary.days,
    adventure.itinerary.days,
  );
  assert.deepEqual(
    loaded.reservations.items,
    adventure.reservations.items,
  );
});

test("builds a canonical Pacific view model with reservations and safe navigation", () => {
  const days =
    AdventureItinerary.createItineraryViewModel(
      createArrivalAdventure(),
    );
  const arrivalDay = days.find(
    (day) =>
      day.id ===
      AdventureData.PACIFIC_COAST_ARRIVAL_DAY_ID,
  );

    const friday = days.find(
    (day) => day.id === "2026-09-25",
  );
  const seaGrill = friday.stops.find(
    (stop) => stop.id === "sea-grill",
  );

  assert.ok(arrivalDay);
  assert.ok(friday);
  assert.ok(seaGrill);
  assert.equal(seaGrill.timeLabel, "6:45 PM");
  assert.equal(seaGrill.priority, "required");
  assert.equal(seaGrill.reservation.status, "Confirmed");
  assert.equal(seaGrill.reservation.time, "6:45 PM");
  assert.equal(arrivalDay.routeLabel, "SFO → Healdsburg");
  assert.equal(arrivalDay.stops.length, 3);
  assert.equal(
    Object.hasOwn(
      arrivalDay.stops[1].reservation,
      "confirmation",
    ),
    false,
  );
  assert.equal(
    arrivalDay.stops[2].reservation.status,
    "Confirmed",
  );
  assert.equal(
    arrivalDay.stops[0].navigation.googleMaps,
    "https://www.google.com/maps/search/?api=1&query=San%20Francisco%20International%20Airport%2C%20San%20Francisco%2C%20CA",
  );
  assert.equal(
    arrivalDay.stops[0].navigation.waze,
    "https://www.waze.com/ul?q=San%20Francisco%20International%20Airport%2C%20San%20Francisco%2C%20CA&navigate=yes",
  );
  assert.match(
    arrivalDay.stops[0].navigation.nextStop,
    /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&origin=/,
  );
});

test("keeps all Pacific land days supported and resolves compact Saturday route alternatives", () => {
  const adventure = createArrivalAdventure();
  const days =
    AdventureItinerary.createItineraryViewModel(
      adventure,
    );
  const saturday = days.find(
    (day) => day.id === "2026-09-26",
  );

  assert.deepEqual(
    days.map((day) => day.id),
    [
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
    ],
  );
  assert.equal(
    adventure.itinerary.days.every(
      AdventureItinerary.isSupportedDay,
    ),
    true,
  );
  assert.equal(saturday.routeAlternatives.length, 2);
  assert.equal(saturday.selectedRouteId, "coast-focused");
  assert.deepEqual(
    saturday.routeAlternatives.map(
      ({ id, preferred }) => ({ id, preferred }),
    ),
    [
      { id: "coast-focused", preferred: true },
      { id: "big-tree-and-coast", preferred: false },
    ],
  );
  assert.deepEqual(
    saturday.routeAlternatives[0].stops.map(
      (stop) => stop.id,
    ),
    [
      "holiday-inn-express-eureka-departure",
      "crescent-city",
      "brookings-harris-beach",
      "samuel-h-boardman-viewpoint",
      "pacific-reef-hotel",
    ],
  );
  assert.deepEqual(
    saturday.routeAlternatives[1].stops.map(
      (stop) => stop.id,
    ),
    [
      "holiday-inn-express-eureka-departure",
      "newton-b-drury-scenic-parkway",
      "big-tree-wayside",
      "crescent-city",
      "brookings-harris-beach",
      "samuel-h-boardman-viewpoint",
      "pacific-reef-hotel",
    ],
  );
  assert.equal(
    saturday.stops.some((stop) =>
      [
        "newton-b-drury-scenic-parkway",
        "big-tree-wayside",
      ].includes(stop.id),
    ),
    false,
  );
});

test("route alternatives omit malformed descriptors and unknown stops without breaking the day", () => {
  const saturday =
    AdventureData.createPacificCoastLandDays().find(
      (day) => day.id === "2026-09-26",
    );
  saturday.routeAlternatives = [
    null,
    { id: "missing-label", stopIds: [] },
    {
      id: "partially-known",
      label: "Partially known",
      preferred: true,
      stopIds: [
        "crescent-city",
        "unknown-stop",
        "big-tree-wayside",
      ],
    },
    {
      id: "all-unknown",
      label: "All unknown",
      stopIds: ["unknown-stop"],
    },
  ];

  assert.equal(
    AdventureItinerary.isSupportedDay(saturday),
    true,
  );
  assert.deepEqual(
    AdventureItinerary.createRouteAlternatives(
      saturday,
    ).map((route) => ({
      id: route.id,
      stops: route.stops.map((stop) => stop.id),
    })),
    [
      {
        id: "partially-known",
        stops: ["crescent-city", "big-tree-wayside"],
      },
    ],
  );
});

test("renders and operates the five-day Pacific Adventure Trail without mutating canonical data", () => {
  const adventure = createArrivalAdventure();
  const original = structuredClone(adventure);
  const listeners = {};
  const host = {
    innerHTML:
      AdventureItinerary.renderCanonicalItinerary(adventure),
    addEventListener(name, listener) {
      listeners[name] = listener;
    },
    contains() {
      return true;
    },
  };

  assert.match(host.innerHTML, /THE JOURNEY AHEAD/);
  assert.match(host.innerHTML, /Our Adventure Trail/);
  assert.equal(
    (host.innerHTML.match(/data-canonical-day-id=/g) || []).length,
    5,
  );
  assert.match(
    host.innerHTML,
    /Day 1[\s\S]*Thu[\s\S]*Sep 24[\s\S]*Day 2[\s\S]*Fri[\s\S]*Sep 25[\s\S]*Day 3[\s\S]*Sat[\s\S]*Sep 26[\s\S]*Day 4[\s\S]*Sun[\s\S]*Sep 27[\s\S]*Day 5[\s\S]*Mon[\s\S]*Sep 28/,
  );
  assert.match(
    host.innerHTML,
    /class="trailStop stone-1 active"[\s\S]*data-canonical-day-id="2026-09-24"[\s\S]*aria-pressed="true"/,
  );
  assert.match(host.innerHTML, /Arrival in Healdsburg/);

  const state =
    AdventureItinerary.initializeCanonicalItineraryInteractions(
      host,
      adventure,
    );
  const saturdayButton = {
    dataset: { canonicalDayId: "2026-09-26" },
    closest(selector) {
      return selector === "[data-canonical-day-id]"
        ? this
        : null;
    },
  };
  listeners.click({ target: saturdayButton });

  assert.equal(state.selectedDayId, "2026-09-26");
  assert.match(host.innerHTML, /Saturday, September 26, 2026/);
  assert.match(host.innerHTML, /Option A — Coast-focused/);
  assert.match(host.innerHTML, /Option B — Big Tree \+ Coast/);
  assert.doesNotMatch(
    host.innerHTML.match(
      /<section class="canonicalItineraryDay">[\s\S]*$/,
    )?.[0] || "",
    /Arrival in Healdsburg/,
  );
  assert.deepEqual(adventure, original);
});

test("app Pacific Daily Adventure integration renders prepared stored Saturday drive labels", () => {
  const activeAdventure =
    AdventureData.prepareBundledAdventureRecord(
      createStoredAdventureWithoutDriveMetadata(),
    );
  const markup =
    AdventureItinerary.renderPacificDailyAdventure(
      activeAdventure,
      { selectedDayId: "2026-09-26" },
    );
  const appSource = fs.readFileSync(
    require.resolve("./app.js"),
    "utf8",
  );

  assert.match(
    appSource,
    /renderPacificDailyAdventure\(\s*ACTIVE_ADVENTURE/,
  );
  assert.match(
    markup,
    /Holiday Inn Express &amp; Suites Eureka[\s\S]*Next drive · ~1 hr 40 min →/,
  );
  assert.match(
    markup,
    /Crescent City[\s\S]*Next drive · ~30 min →/,
  );
});

test("renders Saturday alternatives as an interactive single-route selector", () => {
  const markup =
    AdventureItinerary.renderCanonicalItinerary(
      createArrivalAdventure(),
      { selectedDayId: "2026-09-26" },
    );
  const alternatives = markup.match(
    /<section class="canonicalRouteAlternatives"[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(alternatives);
  assert.match(alternatives, /Choose one route for this day/);
  assert.match(
    alternatives,
    /alternate versions, not one combined route/i,
  );
  assert.match(alternatives, /Option A — Coast-focused/);
  assert.match(alternatives, /Preferred/);
  assert.match(alternatives, /Option B — Big Tree \+ Coast/);
  assert.match(alternatives, /data-route-option="coast-focused"/);
  assert.match(alternatives, /data-route-option="big-tree-and-coast"/);
  assert.match(
    alternatives,
    /data-route-option="coast-focused"[\s\S]*?aria-pressed="true"/,
  );
  assert.match(
    alternatives,
    /data-route-option="big-tree-and-coast"[\s\S]*?aria-pressed="false"/,
  );
  assert.doesNotMatch(alternatives, /<ol>|canonicalStopCard/);
});

test("switches Saturday stop cards without mutating canonical data", () => {
  const adventure = createArrivalAdventure();
  const original = structuredClone(adventure);
  const listeners = {};
  const host = {
    innerHTML:
      AdventureItinerary.renderCanonicalItinerary(
        adventure,
      ),
    addEventListener(name, listener) {
      listeners[name] = listener;
    },
    contains() {
      return true;
    },
  };
  const state =
    AdventureItinerary.initializeCanonicalItineraryInteractions(
      host,
      adventure,
    );
  const choose = (routeOption) => {
    const button = {
      dataset: {
        dayId: "2026-09-26",
        routeOption,
      },
      closest(selector) {
        return selector === "[data-route-option]"
          ? this
          : null;
      },
    };
    listeners.click({ target: button });
  };
  const chooseDay = (canonicalDayId) => {
    const button = {
      dataset: { canonicalDayId },
      closest(selector) {
        return selector === "[data-canonical-day-id]"
          ? this
          : null;
      },
    };
    listeners.click({ target: button });
  };

  assert.deepEqual(state.routeSelections, {});
  chooseDay("2026-09-26");
  assert.equal(state.selectedDayId, "2026-09-26");
  choose("big-tree-and-coast");
  assert.equal(
    state.routeSelections["2026-09-26"],
    "big-tree-and-coast",
  );
  assert.match(
    host.innerHTML,
    /Newton B\. Drury Scenic Parkway[\s\S]*Big Tree Wayside[\s\S]*Crescent City/,
  );
  assert.match(host.innerHTML, /Next drive: ~1 hr 10 min/);
  assert.match(host.innerHTML, /Next drive: ~50 min/);
  assert.match(
    host.innerHTML,
    /class="nextRoute"[^>]*>Next drive · ~1 hr 10 min →<\/a>/,
  );
  assert.match(
    host.innerHTML,
    /class="nextRoute"[^>]*>Next drive · ~50 min →<\/a>/,
  );
  assert.doesNotMatch(host.innerHTML, /Next drive: ~1 hr 40 min/);

  choose("coast-focused");
  assert.equal(
    state.routeSelections["2026-09-26"],
    "coast-focused",
  );
  const selectedSaturday =
    AdventureItinerary.createItineraryViewModel(
      adventure,
      { routeSelections: state.routeSelections },
    ).find((day) => day.id === "2026-09-26");
  assert.equal(
    selectedSaturday.stops.some((stop) =>
      /Newton B\. Drury|Big Tree Wayside/.test(stop.name),
    ),
    false,
  );
  assert.match(host.innerHTML, /Next drive: ~1 hr 40 min/);
  assert.match(host.innerHTML, /Next drive: ~45–60 min/);
  assert.match(
    host.innerHTML,
    /class="nextRoute"[^>]*>Next drive · ~1 hr 40 min →<\/a>/,
  );
  assert.match(
    host.innerHTML,
    /class="nextRoute"[^>]*>Next drive · ~45–60 min →<\/a>/,
  );
  assert.doesNotMatch(host.innerHTML, /Next drive: ~1 hr 10 min/);
  assert.deepEqual(adventure, original);
});

test("renders Monday travel notes as non-navigation day guidance", () => {
  const adventure = createArrivalAdventure();
  const monday = adventure.itinerary.days.find(
    (day) => day.id === "2026-09-28",
  );
  const markup =
    AdventureItinerary.renderCanonicalItinerary(
      adventure,
      { selectedDayId: "2026-09-28" },
    );
  const guidance = markup.match(
    /<aside class="canonicalTravelGuidance"[\s\S]*?<\/aside>/,
  )?.[0];

  assert.ok(guidance);
  assert.match(guidance, /Flexible travel guidance/);
  assert.match(
    guidance,
    /stop wherever makes the most sense/i,
  );
  assert.match(
    guidance,
    /Longview.*Lake Sacajawea.*Nutty Narrows/i,
  );
  assert.match(
    guidance,
    /somewhere else or skip the additional break entirely/i,
  );
  assert.doesNotMatch(
    guidance,
    /href=|maps|waze|nextRoute|Next stop/i,
  );
  assert.equal(
    monday.stops.some((stop) =>
      /Longview|Lake Sacajawea|Nutty Narrows/i.test(
        `${stop.name} ${stop.navigationQuery ?? ""}`,
      ),
    ),
    false,
  );
});

test("renders Pacific reservations from canonical records without public confirmations", () => {
  const adventure = createArrivalAdventure();
  const markup =
    AdventureItinerary.renderCanonicalReservations(
      adventure,
    );

  assert.match(markup, /Healdsburg Inn on Plaza/);
  assert.match(markup, /Holiday Inn Express &amp; Suites Eureka/);
  assert.match(markup, /Pacific Reef Hotel &amp; Light Show/);
  assert.match(markup, /Hallmark Resort Newport/);
  assert.match(markup, /Embassy Suites Seattle Airport/);
  assert.match(markup, /The Matheson/);
  assert.match(markup, /Sea Grill/);
    assert.match(
    markup,
    /Friday, September 25, 2026 · 6:45 PM · dinner/,
  );
  assert.match(markup, /Spinner&#039;s Seafood/);
  assert.match(markup, /Georgie&#039;s Beachside Grill/);
  assert.match(markup, /Confirmed/);
  assert.match(markup, /Preferred target/);
  assert.doesNotMatch(markup, /Confirmation/i);
  assert.doesNotMatch(
    markup,
    /Club Wyndham|Local Goat|Dollywood|Greenbrier/,
  );
});

function routePointIds(segments) {
  return segments.flatMap((segment, index) =>
    segment.points
      .slice(index === 0 ? 0 : 1)
      .map((point) => point.id),
  );
}

test("creates complete ordered Day Maps with a safe segmented fallback", () => {
  const adventure = createArrivalAdventure();
  const days =
    AdventureItinerary.createItineraryViewModel(
      adventure,
    );
  const sourceDays = new Map(
    adventure.itinerary.days.map((day) => [day.id, day]),
  );

  for (const day of days) {
    assert.ok(day.dayMapSegments.length > 0);
    assert.equal(
      day.dayMapSegments.every(
        (segment) => segment.points.length <= 5,
      ),
      true,
    );

    const expectedIds = day.routeAlternatives.length
      ? day.routeAlternatives.find(
          (route) => route.preferred,
        ).stops.map((stop) => stop.id)
      : sourceDays.get(day.id).stops.flatMap((stop) => [
          ...(stop.routeFromPrevious?.via || []).map((point) => point.id),
          stop.id,
        ]);

    assert.deepEqual(
      routePointIds(day.dayMapSegments),
      expectedIds,
    );
  }

  const mapActionCount = days.reduce(
    (count, day) =>
      count +
      (AdventureItinerary.renderCanonicalItinerary(
        adventure,
        { selectedDayId: day.id },
      ).match(/Open Day Map/g) || []).length,
    0,
  );
  assert.equal(
    mapActionCount,
    5,
  );
  const fridayHtml =
  AdventureItinerary.renderCanonicalItinerary(
    adventure,
    { selectedDayId: "2026-09-25" },
  );

assert.doesNotMatch(
  fridayHtml,
  /Open Day Map/,
);
assert.doesNotMatch(
  fridayHtml,
  /Map without optional visits/,
);
});

test("Saturday Day Map follows the selected route and Monday excludes break suggestions", () => {
  const adventure = createArrivalAdventure();
  const days =
    AdventureItinerary.createItineraryViewModel(
      adventure,
      {
        routeSelections: {
          "2026-09-26": "big-tree-and-coast",
        },
      },
    );
  const saturday = days.find(
    (day) => day.id === "2026-09-26",
  );
  const monday = days.find(
    (day) => day.id === "2026-09-28",
  );

  assert.deepEqual(
    routePointIds(saturday.dayMapSegments),
    [
      "holiday-inn-express-eureka-departure",
      "newton-b-drury-scenic-parkway",
      "big-tree-wayside",
      "crescent-city",
      "brookings-harris-beach",
      "samuel-h-boardman-viewpoint",
      "pacific-reef-hotel",
    ],
  );
  assert.doesNotMatch(
    monday.dayMapSegments
      .map((segment) => segment.url)
      .join(" "),
    /Longview|Lake Sacajawea|Nutty Narrows/i,
  );
  assert.deepEqual(
    routePointIds(monday.dayMapSegments),
    [
      "hallmark-newport-departure",
      "tillamook-creamery",
      "castle-rock",
      "chihuly-bridge-of-glass",
      "embassy-suites-seattle-airport",
    ],
  );
});

test("maps canonical destination drive durations onto the preceding stop", () => {
  const days =
    AdventureItinerary.createItineraryViewModel(
      createArrivalAdventure(),
    );
  const friday = days.find((day) => day.id === "2026-09-25");
  const sunday = days.find((day) => day.id === "2026-09-27");
  const monday = days.find((day) => day.id === "2026-09-28");

  assert.deepEqual(
    friday.stops.map((stop) => stop.nextDrive),
    [
      "55 min",
      "About 2 hr",
      "30 min",
      "10 min",
      "50 min",
      "27–30 min",
      "5–10 min",
      null,
    ],
  );
  assert.equal(
    sunday.stops.find((stop) => stop.id === "old-town-bandon")
      .nextDrive,
    "5 min",
  );
  assert.equal(
    sunday.stops.find((stop) => stop.id === "hallmark-resort-newport")
      .nextDrive,
    null,
  );
  assert.equal(
    monday.stops.find((stop) => stop.id === "tillamook-creamery")
      .nextDrive,
    "2 hr 15 min",
  );
  assert.equal(
    monday.stops.find((stop) => stop.id === "castle-rock")
      .nextDrive,
    "1 hr 30 min",
  );
  assert.equal(monday.stops.at(-1).nextDrive, null);

  const markup = ["2026-09-25", "2026-09-27", "2026-09-28"]
    .map((selectedDayId) =>
      AdventureItinerary.renderCanonicalItinerary(
        createArrivalAdventure(),
        { selectedDayId },
      ),
    )
    .join("");
  assert.match(markup, /Next drive: ~27–30 min/);
  assert.doesNotMatch(markup, /3 hr 31–57 min DIRECT/);
  assert.match(
    AdventureItinerary.renderCanonicalItinerary(
      createArrivalAdventure(),
      { selectedDayId: "2026-09-28" },
    ),
    /Tillamook Creamery[\s\S]*?Next drive · ~2 hr 15 min →[\s\S]*?Castle Rock[\s\S]*?Next drive · ~1 hr 30 min →[\s\S]*?Chihuly Bridge of Glass/,
  );
  assert.match(
    markup,
    /class="nextRoute"[^>]*>Next drive · ~27–30 min →<\/a>/,
  );
  assert.match(
    markup,
    /class="nextRoute"[^>]*>Next stop →<\/a>/,
  );
});

test("Saturday selected routes update stops and reviewed drive durations without mutation", () => {
  const adventure = createArrivalAdventure();
  const original = JSON.stringify(adventure);
  const optionA =
    AdventureItinerary.createItineraryViewModel(adventure)
      .find((day) => day.id === "2026-09-26");
  const optionB =
    AdventureItinerary.createItineraryViewModel(adventure, {
      routeSelections: {
        "2026-09-26": "big-tree-and-coast",
      },
    }).find((day) => day.id === "2026-09-26");

  assert.deepEqual(
    optionA.stops.slice(0, 5).map((stop) => stop.nextDrive),
    ["1 hr 40 min", "30 min", "15 min", "45–60 min", null],
  );
  assert.deepEqual(
    optionB.stops.slice(0, 7).map((stop) => stop.nextDrive),
    [
      "1 hr 10 min",
      "10–15 min",
      "50 min",
      "30 min",
      "15 min",
      "45 min",
      null,
    ],
  );
  assert.equal(
    optionA.stops.some((stop) => stop.id === "big-tree-wayside"),
    false,
  );
  assert.equal(
    optionB.stops.some((stop) => stop.id === "big-tree-wayside"),
    true,
  );
  assert.equal(JSON.stringify(adventure), original);
});

test("builds a Pacific trip snapshot from canonical major stops and safe navigation", () => {
  const adventure = createArrivalAdventure();
  const snapshot =
    AdventureItinerary.createTripSnapshotViewModel(
      adventure,
    );
  const markup =
    AdventureItinerary.renderTripSnapshot(
      adventure,
    );

  assert.deepEqual(
    snapshot.majorStops.map((stop) => stop.id),
    [
      "sfo-arrival",
      "healdsburg-inn",
      "holiday-inn-express-eureka",
      "pacific-reef-hotel",
      "hallmark-resort-newport",
      "chihuly-bridge-of-glass",
      "embassy-suites-seattle-airport",
    ],
  );
  assert.match(markup, /September 24, 2026/);
  assert.match(markup, /September 28, 2026/);
  assert.match(
    markup,
    /San Francisco International Airport.*Healdsburg Inn.*Holiday Inn Express.*Pacific Reef.*Hallmark Resort.*Chihuly Bridge of Glass.*Embassy Suites/s,
  );
  assert.match(
    markup,
    /Chihuly Bridge of Glass[\s\S]*Required priority/,
  );
  assert.deepEqual(
    routePointIds(snapshot.overallMapSegments),
    snapshot.majorStops.map((stop) => stop.id),
  );
  assert.equal(snapshot.overallMapSegments.length, 2);
  assert.equal(
    (markup.match(/Open Overall Trip Map/g) || []).length,
    2,
  );
  assert.match(
    markup,
    /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/,
  );
  assert.match(markup, /https:\/\/www\.waze\.com\/ul\?q=/);
  assert.match(markup, /waypoints=/);
  assert.doesNotMatch(markup, /Longview/);
  assert.doesNotMatch(markup, /Smokies|Club Wyndham/);
});

function createNavigationButton(view) {
  return {
    dataset: { view },
    hidden: false,
    innerHTML: `${view} original`,
  };
}

function createNavigationHarness() {
  const desktop = [
    "home",
    "week",
    "reservations",
    "memories",
    "packing",
    "trip",
  ].map(createNavigationButton);
  const mobile = [
    "home",
    "week",
    "packing",
    "memories",
    "companion",
  ].map(createNavigationButton);

  return {
    desktop,
    mobile,
    document: {
      querySelectorAll(selector) {
        return selector.startsWith(".desktopSideNav")
          ? desktop
          : mobile;
      },
    },
  };
}

test("configures only the four useful Pacific review destinations", () => {
  const harness = createNavigationHarness();

  AdventureItinerary.configurePacificReviewNavigation(
    harness.document,
    true,
  );

  assert.deepEqual(
    harness.desktop
      .filter((button) => !button.hidden)
      .map((button) => button.dataset.view),
    ["home", "week", "reservations", "trip"],
  );
  assert.match(harness.desktop[1].innerHTML, /🛣️/);
  assert.deepEqual(
    harness.mobile
      .filter((button) => !button.hidden)
      .map((button) => button.dataset.view),
    ["home", "week", "reservations", "trip"],
  );
  assert.match(harness.mobile[1].innerHTML, /🛣️/);
  assert.equal(harness.mobile[4].hidden, true);
});

test("leaves Smokies navigation unchanged", () => {
  const harness = createNavigationHarness();
  const before = JSON.parse(
    JSON.stringify({
      desktop: harness.desktop,
      mobile: harness.mobile,
    }),
  );

  AdventureItinerary.configurePacificReviewNavigation(
    harness.document,
    false,
  );

  assert.deepEqual(
    {
      desktop: harness.desktop,
      mobile: harness.mobile,
    },
    before,
  );
});

test("escapes route-alternative labels, stop notes, and travel guidance", () => {
  const adventure = createArrivalAdventure();
  const saturday = adventure.itinerary.days.find(
    (day) => day.id === "2026-09-26",
  );
  const monday = adventure.itinerary.days.find(
    (day) => day.id === "2026-09-28",
  );

  saturday.routeAlternatives[0].label =
    '<script data-route="unsafe">Route</script>';
  saturday.stops[0].notes =
    '<img src=x onerror="unsafe">';
  monday.travelNotes = [
    '<script data-guidance="unsafe">Break</script>',
  ];

  const markup = ["2026-09-26", "2026-09-28"]
    .map((selectedDayId) =>
      AdventureItinerary.renderCanonicalItinerary(
        adventure,
        { selectedDayId },
      ),
    )
    .join("");

  assert.doesNotMatch(markup, /<script data-|<img src=x/);
  assert.match(
    markup,
    /&lt;script data-route=&quot;unsafe&quot;&gt;Route&lt;\/script&gt;/,
  );
  assert.match(
    markup,
    /&lt;img src=x onerror=&quot;unsafe&quot;&gt;/,
  );
  assert.match(
    markup,
    /&lt;script data-guidance=&quot;unsafe&quot;&gt;Break&lt;\/script&gt;/,
  );
});

test("renders the canonical Pacific itinerary without Smokies tables", () => {
  const markup =
    AdventureItinerary.renderCanonicalItinerary(
      createArrivalAdventure(),
    );

  assert.match(markup, /Thursday, September 24, 2026/);
  assert.match(markup, /SFO → Healdsburg/);
  assert.match(markup, /Healdsburg Inn on Plaza/);
  assert.match(markup, /Healdsburg King/);
  assert.match(markup, /check-in after 4 PM/);
  assert.match(markup, /call before 2 PM/);
  assert.match(markup, /checkout 11 AM/);
  assert.match(markup, /The Matheson/);
  assert.match(markup, /Reservation time not yet supplied/);
  assert.doesNotMatch(markup, /Smokies|Club Wyndham|DAY_DASH|STOP_DATA/);
});

test("returns no canonical markup for an empty itinerary", () => {
  assert.equal(
    AdventureItinerary.renderCanonicalItinerary(
      AdventureData.createPacificCoastAdventureRecord(),
    ),
    "",
  );
});

test("rejects non-empty itinerary data outside the supported day contract", () => {
  const adventure =
    AdventureData.createPacificCoastAdventureRecord();
  adventure.itinerary.days = [
    {
      id: "draft-day",
      date: "2026-09-25",
      title: "Draft",
      stops: [],
    },
  ];

  assert.equal(
    AdventureItinerary.isSupportedDay(
      adventure.itinerary.days[0],
    ),
    false,
  );
  assert.equal(
    AdventureItinerary.renderCanonicalItinerary(
      adventure,
    ),
    "",
  );
});
