export function isWindowDefined(): boolean {

	return typeof window !== 'undefined';

}

export const smoothScroll = (
	targetY: number,
	durationMs: number = animationDurationMs
) => {

	const startY = window.scrollY;
	const distance = targetY - startY;
	let startTime: number | null = null;

	const step = (currentTime: number) => {

		if (!startTime)
			startTime = currentTime;
		const elapsed = currentTime - startTime;

		const progress = Math.min(
			elapsed / durationMs,
			1
		);
		const easeOutQuad = progress * (2 - progress);

		window.scrollTo(
			0,
			startY + distance * easeOutQuad
		);

		if (elapsed < durationMs) {

			requestAnimationFrame(step);

		}

	};

	requestAnimationFrame(step);

};

let _isUnloadConfirmation = false;
export const enableUnloadConfirmation = () => _isUnloadConfirmation = true;
export const disableUnloadConfirmation = () => _isUnloadConfirmation = false;

let animatedObjects: NodeListOf<Element> | undefined;
let animationDurationMs: number;
let fadeInOffsetMs: number;

export function getAnimationDurationMs() {

	return animationDurationMs;

}
export function setAnimationDurationMs(value: number) {

	animationDurationMs = value;

}

export function getFadeInOffsetMs() {

	return fadeInOffsetMs;

}
export function setFadeInOffsetMs(value: number) {

	fadeInOffsetMs = value;

}

export const windowFadeIn = () => {

	if (animatedObjects === undefined || animatedObjects.length < 1)
		return;
	animatedObjects.forEach((e: Element) => {

		e.classList.replace(
			'opacity-0',
			'opacity-100'
		);

	});

};

export const windowFadeOut = async() => {

	if (animatedObjects === undefined || animatedObjects.length < 1)
		return;
	animatedObjects.forEach((e: Element) => {

		e.classList.replace(
			'opacity-100',
			'opacity-0'
		);

	});
	return new Promise((resolve) => setTimeout(
		resolve,
		animationDurationMs
	));

};

export const windowRefresh = () => {

	if (animatedObjects) {

		void windowFadeOut().then(() => {

			window.location.reload();

		});

	} else {

		window.location.reload();

	}

};

export const DEFAULT_ANIMATION_DURATION_MS = 400;
export const DEFAULT_FADE_IN_OFFSET_MS = 200;

export function initWindowAnimations(
	_animationDurationMs?: number,
	_fadeInOffsetMs?: number
) {

	// Start opacity transition
	const elements = document.querySelectorAll('.windowtools-transition');
	animatedObjects = elements; // Pass query result to tools, for future windowRefresh() references
	setAnimationDurationMs(_animationDurationMs || DEFAULT_ANIMATION_DURATION_MS);
	setFadeInOffsetMs(_fadeInOffsetMs || DEFAULT_FADE_IN_OFFSET_MS);

	animatedObjects.forEach((e: Element) => {

		e.classList.add(`duration-${animationDurationMs}`);

	});

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

		void windowFadeOut().then(() => {

			// Fade back in, in case the user navigates back to the cached state (without reloading)
			windowFadeIn();

		});

	};

}

export function fakeReload(callback: ()=> void | Promise<void>) {

	void windowFadeOut().then(() => {

		void callback();
		windowFadeIn();

	});

}

export function goto(href: string) {

	void windowFadeOut().then(() => {

		window.location.href = href;

	});

}
