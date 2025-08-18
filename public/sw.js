/* eslint-disable import/unambiguous */

// #region CONFIGURATION

const CACHE_NAME = 'cache-v1';
const OFFLINE_URL = '/offline/';
const STATIC_ASSETS = [
	'/favicon.ico',
	'/images/banner.png',
	'/images/piano-hands.png'
];
const ASSETS_TO_CACHE = [
	...STATIC_ASSETS,
	OFFLINE_URL
];

// #endregion

// #region INSTALLATION

self.addEventListener(
	'install',
	(event) => {

		event.waitUntil(caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(ASSETS_TO_CACHE)));
		self.skipWaiting();

	}
);

// #endregion

// #region ACTIVATION

self.addEventListener(
	'activate',
	(event) => {

		event.waitUntil(caches
			.keys()
			.then((cacheNames) => {

				// Delete outdated caches
				return Promise.all(cacheNames.map((cacheName) => {

					if (cacheName !== CACHE_NAME) {

						return caches.delete(cacheName);

					}

				}));

			}));
		self.clients.claim();

	}
);

// #endregion

// #region FETCH
self.addEventListener(
	'fetch',
	(event) => {

		// Handle navigation requests with offline fallback
		if (event.request.mode === 'navigate') {

			handleNavigationRequest(event);

		} else {

			// Handle static asset requests with cache-first strategy
			handleStaticAssetRequest(event);

		}

	}
);

// #endregion

// #region HANDLERS

function handleNavigationRequest(event) {

	// Return offline page
	event.respondWith(fetch(event.request).catch(() => {

		return caches.match(OFFLINE_URL);

	}));

}

function calculateHash(buffer) {

	const view = new Uint8Array(buffer);

	// djb2 algorithm
	let hash = 5381;
	for (let i = 0; i < view.length; i++) {

		// hash * 33 + current byte -> truncate
		hash = (((hash << 5) + hash) + view[i]) | 0;

	}

	// Unsigned int
	return (hash >>> 0).toString(36);

}

function handleStaticAssetRequest(event) {

	event.respondWith(caches
		.open(CACHE_NAME)
		.then(async(cache) => {

			const cachedResponse = await cache.match(event.request);
			const fetchPromise = fetch(event.request).then(async(networkResponse) => {

				if (networkResponse && networkResponse.status === 200) {

					const responseToCache = networkResponse.clone();
					const bodyBuffer = await responseToCache.arrayBuffer();
					const networkHash = await calculateHash(bodyBuffer);

					if (cachedResponse) {

						const cachedHash = cachedResponse.headers.get('X-Asset-Hash');

						// If the hash is different, send a reload message.
						if (cachedHash !== networkHash) {

							self.clients
								.matchAll()
								.then((clients) => {

									clients.forEach((client) => client.postMessage({ type: 'RELOAD_PAGE' }));

								});

						}

					}

					const headers = new Headers(responseToCache.headers);
					headers.append(
						'X-Asset-Hash',
						networkHash
					);

					const responseWithHash = new Response(
						bodyBuffer,
						{
							headers,
							status: responseToCache.status,
							statusText: responseToCache.statusText
						}
					);

					await cache.put(
						event.request,
						responseWithHash
					);

				}
				return networkResponse;

			});

			return cachedResponse || fetchPromise;

		}));

}

// #endregion
