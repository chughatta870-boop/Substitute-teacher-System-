const CACHE_NAME = "subteacher-v1";
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json"
];

// 1. Install - فائلیں Cache میں Save کر دو
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Files Cached");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate - پرانا Cache Delete کر دو
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key!== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch - اگر انٹرنیٹ نہیں تو Cache سے دو
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
