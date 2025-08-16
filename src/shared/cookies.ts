import { type APIContext } from 'astro';
import { isWindowDefined } from '@/frontend/windowTools';

class Cookie {

	name: string;

	value: string | null;

	expires?: string;

	secure?: boolean;

	httpOnly?: boolean;

	sameSite?: 'lax' | 'strict' | 'none' | undefined;

	cookieString?: string;

	// eslint-disable-next-line @typescript-eslint/max-params
	constructor(
		name: string,
		value: string | null,
		expires?: string,
		secure?: boolean,
		httpOnly?: boolean,
		sameSite?: 'lax' | 'strict' | 'none'
	) {

		this.name = name;
		this.value = value;
		this.expires = expires;
		this.secure = secure;
		this.httpOnly = httpOnly;
		this.sameSite = sameSite;

		let s: string = `${this.name}=${this.value}; path=/`;
		if (this.expires)
			s += `; Expires=${this.expires}`;
		if (this.secure)
			s += '; Secure';
		if (this.httpOnly && !isWindowDefined())
			s += '; HttpOnly';
		if (this.sameSite)
			s += `; SameSite=${this.sameSite}`;

		this.cookieString = s;

	}

}

function getExpirationString(
	value: number,
	unit: 'days' | 'hours' | 'minutes' | 'seconds' = 'days'
): string {

	const date = new Date();
	if (unit === 'days')
		date.setTime(date.getTime() + value * 24 * 60 * 60 * 1000);
	else if (unit === 'hours')
		date.setTime(date.getTime() + value * 60 * 60 * 1000);
	else if (unit === 'minutes')
		date.setTime(date.getTime() + value * 60 * 1000);
	else
		date.setTime(date.getTime() + value * 1000);

	return date.toUTCString();

}

function setCookie(
	cookie: Cookie,
	context?: APIContext
) {

	if (cookie.value === null) {

		removeCookie(
			cookie.name,
			context
		);
		return;

	}
	if (cookie.cookieString !== undefined) {

		if (isWindowDefined()) {

			document.cookie = cookie.cookieString;

		} else {

			if (context === undefined)
				throw new Error('Context is needed but undefined!');

			context.cookies.set(
				cookie.name,
				cookie.value,
				{
					path: '/',
					expires: cookie.expires
						? new Date(cookie.expires)
						: undefined,
					httpOnly: cookie.httpOnly,
					secure: cookie.secure,
					sameSite: cookie.sameSite
				}
			);

		}

	}

}

function getCookie(
	name: string,
	context?: APIContext
): Cookie | null {

	// Server-side cookies
	if (!isWindowDefined()) {

		if (context === undefined) {

			throw new Error('Context is needed but undefined!');

		}
		const astroCookie = context.cookies.get(name);
		if (astroCookie === undefined)
			return null;
		return new Cookie(
			name,
			astroCookie.value
		);

	}

	// Client-side cookies
	const cookies = document.cookie.split('; ');
	let returnObject: Cookie | null = null;

	cookies.forEach((cookie) => {

		const [
			cookieName,
			cookieValue
		] = cookie.split('=');

		if (cookieName === name) {

			const decodedValue = decodeURIComponent(cookieValue || '');
			returnObject = new Cookie(
				cookieName,
				decodedValue
			);

		}

	});
	return returnObject;

}

function removeCookie(
	name: string,
	context?: APIContext
) {

	if (isWindowDefined()) {

		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`; // Set expired cookie

	} else {

		context?.cookies.set(
			name,
			'',
			{
				path: '/',
				expires: new Date(0)
			}
		); // Cookies.delete doesn't remove Session cookies

	}

}

export function cSetUserLanguage(langCode: string | null) {

	const cookie = new Cookie(
		'lang',
		langCode,
		getExpirationString(30)
	);
	setCookie(cookie);

}

export function cGetUserLanguage(context?: APIContext): string | null {

	const cookie = getCookie(
		'lang',
		context
	);
	return cookie
		? cookie.value
		: null;

}

export function cSetAuthToken(
	token: string | null,
	context: APIContext
) {

	if (isWindowDefined())
		return;

	const cookie = new Cookie(
		'auth',
		token,
		getExpirationString(
			import.meta.env.JWT_LENGTH as number,
			'seconds'
		),
		true,
		true,
		'strict'
	);
	setCookie(
		cookie,
		context
	);

}

export function cGetAuthToken(context: APIContext): string | null {

	if (isWindowDefined())
		return null;

	const cookie = getCookie(
		'auth',
		context
	);
	return cookie
		? cookie.value
		: null;

}

export function cSetIgnoreSizeError(value: boolean | null) {

	console.log('Set to: ' + value);
	if (!isWindowDefined())
		return;

	const cookie = new Cookie(
		'ignoreSizeError',
		value
			? String(value)
			: null,
		getExpirationString(30)
	);
	setCookie(cookie);

}

export function cGetIgnoreSizeError(context?: APIContext): boolean | null {

	if (!isWindowDefined())
		return null;

	const cookie = getCookie(
		'ignoreSizeError',
		context
	);
	return cookie
		? cookie.value === 'true'
		: null;

}
