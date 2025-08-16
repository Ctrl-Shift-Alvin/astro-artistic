/* eslint-disable import/unambiguous */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `offline-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline/';

self.addEventListener(
	'install',
	(event) => {

		event.waitUntil(caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll([ OFFLINE_URL ])));
		self.skipWaiting();

	}
);

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

self.addEventListener(
	'fetch',
	(event) => {

		if (event.request.method !== 'GET')
			return;

		event.respondWith(fetch(event.request).catch(() => caches
			.match(event.request)
			.then((response) => response || caches.match(OFFLINE_URL))));

	}
);
