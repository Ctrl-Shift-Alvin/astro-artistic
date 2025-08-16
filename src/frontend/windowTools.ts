export function isWindowDefined(): boolean {

	return typeof window !== 'undefined';

}

export const smoothScroll = (
	targetY: number,
	durationMs: number
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

		e.classList.add('opacity-100');

	});
	animatedObjects.forEach((e: Element) => {

		e.classList.remove('opacity-0');

	});

};

export const windowFadeOut = () => {

	if (animatedObjects === undefined || animatedObjects.length < 1)
		return;
	animatedObjects.forEach((e: Element) => {

		e.classList.remove('opacity-100');

	});
	animatedObjects.forEach((e: Element) => {

		e.classList.add('opacity-0');

	});

};

export const windowRefresh = () => {

	if (animatedObjects) {

		windowFadeOut();
		setTimeout(
			() => {

				window.location.reload();

			},
			animationDurationMs
		);

	} else {

		window.location.reload();

	}

};

export function initWindowAnimations(
	_animationDurationMs?: number,
	_fadeInOffsetMs?: number
) {

	// Start opacity transition
	const elements = document.querySelectorAll('.windowtools-transition');
	animatedObjects = elements; // Pass query result to tools, for future windowRefresh() references
	setAnimationDurationMs(_animationDurationMs || 400);
	setFadeInOffsetMs(_fadeInOffsetMs || 200);

	animatedObjects.forEach((e: Element) => {

		e.classList.add(`duration-${animationDurationMs}`);

	});

	setTimeout(
		() => {

			windowFadeIn();

		},
		getFadeInOffsetMs()
	);

	// Play fade-out animation before reload
	window.onbeforeunload = () => {

		windowFadeOut();

	};

}

export function fakeReload(callback: ()=> void | Promise<void>) {

	windowFadeOut();
	setTimeout(
		() => {

			void callback();
			windowFadeIn();

		},
		getAnimationDurationMs()
	);

}

export function goto(href: string) {

	windowFadeOut();
	setTimeout(
		() => {

			window.location.href = href;

		},
		getAnimationDurationMs()
	);

}
