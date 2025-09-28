import { useLayoutEffect } from 'react';

/**
 * Provides the window event 'react-hydrated'.
 */
export const ReactInit = () => {

	useLayoutEffect(
		() => {

			window.dispatchEvent(new Event('react-hydrated'));

		},
		[]
	);

};
