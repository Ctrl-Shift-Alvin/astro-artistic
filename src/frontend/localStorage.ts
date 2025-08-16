import { isWindowDefined } from './windowTools';

function addLocalStorage(
	key: string,
	value: string | null
) {

	if (isWindowDefined()) {

		if (value === null) {

			if (isWindowDefined())
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

export function lsSetAuthTokenExpiry(token: number | null) {

	addLocalStorage(
		'authToken',
		token
			? token.toString()
			: null
	);

}

export function lsGetAuthTokenExpiry(): number | null {

	const expiry = getLocalStorage('authToken');
	if (expiry) {

		return Number(expiry);

	}
	return null;

}
