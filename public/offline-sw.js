/* eslint-disable import/unambiguous */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `offline-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline/';

const PRECACHE_ASSETS = [
	OFFLINE_URL,
	'/favicon.ico'
];

// On Install: Pre-cache the offline page and assets
self.addEventListener(
	'install',
	(event) => {

		event.waitUntil(caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_ASSETS)));
		self.skipWaiting();

	}
);

// On Activation: Clean up old caches
self.addEventListener(
	'activate',
	(event) => {

		event.waitUntil(caches
			.keys()
			.then((keys) => Promise.all(keys.map((key) => {

				if (key !== CACHE_NAME) {

					return caches.delete(key);

				}

			}))));
		self.clients.claim();

	}
);

// On Fetch: Intercept navigation requests to provide an offline fallback
self.addEventListener(
	'fetch',
	(event) => {

		// Only handle navigation requests
		if (event.request.mode === 'navigate') {

			event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));

		}

	}
);
