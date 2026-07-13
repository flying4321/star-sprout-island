const CACHE_NAME = "star-sprout-production-v1-2-6";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./rainforest.js",
  "./manifest.webmanifest",
  "./assets/coconut-island-base.jpg",
  "./assets/coconut-island-complete.jpg",
  "./assets/coconut-layer-animals.png",
  "./assets/coconut-layer-fruit.png",
  "./assets/coconut-layer-grove.png",
  "./assets/coconut-layer-island.png",
  "./assets/coconut-layer-leaves.png",
  "./assets/coconut-layer-trunk.png",
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
  "./assets/rainforest-island-base.jpg",
  "./assets/rainforest-island-complete.jpg",
  "./assets/rf-arapaima.png",
  "./assets/rf-butterfly.png",
  "./assets/rf-capybara.png",
  "./assets/rf-dew.png",
  "./assets/rf-frog-blue.png",
  "./assets/rf-frog-green.png",
  "./assets/rf-jaguar.png",
  "./assets/rf-lily.png",
  "./assets/rf-monkey.png",
  "./assets/rf-parrot.png",
  "./assets/rf-piranha.png",
  "./assets/rf-plant.png",
  "./assets/rf-rafflesia.png",
  "./assets/rf-rain.png",
  "./assets/rf-river.png",
  "./assets/rf-sloth.png",
  "./assets/rf-soil.png",
  "./assets/rf-toucan.png",
  "./assets/rf-tree-left.png",
  "./assets/rf-tree-right.png",
  "./assets/rf-vine.png",
  "./assets/robot-island-base.jpg",
  "./assets/robot-island-complete.jpg",
  "./assets/robot-layer-gears.png",
  "./assets/robot-layer-lab.png",
  "./assets/robot-layer-path.png",
  "./assets/robot-layer-solar.png",
  "./assets/robot-layer-tower.png"
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
            caches
              .open(CACHE_NAME)
              .then(cache => cache.put("./index.html", response.clone()));
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
            caches
              .open(CACHE_NAME)
              .then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
