/* eslint-disable import-x/unambiguous */

// #region CONFIGURATION

const CACHE_NAME = 'cache-v2';
const OFFLINE_URL = '/offline/';
const FOURTWENTYNINE_URL = '/429/';
const STATIC_ASSETS = [
	'/favicon.ico',
	'/images/banner.png',
	'/images/piano-hands.png'
];
const ASSETS_TO_CACHE = [
	...STATIC_ASSETS,
	OFFLINE_URL,
	FOURTWENTYNINE_URL
];

// #endregion

self.oninstall = (event) => {

	event.waitUntil((async() => {

		const cache = await caches.open(CACHE_NAME);

		// Cache assets
		await addAllWithBypass(
			cache,
			ASSETS_TO_CACHE
		);

		// Activate immediately
		await self.skipWaiting();

	})());

};

self.onactivate = (event) => {

	event.waitUntil((async() => {

		const cache = await caches.open(CACHE_NAME);

		// Delete outdated caches
		const keys = await caches.keys();
		await Promise.all(keys
			.filter((k) => k !== CACHE_NAME)
			.map((k) => caches.delete(k)));

		// Refetch and recache /offline/ and /429/ pages
		await addAllWithBypass(
			cache,
			[
				OFFLINE_URL,
				FOURTWENTYNINE_URL
			]
		);

		// Take control of clients immediately
		await self.clients.claim();

		// Check if CSS is cached, otherwise reload with the sw active this time, and let 'fetch' cache the CSS files
		const cachedRequests = await cache.keys();
		const hasCSS = cachedRequests.some((request) => request.url.endsWith('.css'));

		if (!hasCSS) {

			requestReload();

		}

	})());

};

self.addEventListener(
	'fetch',
	(event) => {

		// Handle navigation requests with offline fallback
		if (event.request.mode === 'navigate') {

			event.respondWith(handleNavigationRequest(event));

		} else {

			event.respondWith(handleStaticAssetRequest(event));

		}

	}
);

// #region HANDLERS

async function addAllWithBypass(
	cache,
	urls
) {

	for (const url of urls) {

		const request = new Request(
			`${url}?t=${Date.now()}`,
			{ cache: 'no-store' }
		);

		const response = await fetch(request);
		if (!response.ok) {

			throw new Error(`Failed to fetch ${request.url}: ${response.statusText}`);

		}
		await cache.put(
			url, // Store against the original URL
			response
		);

	}

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

let hasSentReload = false;
function requestReload() {

	if (hasSentReload)
		return;
	hasSentReload = true;

	self.clients
		.matchAll()
		.then((clients) => {

			clients.forEach((cl) => cl.postMessage({ type: 'RELOAD_PAGE' }));

		});

	hasSentReload = false;

}

async function handle429Response(response) {

	const retryAfter = response.headers.get('Retry-After');
	const cached429 = await caches.match(FOURTWENTYNINE_URL);

	if (!cached429) {

		return response;

	}

	// Inject retryAfter value
	const body = await cached429.text();
	const newBody = body.replace(
		'<script>',
		`<script>window.retryAfter = ${JSON.stringify(retryAfter)};\n`
	);

	const headers = new Headers(cached429.headers);
	headers.set(
		'Content-Type',
		'text/html'
	);

	return new Response(
		newBody,
		{
			status: 429,
			statusText: 'too-many-requests',
			headers: headers
		}
	);

}

async function handleNavigationRequest(event) {

	return fetch(event.request)
		.then(async(networkResponse) => {

			let response;
			switch (networkResponse.status) {

				case 429:
					response = handle429Response(networkResponse);
					break;

				case 502:
					response = await caches.match(OFFLINE_URL);
					break;

				case 503:
					response = await caches.match(OFFLINE_URL); // Change later to server maintenance page
					break;

				case 504:
					response = await caches.match(OFFLINE_URL);
					break;

				default:
					return networkResponse;

			}

			return new Response(
				response.body,
				{
					status: 200,
					statusText: 'overriden'
				}
			);

		})
		.catch(async() => {

			// If fetch fails, return offline page
			return await caches.match(OFFLINE_URL);

		});

}

async function handleStaticAssetRequest(event) {

	const offlineResponse = () => new Response(
		null,
		{
			status: 599,
			statusText: 'offline'
		}
	);

	const cachedResponse = await caches.match(event.request);

	const fetchPromise = fetch(event.request)
		.then(async(initialNetworkResponse) => {

			// Handle error packages
			switch (initialNetworkResponse.status) {

				case 429:
					requestReload();
					return offlineResponse();

				case 502:
					return offlineResponse();

				case 503:
					return offlineResponse();

				case 504:
					return offlineResponse();

			}

			const cache = await caches.open(CACHE_NAME);

			const networkResponse = initialNetworkResponse.clone();
			const networkBodyBuffer = await initialNetworkResponse.arrayBuffer();
			const networkBodyHash = calculateHash(networkBodyBuffer);

			// Append asset hash
			const newHeaders = new Headers(networkResponse.headers);
			newHeaders.append(
				'X-Asset-Hash',
				networkBodyHash
			);

			// Cache response
			await cache.put(
				event.request,
				new Response(
					networkBodyBuffer,
					{
						headers: newHeaders,
						status: networkResponse.status,
						statusText: networkResponse.statusText
					}
				)
			);

			// If a cached response is found, compare hashes, and trigger a reload if different
			if (cachedResponse) {

				const cachedHash = cachedResponse.headers.get('X-Asset-Hash');
				if (cachedHash !== networkBodyHash) {

					requestReload();

				}

			}

			return initialNetworkResponse;

		})
		.catch(async() => {

			return offlineResponse();

		});

	// Return cached response if available, otherwise the network response
	return cachedResponse || fetchPromise;

}

// #endregion
