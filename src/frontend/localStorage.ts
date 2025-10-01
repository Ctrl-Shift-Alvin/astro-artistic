import { isWindowDefined } from './windowTools';

function addLocalStorage(
	key: string,
	value: string | null
) {

	if (isWindowDefined()) {

		if (value === null) {

			localStorage.removeItem(key);

		} else {

			localStorage.setItem(
				key,
				value
			);

		}

	}

}

function getLocalStorage(key: string): string | null {

	if (isWindowDefined())
		return localStorage.getItem(key);

	return null;

}

/*
 * All functions here are prefixed with 'ls' for 'local storage'.
 * Each key should have an exported get function, and set function with an `any | null` type.
 * Passing `null` deletes the key.
 *
 * This makes the code somewhere else much prettier, if you just see `lsSetKeyXXX(myValue)` instead of a whole block.
 *
 * E.g.:
 *
 * export function lsSetKeyXXX(value: string | null)
 * export function lsGetKeyXXX()
 */

/**
 * Set the `authToken` key in the local storage.
 *
 * @param token The value to set. Set to null to delete the key.
 */
export function lsSetAuthTokenExpiry(token: number | null) {

	addLocalStorage(
		'authToken',
		token
			? token.toString()
			: null
	);

}

/**
 * Get the `authToken` key from the local storage.
 */
export function lsGetAuthTokenExpiry(): number | null {

	const expiry = getLocalStorage('authToken');
	if (expiry) {

		return Number(expiry);

	}
	return null;

}
