import { type APIContext } from 'astro';
import { isWindowDefined } from '@/frontend/windowTools';
import { isAdminSetup } from '@/backend/admin';

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
		id: string,
		value: string | null,
		expires?: string,
		secure?: boolean,
		httpOnly?: boolean,
		sameSite?: 'lax' | 'strict' | 'none'
	) {

		this.name = id;
		this.value = value;
		this.expires = expires;
		this.secure = secure;
		this.httpOnly = httpOnly;
		this.sameSite = sameSite;

		let s: string = `${this.name}=${this.value}; path=/`;
		if (this.expires)
			s += `; Expires=${this.expires}`;
		if (this.secure ?? false)
			s += '; Secure';
		if ((this.httpOnly ?? false) && !isWindowDefined())
			s += '; HttpOnly';
		if (this.sameSite !== undefined)
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
		date.setTime(date.getTime() + (value * 24 * 60 * 60 * 1000));
	else if (unit === 'hours')
		date.setTime(date.getTime() + (value * 60 * 60 * 1000));
	else if (unit === 'minutes')
		date.setTime(date.getTime() + (value * 60 * 1000));
	else
		date.setTime(date.getTime() + (value * 1000));

	return date.toUTCString();

}

function removeCookie(
	id: string,
	context?: APIContext
) {

	if (isWindowDefined()) {

		document.cookie = `${id}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`; // Set expired cookie

	} else {

		context?.cookies.set(
			id,
			'',
			{
				path: '/',
				expires: new Date(0)
			}
		); // Cookies.delete doesn't remove Session cookies

	}

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
	id: string,
	context?: APIContext
): Cookie | null {

	// Server-side cookies
	if (!isWindowDefined()) {

		if (context === undefined) {

			throw new Error('Context is needed but undefined!');

		}
		const astroCookie = context.cookies.get(id);
		if (astroCookie === undefined)
			return null;
		return new Cookie(
			id,
			astroCookie.value
		);

	}

	// Client-side cookies
	const cookies = document.cookie.split('; ');
	let returnObject: Cookie | null = null;

	cookies.forEach(
		(cookie) => {

			const [
				cookieName,
				cookieValue
			] = cookie.split('=');

			if (cookieName === id) {

				const decodedValue = decodeURIComponent(cookieValue ?? '');
				returnObject = new Cookie(
					cookieName,
					decodedValue
				);

			}

		}
	);
	return returnObject;

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

	if (!isAdminSetup)
		throw new Error('Server tried to set \'auth\' cookie without the admin page being setup correctly.');

	const cookie = new Cookie(
		'auth',
		token,
		getExpirationString(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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

	if (!isAdminSetup)
		throw new Error('Server tried to get \'auth\' cookie without the admin page being setup correctly.');

	const cookie = getCookie(
		'auth',
		context
	);
	return cookie
		? cookie.value
		: null;

}

export function cSetIgnoreSizeError(value: boolean | null) {

	if (!isWindowDefined())
		return;

	const cookie = new Cookie(
		'ignoreSizeError',
		value ?? false
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
