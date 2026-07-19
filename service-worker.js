const CACHE_NAME = "star-sprout-production-v1-3-3";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=1.3.3",
  "./app.js?v=1.3.3",
  "./rainforest.js?v=1.3.3",
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
  "./assets/robot-layer-tower.png",
  "./assets/robot-layer-energy-garden.png",
  "./assets/robot-layer-workshop.png",
  "./assets/robot-layer-helperbots.png",
  "./assets/robot-layer-drone.png",
  "./assets/robot-layer-sparkles.png",
  "./assets/robot-island-mars-base.jpg",
  "./assets/robot-island-mars-complete.jpg",
  "./assets/coconut-build-01.png",
  "./assets/coconut-build-02.png",
  "./assets/coconut-build-03.png",
  "./assets/coconut-build-04.png",
  "./assets/coconut-build-05.png",
  "./assets/coconut-build-06.png",
  "./assets/coconut-build-07.png",
  "./assets/coconut-build-08.png",
  "./assets/coconut-build-09.png",
  "./assets/coconut-build-10.png",
  "./assets/coconut-build-11.png",
  "./assets/coconut-build-12.png",
  "./assets/coconut-build-13.png",
  "./assets/coconut-build-14.png",
  "./assets/coherent-coconut-complete.jpg",
  "./assets/coherent-nature-complete.jpg",
  "./assets/coherent-robot-base.jpg",
  "./assets/coherent-robot-complete.jpg",
  "./assets/nature-build-01.png",
  "./assets/nature-build-02.png",
  "./assets/nature-build-03.png",
  "./assets/nature-build-04.png",
  "./assets/nature-build-05.png",
  "./assets/nature-build-06.png",
  "./assets/nature-build-07.png",
  "./assets/nature-build-08.png",
  "./assets/nature-build-09.png",
  "./assets/nature-build-10.png",
  "./assets/robot-build-01-terrain.png",
  "./assets/robot-build-02.png",
  "./assets/robot-build-03.png",
  "./assets/robot-build-04.png",
  "./assets/robot-build-05.png",
  "./assets/robot-build-06.png",
  "./assets/robot-build-07.png",
  "./assets/robot-build-08.png",
  "./assets/robot-build-09.png",
  "./assets/robot-build-10.png",
  "./assets/robot-build-11.png",
  "./assets/robot-build-12.png",
  "./assets/robot-build-13.png",
  "./assets/robot-build-14.png",
  "./assets/robot-build-15.png",
  "./assets/robot-build-16.png",
  "./assets/robot-build-17.png",
  "./assets/robot-build-18.png",
  "./assets/robot-build-19.png",
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
