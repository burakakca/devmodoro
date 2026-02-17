const CACHE_NAME = "devmodoro-v1";
const STATIC_ASSETS = ["/", "/about", "/favicon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		}),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name)),
			);
		}),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (url.origin === "https://api.github.com") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					const responseClone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseClone);
					});
					return response;
				})
				.catch(() => caches.match(request)),
		);
		return;
	}

	if (request.destination === "audio") {
		event.respondWith(
			caches.match(request).then((response) => {
				if (response) return response;
				return fetch(request).then((response) => {
					const responseClone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseClone);
					});
					return response;
				});
			}),
		);
		return;
	}

	if (request.method === "GET") {
		event.respondWith(
			caches.match(request).then((response) => {
				return response || fetch(request);
			}),
		);
	}
});
