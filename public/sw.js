/* eslint-disable import-x/unambiguous */

importScripts('build.js');

// FIXME css fetch error on hot reload

// #region CONFIGURATION
const CACHE_NAME = `cache-${self.__BUILD__.buildNumber}` || 'cache-0';
const OFFLINE_URL = '/offline/';
const FOURTWENTYNINE_URL = '/429/';
const NAV_URLS = [
	OFFLINE_URL,
	FOURTWENTYNINE_URL
];
const STATIC_ASSETS = [
	'/favicon.ico',
	'/images/banner.png',
	'/images/piano-hands.png',
	'/images/facebook-icon.png',
	'/images/linkedin-icon.png',
	'/images/twitter-icon.png',
	'/images/youtube-icon.png'
];

// #endregion

self.oninstall = (event) => {

	event.waitUntil((async() => {

		// Take control of clients immediately
		await self.skipWaiting();

	})());

};

self.onactivate = (event) => {

	event.waitUntil((async() => {

		// First take control of clients
		await self.clients.claim();

		// Delete outdated caches
		await Promise.all((await caches.keys())
			.filter((k) => k !== CACHE_NAME)
			.map((k) => caches.delete(k)));

		// Refetch and recache pages
		await cacheNavUrls();
		await cacheStaticAssets();

	})());

};

self.addEventListener(
	'fetch',
	(event) => {

		// Handle navigation requests
		if (event.request.mode === 'navigate') {

			event.respondWith(handleNavigationRequest(event));

		}

		const url = new URL(event.request.url);

		// Handle listed static assets
		if (STATIC_ASSETS.includes(url.pathname) || url.pathname.endsWith('.css')) {

			event.respondWith(handleCacheRequest(event));

		}

	}
);

// #region HELPER FUNCTIONS

const offlineResponse = () => new Response(
	null,
	{
		status: 599,
		statusText: 'offline'
	}
);

const cacheStaticAssets = () => caches
	.open(CACHE_NAME)
	.then(async(cache) => {

		return cacheAddAllBypass(
			cache,
			STATIC_ASSETS
		);

	});

const cacheNavUrls = async() => {

	return caches
		.open(CACHE_NAME)
		.then(async(cache) => {

			let cssUrls = new Set();
			for (const navUrl of NAV_URLS) {

				// Fetch page
				const response = await fetchResponse(new Request(
					navUrl,
					{ cache: 'no-store' }
				));
				if (!response.ok || response.status == 599) {

					throw new Error(`Failed to fetch ${response.url}: ${response.status}, '${response.statusText}'`);

				}
				await cache.put(
					navUrl,
					response.clone()
				);

				/*
				 * Parse relative CSS URLs and filter out already-fetched URLs
				 * Tip: Depending on Astro's settings, a page's style might be inlined as a module, or made external,
				 * through a <link rel="stylesheet" href="..." /> element. In case the latter happens, also fetch the styles.
				 */
				const text = await response
					.clone()
					.text();
				[ ...text.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi) ]
					.map((match) => match[1])
					.forEach((e) => cssUrls.add(e));

			}

			// Fetch and cache relative styles for the fetched pages
			for (const cssUrl of cssUrls) {

				const cssResponse = await fetchResponse(
					cssUrl,
					{ cache: 'no-store' }
				);
				if (!cssResponse.ok || cssResponse.status == 599) {

					console.log(`Failed to fetch CSS file '${cssUrl}': ${cssResponse.statusText}, ${cssResponse.status}'`);

				}
				await cache.put(
					cssUrl,
					cssResponse
				);

			}

		});

};

async function fetchResponse(url) {

	return fetch(url).catch(() => offlineResponse());

}

async function cacheAddAllBypass(
	cache,
	urls
) {

	for (const url of urls) {

		const response = await fetchResponse(new Request(
			url,
			{ cache: 'no-store' }
		));
		if (!response.ok) {

			throw new Error(`Failed to fetch ${url}: ${response.status}, '${response.statusText}'`);

		}
		await cache.put(
			url,
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
		hash = (((hash << 5) + hash) + view[i]) | 0; /* eslint-disable-line @stylistic/no-extra-parens */

	}

	// Unsigned int
	return (hash >>> 0).toString(36);

}

// #endregion

// #region HANDLERS

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

	return fetchResponse(event.request).then(async(networkResponse) => {

		switch (networkResponse.status) {

			case 429:
				return handle429Response(networkResponse);

			case 502:
				return await caches.match(OFFLINE_URL);

			case 503:
				return await caches.match(OFFLINE_URL); // Change later to server maintenance page

			case 504:
				return await caches.match(OFFLINE_URL);

			case 599: // Response failed
				return await caches.match(OFFLINE_URL);

			default:
				return networkResponse;

		}

	});

}

async function handleCacheRequest(event) {

	const cachedResponse = await caches.match(event.request);
	const fetchPromise = fetchResponse(event.request).then(async(initialNetworkResponse) => {

		// Only cache status 200 responses
		if (initialNetworkResponse.status == 200 || !cachedResponse) {

			await caches
				.open(CACHE_NAME)
				.then((cache) => cache.put(
					event.request,
					initialNetworkResponse
				));

		}

		return initialNetworkResponse;

	});

	event.waitUntil(fetchPromise);

	// Return cached response if available, otherwise the network response
	return cachedResponse || fetchPromise;

}

// #endregion
