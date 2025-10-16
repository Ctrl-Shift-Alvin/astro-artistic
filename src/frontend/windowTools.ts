/**
 * A convenience method for `typeof window !== 'undefined'`.
 * @returns `true` if `window` is defined (code is running on the client). Otherwise, `false`.
 */
export function isWindowDefined(): boolean {

	return typeof window !== 'undefined';

}

let animatedObjects: NodeListOf<Element> | undefined;
let animationDurationMs: number;
let fadeInOffsetMs: number;

/**
 * Scroll to a target Y value using a step function.
 * @param targetY The Y target to scroll to. (0 is top)
 * @param durationMs The duration from the start of the scrolling until the end. (Defaults to `animationDurationMs`)
 */
export const smoothScroll = (
	targetY: number,
	durationMs: number = animationDurationMs
) => {

	const startY = window.scrollY;
	const distance = targetY - startY;
	let startTime: number | null = null;

	const step = (time: number) => {

		startTime ??= time;
		const elapsed = time - startTime;

		const progress = Math.min(
			elapsed / durationMs,
			1
		);
		const easeOutQuad = progress * (2 - progress);

		window.scrollTo(
			0,
			startY + (distance * easeOutQuad)
		);

		if (elapsed < durationMs) {

			requestAnimationFrame(step);

		}

	};

	requestAnimationFrame(step);

};

let _isUnloadConfirmation = false;

/**
 * Enable the browser confirmation for when the user tries to leave the page.
 *
 * Calls `e.preventDefault()` in the `onbeforeunload` event handler while enabled.
 *
 */
export const enableUnloadConfirmation = () => _isUnloadConfirmation = true;

/**
 * Enable the browser confirmation for when the user tries to leave the page.
 *
 * Disables the call to `e.preventDefault()` in the `onbeforeunload` event handler until enabled again.
 *
 */
export const disableUnloadConfirmation = () => _isUnloadConfirmation = false;

/**
 * Get the windowTools' current `animationDurationMs` value.
 *
 * This value is used for the duration of certain animated things, such as
 * Monolog popups. This value is often used after a fade-in duration, followed by a fade-out duration.
 *
 */
export function getAnimationDurationMs() {

	return animationDurationMs;

}

/**
 * Set the windowTools' `animationDurationMs` value.
 *
 * This value is used for the duration of certain animated things, such as
 * Monolog popups. This value is often used after a fade-in duration, followed by a fade-out duration.
 *
 */
export function setAnimationDurationMs(value: number) {

	animationDurationMs = value;

}

/**
 * Get the windowTools' current `fadeInOffsetMs` value.
 *
 * This value is used for the fade-in duration of certain animated things, such as
 * Monolog popups. This value is often used before a animation duration, followed by a fade-out duration
 * often identical to the fade-in duration.
 */
export function getFadeInOffsetMs() {

	return fadeInOffsetMs;

}

/**
 * Set the windowTools' `fadeInOffsetMs` value.
 *
 * This value is used for the fade-in duration of certain animated things, such as
 * Monolog popups. This value is often used before a animation duration, followed by a fade-out duration
 * often identical to the fade-in duration.
 */
export function setFadeInOffsetMs(value: number) {

	fadeInOffsetMs = value;

}

/**
 * Call a fade in for all marked objects. (All objects that contain the style `windowtools-transition`)
 */
export const windowFadeIn = () => {

	if (animatedObjects === undefined || animatedObjects.length < 1)
		return;
	animatedObjects.forEach(
		(e: Element) => {

			e.classList.replace(
				'opacity-0',
				'opacity-100'
			);

		}
	);

};

/**
 * Call a fade in for all marked objects. (All objects that contain the style `windowtools-transition`)
 */
export const windowFadeOut = async() => {

	if (animatedObjects === undefined || animatedObjects.length < 1)
		return;
	animatedObjects.forEach(
		(e: Element) => {

			e.classList.replace(
				'opacity-100',
				'opacity-0'
			);

		}
	);
	return await new Promise(
		(resolve) => setTimeout(
			resolve,
			animationDurationMs
		)
	);

};

/**
 * Call an animated window reload. Fades out, reloads, fades back in if the document is still active.
 */
export const windowRefresh = () => {

	if (animatedObjects) {

		void windowFadeOut().then(
			() => {

				window.location.reload();

			}
		);

	} else {

		window.location.reload();

	}

};

/**
 * The default `animationDurationMs` value.
 */
export const DEFAULT_ANIMATION_DURATION_MS = 400;

/**
 * The default `fadeInOffsetMs` value.
 */
export const DEFAULT_FADE_IN_OFFSET_MS = 200;

/**
 * Initialize windowTools. Saves a reference once to all objects with the style class `windowtools-transition`
 * and assign the window's `onbeforeunload` event handler, then fades in everything.
 *
 * @param _animationDurationMs Optionally set the `animationDurationMs` value before continuing.
 * @param _fadeInOffsetMs Optionally set the `fadeInOffsetMs` value before continuing.
 */
export function initWindowAnimations(
	_animationDurationMs?: number,
	_fadeInOffsetMs?: number
) {

	// Start opacity transition
	const elements = document.querySelectorAll('.windowtools-transition');
	animatedObjects = elements; // Pass query result to tools, for future references
	setAnimationDurationMs(_animationDurationMs ?? DEFAULT_ANIMATION_DURATION_MS);
	setFadeInOffsetMs(_fadeInOffsetMs ?? DEFAULT_FADE_IN_OFFSET_MS);

	animatedObjects.forEach(
		(e: Element) => {

			e.classList.add(`duration-${animationDurationMs}`);

		}
	);

	setTimeout(
		() => {

			windowFadeIn();

		},
		fadeInOffsetMs
	);

	// Play fade-out animation before reload
	window.onbeforeunload = (e) => {

		if (_isUnloadConfirmation)
			e.preventDefault();

		void windowFadeOut().then(
			() => {

				// Fade back in, in case the user navigates back to the cached state (without reloading)
				windowFadeIn();

			}
		);

	};

}

/**
 * Works the same as `windowRefresh()` but without the window reload. Fades out, calls `callback` and fades back in.
 * If the return type of callback is `Promise<any>`, the promise is first awaited, and then the fade-in happens
 * regardless of the result.
 *
 * @param callback The callback
 */
export function fakeReload(callback: ()=> any) {

	void windowFadeOut().then(
		() => {

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const result = callback();

			if (result instanceof Promise) {

				result.then(windowFadeIn).catch(windowFadeIn);

			} else {

				windowFadeIn();

			}

		}
	);

}

/**
 * Fades out and then calls `location.href = href`.
 */
export function goto(href: string) {

	void windowFadeOut().then(
		() => {

			location.href = href;

		}
	);

}
