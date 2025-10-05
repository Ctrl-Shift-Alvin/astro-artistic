/* eslint-disable import-x/unambiguous */

// Assigns self.__BUILD__ to latest build information
try {

	importScripts('build.js');

} catch {

	console.error('Failed to fetch build info from \'/build.js\'!');

}

if (!self.__BUILD__) {

	console.error('Fetching build info from \'/build.js\' didn\'t work as expected!');

}

// #region CONFIGURATION
const CACHE_NAME = `cache-${self.__BUILD__.buildNumber}` || 'cache-0';
const OFFLINE_URL = '/offline/';
const FOURTWENTYNINE_URL = '/429/';
const FIVEOTHREE_URL = '/503/';

/** URLs pointing to any page. */
const NAV_URLS = [
	OFFLINE_URL,
	FOURTWENTYNINE_URL,
	FIVEOTHREE_URL
];

/** URLs pointing to any static asset. */
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

		await self.skipWaiting();

	})());

};

self.onactivate = (event) => {

	event.waitUntil((async() => {

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

			return event.respondWith((async() => {

				return fetchResponse(event.request).then(async(networkResponse) => {

					switch (networkResponse.status) {

						case 429:
							return handle429Response(networkResponse);

						case 502:
							return await caches.match(OFFLINE_URL) || networkResponse;

						case 503:
							return await caches.match(FIVEOTHREE_URL) || networkResponse;

						case 504:
							return await caches.match(OFFLINE_URL) || networkResponse;

						case 599: // Response failed
							return await caches.match(OFFLINE_URL) || networkResponse;

						default:
							return networkResponse;

					}

				});

			})());

		}

		const url = new URL(event.request.url);

		// Handle listed static assets
		if (STATIC_ASSETS.includes(url.pathname) || url.pathname.endsWith('.css')) {

			event.respondWith((async() => {

				const cachedResponse = await caches.match(event.request);

				// Fetch request and cache successful responses
				const fetchPromise = fetchResponse(event.request).then(async(initialNetworkResponse) => {

					if (initialNetworkResponse.status == 200 || !cachedResponse) {

						await caches
							.open(CACHE_NAME)
							.then((cache) => cache.put(
								event.request,
								initialNetworkResponse.clone()
							));

					}

					return initialNetworkResponse;

				});

				event.waitUntil(fetchPromise);

				// Return cached response if available, otherwise the network response
				return cachedResponse || fetchPromise;

			})());

		}

	}
);

// #region HELPER FUNCTIONS

/**
 * A new response indicating the client is offline. (no body, status 599, status text 'offline')
 */
const offlineResponse = () => new Response(
	null,
	{
		status: 599,
		statusText: 'offline'
	}
);

/**
 * Refetches and caches all assets from `STATIC_ASSETS`.
 */
const cacheStaticAssets = () => caches
	.open(CACHE_NAME)
	.then(async(cache) => {

		return cacheAddAllBypass(
			cache,
			STATIC_ASSETS
		);

	});

/**
 * Refetches and caches all pages from `NAV_URLS`.
 * Also caches all CSS links from the fetched pages, and caches them.
 */
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
				 * Parse relative CSS URLs and filter out already-fetched URLs.
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

					console.log(`Failed to fetch CSS file '${cssUrl}': ${cssResponse.statusText}, ${cssResponse.status}'!`);

				}
				await cache.put(
					cssUrl,
					cssResponse
				);

			}

		});

};

/**
 * Fetches a URL, and returs the response unchanged if successful.
 * A rejection returns an `offlineResponse()`.
 *
 * @param {string} url The URL to fetch from.
 */
async function fetchResponse(url) {

	return await fetch(url).catch(() => offlineResponse());

}

/**
 * Fetches the URLs and caches them using the `cache: 'no-store'` option.
 * @param {string} cache The name of the cache.
 * @param {string[]} urls The URLs to fetch and cache.
 */
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

/** Calculates a hash using the djb2 algorithm. (1-7 characters) */
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

/**
 * Handles a response with the status code 429 (too many requests).
 * If the 429 page is not cached, the original response is returned. Otherwise, the cached 429 page is returned,
 * and a line is injected inside the first `<script>` element, that assigns window.retryAfter
 * to the header's `Retry-After` value.
 *
 * @param {Response} response The initial response.
 */
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

// #endregion
