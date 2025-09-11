import {
	useEffect,
	useLayoutEffect
} from 'react';

/**
 * Provides the window events 'react-hydrated' and 'react-hydrated-layout'.
 */
export const ReactInit = () => {

	useLayoutEffect(
		() => {

			window.dispatchEvent(new Event('react-hydrated-layout'));

		},
		[]
	);
	useEffect(
		() => {

			window.dispatchEvent(new Event('react-hydrated'));

		},
		[]
	);

};
