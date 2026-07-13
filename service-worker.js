const CACHE_NAME = "star-sprout-ipad-production-v1-1-1";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/island-base-zero.jpg",
  "./assets/layer-cottage.png",
  "./assets/layer-forest.png",
  "./assets/layer-library.png",
  "./assets/layer-mascot.png",
  "./assets/layer-path.png",
  "./assets/layer-slide.png",
  "./assets/nature-island-scene.jpg",
  "./assets/ocean-island-base.jpg",
  "./assets/ocean-island-complete.jpg",
  "./assets/ocean-layer-bubbles.png",
  "./assets/ocean-layer-coral.png",
  "./assets/ocean-layer-delivery.png",
  "./assets/ocean-layer-path.png",
  "./assets/ocean-layer-postoffice.png",
  "./assets/robot-island-base.jpg",
  "./assets/robot-island-complete.jpg",
  "./assets/robot-layer-gears.png",
  "./assets/robot-layer-lab.png",
  "./assets/robot-layer-path.png",
  "./assets/robot-layer-solar.png",
  "./assets/robot-layer-tower.png",
  "./assets/coconut-island-base.jpg",
  "./assets/coconut-layer-island.png",
  "./assets/coconut-layer-animals.png",
  "./assets/coconut-layer-trunk.png",
  "./assets/coconut-layer-leaves.png",
  "./assets/coconut-layer-fruit.png",
  "./assets/coconut-layer-grove.png",
  "./assets/coconut-island-complete.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
