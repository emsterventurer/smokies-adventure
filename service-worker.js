importScripts("./config.js","./version.js");

const BUILD=self.AdventureCompanionBuild||{
  cache:"adventure-companion-fallback"
};

const CACHE_NAME=BUILD.cache;

const CORE_FILES=[
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./version.js",
  "./reliability.js",
  "./weather-service.js",
  "./weather-ui.js",
  "./packing.js",
  "./app.js",
  "./manifest.json",
  "./smokies_itinerary.json",
  "./packing.json"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(CORE_FILES))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(key=>key!==CACHE_NAME)
          .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;

  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached||fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME)
            .then(cache=>cache.put(event.request,copy))
            .catch(()=>{});
          return response;
        })
      )
  );
});
