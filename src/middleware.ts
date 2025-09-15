import { defineMiddleware } from 'astro/middleware';
import {
	decode,
	type JwtPayload
} from 'jsonwebtoken';
import { isAdminSetup } from './backend/admin';
import {
	getTranslation,
	getDefaultTranslation
} from '@/backend/i18n';
import {
	cGetUserLanguage,
	cGetAuthToken
} from '@/shared/cookies';

const noCacheResponse = (response: Response) => {

	response.headers.set(
		'Cache-Control',
		'no-cache, no-store, must-revalidate'
	);
	response.headers.set(
		'Pragma',
		'no-cache'
	);
	response.headers.set(
		'Expires',
		'0'
	);
	return response;

};

export const onRequest = defineMiddleware(async(
	context,
	next
) => {

	const lang = cGetUserLanguage(context);
	const translation = lang
		? getTranslation(lang) ?? getDefaultTranslation()
		: getDefaultTranslation();

	context.locals.translation = translation;

	if (context.url.pathname.startsWith('/admin/')) {

		if (!isAdminSetup) {

			return noCacheResponse(context.redirect('/'));

		}

		const token = cGetAuthToken(context);
		const isLoginPage = context.url.pathname === '/admin/login/';

		if (token) {

			const tokenExpiry = (decode(token) as JwtPayload | null)?.exp;
			if (tokenExpiry && Date.now() - tokenExpiry * 1000 < 0) {

				if (isLoginPage) {

					return noCacheResponse(context.redirect('/admin/home/'));

				}

				return noCacheResponse(await next());

			}

		}

		if (!isLoginPage) {

			return noCacheResponse(context.redirect('/admin/login/'));

		}

		return noCacheResponse(await next());

	}

	return next();

});
