const CACHE_PREFIX = "star-sprout-production-";
const CACHE_NAME = `${CACHE_PREFIX}v1-3-5`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css?v=1.3.4",
  "./app.js?v=1.3.4",
  "./rainforest.js?v=1.3.4"
];

const OPTIONAL_ASSETS = [
  "assets/coconut-build-01.png",
  "assets/coconut-build-02.png",
  "assets/coconut-build-03.png",
  "assets/coconut-build-04.png",
  "assets/coconut-build-05.png",
  "assets/coconut-build-06.png",
  "assets/coconut-build-07.png",
  "assets/coconut-build-08.png",
  "assets/coconut-build-09.png",
  "assets/coconut-build-10.png",
  "assets/coconut-build-11.png",
  "assets/coconut-build-12.png",
  "assets/coconut-build-13.png",
  "assets/coconut-build-14.png",
  "assets/coconut-island-base.jpg",
  "assets/coconut-island-complete.jpg",
  "assets/coconut-layer-animals.png",
  "assets/coconut-layer-fruit.png",
  "assets/coconut-layer-grove.png",
  "assets/coconut-layer-island.png",
  "assets/coconut-layer-leaves.png",
  "assets/coconut-layer-trunk.png",
  "assets/coherent-coconut-complete.jpg",
  "assets/coherent-nature-complete.jpg",
  "assets/coherent-robot-base.jpg",
  "assets/coherent-robot-complete.jpg",
  "assets/icon-180.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/island-base-zero.jpg",
  "assets/layer-cottage.png",
  "assets/layer-forest.png",
  "assets/layer-library.png",
  "assets/layer-mascot.png",
  "assets/layer-path.png",
  "assets/layer-slide.png",
  "assets/nature-build-01.png",
  "assets/nature-build-02.png",
  "assets/nature-build-03.png",
  "assets/nature-build-04.png",
  "assets/nature-build-05.png",
  "assets/nature-build-06.png",
  "assets/nature-build-07.png",
  "assets/nature-build-08.png",
  "assets/nature-build-09.png",
  "assets/nature-build-10.png",
  "assets/nature-island-scene.jpg",
  "assets/rainforest-island-base.jpg",
  "assets/rainforest-island-complete.jpg",
  "assets/rf-arapaima.png",
  "assets/rf-butterfly.png",
  "assets/rf-capybara.png",
  "assets/rf-dew.png",
  "assets/rf-frog-blue.png",
  "assets/rf-frog-green.png",
  "assets/rf-jaguar.png",
  "assets/rf-lily.png",
  "assets/rf-monkey.png",
  "assets/rf-parrot.png",
  "assets/rf-piranha.png",
  "assets/rf-plant.png",
  "assets/rf-rafflesia.png",
  "assets/rf-rain.png",
  "assets/rf-river.png",
  "assets/rf-sloth.png",
  "assets/rf-soil.png",
  "assets/rf-toucan.png",
  "assets/rf-tree-left.png",
  "assets/rf-tree-right.png",
  "assets/rf-vine.png",
  "assets/robot-build-01-terrain.png",
  "assets/robot-build-02.png",
  "assets/robot-build-03.png",
  "assets/robot-build-04.png",
  "assets/robot-build-05.png",
  "assets/robot-build-06.png",
  "assets/robot-build-07.png",
  "assets/robot-build-08.png",
  "assets/robot-build-09.png",
  "assets/robot-build-10.png",
  "assets/robot-build-11.png",
  "assets/robot-build-12.png",
  "assets/robot-build-13.png",
  "assets/robot-build-14.png",
  "assets/robot-build-15.png",
  "assets/robot-build-16.png",
  "assets/robot-build-17.png",
  "assets/robot-build-18.png",
  "assets/robot-build-19.png",
  "assets/robot-island-base.jpg",
  "assets/robot-island-complete.jpg",
  "assets/robot-island-mars-base.jpg",
  "assets/robot-island-mars-complete.jpg",
  "assets/robot-layer-drone.png",
  "assets/robot-layer-energy-garden.png",
  "assets/robot-layer-gears.png",
  "assets/robot-layer-helperbots.png",
  "assets/robot-layer-lab.png",
  "assets/robot-layer-path.png",
  "assets/rf-v2-river-01.svg",
  "assets/rf-v2-river-02.svg",
  "assets/rf-v2-river-03.svg",
  "assets/rf-v2-river-04.svg",
  "assets/rf-v2-river-05.svg",
  "assets/rf-v2-river-06.svg",
  "assets/rf-v2-river-07.svg",
  "assets/rf-v2-river-08.svg",
  "assets/rf-v2-lily-01.svg",
  "assets/rf-v2-lily-02.svg",
  "assets/rf-v2-lily-03.svg",
  "assets/rf-v2-lily-04.svg",
  "assets/rf-v2-lily-05.svg",
  "assets/rf-v2-lily-06.svg",
  "assets/rf-v2-tree-01.svg",
  "assets/rf-v2-tree-02.svg",
  "assets/rf-v2-tree-03.svg",
  "assets/rf-v2-tree-04.svg",
  "assets/rf-v2-tree-05.svg",
  "assets/rf-v2-tree-06.svg",
  "assets/rf-v2-vine-01.svg",
  "assets/rf-v2-vine-02.svg",
  "assets/rf-v2-vine-03.svg",
  "assets/rf-v2-vine-04.svg",
  "assets/rf-v2-vine-05.svg",
  "assets/rf-v2-vine-06.svg",
  "assets/rf-v2-vine-07.svg",
  "assets/rf-v2-vine-08.svg",
  "assets/rf-v2-rafflesia-01.svg",
  "assets/rf-v2-rafflesia-02.svg",
  "assets/rf-v2-rafflesia-03.svg",
  "assets/rf-v2-rafflesia-04.svg",
  "assets/rf-v2-rain-01.svg",
  "assets/rf-v2-rain-02.svg",
  "assets/rf-v2-rain-03.svg",
  "assets/rf-v2-rain-04.svg",
  "assets/rf-v2-rain-05.svg",
  "assets/rf-v2-dew-01.svg",
  "assets/rf-v2-dew-02.svg",
  "assets/rf-v2-dew-03.svg",
  "assets/rf-v2-dew-04.svg",
  "assets/rf-v2-dew-05.svg",
  "assets/rf-v2-piranha-01.svg",
  "assets/rf-v2-piranha-02.svg",
  "assets/rf-v2-piranha-03.svg",
  "assets/rf-v2-piranha-04.svg",
  "assets/rf-v2-piranha-05.svg",
  "assets/rf-v2-arapaima-01.svg",
  "assets/rf-v2-arapaima-02.svg",
  "assets/rf-v2-arapaima-03.svg",
  "assets/rf-v2-animal-01.svg",
  "assets/rf-v2-animal-02.svg",
  "assets/rf-v2-animal-03.svg",
  "assets/rf-v2-animal-04.svg",
  "assets/rf-v2-animal-05.svg",
  "assets/rf-v2-animal-06.svg",
  "assets/rf-v2-animal-07.svg",
  "assets/rf-v2-animal-08.svg",
  "assets/rf-v2-animal-09.svg",
  "assets/rf-v2-animal-10.svg",
  "assets/rf-v2-animal-11.svg",
  "assets/rf-v2-animal-12.svg",
  "assets/rf-v2-soil-01.svg",
  "assets/rf-v2-soil-02.svg",
  "assets/rf-v2-soil-03.svg",
  "assets/rf-v2-soil-04.svg",
  "assets/rf-v2-soil-05.svg",
  "assets/rf-v2-soil-06.svg",
  "assets/rf-v2-plant-01.svg",
  "assets/rf-v2-plant-02.svg",
  "assets/rf-v2-plant-03.svg",
  "assets/rf-v2-plant-04.svg",
  "assets/rf-v2-plant-05.svg",
  "assets/rf-v2-plant-06.svg",
  "assets/rf-v2-plant-07.svg",
  "assets/rf-v2-plant-08.svg",
  "assets/rf-v2-plant-09.svg",
  "assets/rf-v2-plant-10.svg",
  "assets/rf-v2-plant-11.svg",
  "assets/rf-v2-plant-12.svg"
];

async function cacheOne(cache, url) {
  try {
    const request = new Request(url, { cache: "reload" });
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") {
      await cache.put(request, response.clone());
      return true;
    }
    console.warn("Service Worker：缓存失败", url, response.status);
  } catch (error) {
    console.warn("Service Worker：缓存异常", url, error);
  }
  return false;
}

async function cacheMany(cache, urls) {
  const unique = [...new Set(urls)];
  await Promise.all(unique.map(url => cacheOne(cache, url)));
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cacheMany(cache, CORE_ASSETS);
    await cacheMany(cache, OPTIONAL_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

async function putInCurrentCache(request, response) {
  if (!response || (!response.ok && response.type !== "opaque")) return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    return putInCurrentCache(request, response);
  } catch (error) {
    return (
      await caches.match(request) ||
      await caches.match("./index.html") ||
      await caches.match("./")
    );
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(response => putInCurrentCache(request, response))
    .catch(() => null);
  return cached || networkPromise || Response.error();
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    return putInCurrentCache(request, response);
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }

  const destination = request.destination;
  if (destination === "script" || destination === "style" || destination === "manifest") {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (destination === "image" || url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
