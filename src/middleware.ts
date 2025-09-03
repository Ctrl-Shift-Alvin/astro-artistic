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

export const onRequest = defineMiddleware((
	context,
	next
) => {

	const lang = cGetUserLanguage(context);
	const translation = lang
		? getTranslation(lang) ?? getDefaultTranslation()
		: getDefaultTranslation();

	context.locals.translation = translation;

	if (context.url.pathname.startsWith('/admin/')) {

		if (!isAdminSetup)
			return context.redirect('/');

		const token = cGetAuthToken(context);
		const isLoginPage = context.url.pathname === '/admin/login/';

		if (token) {

			const tokenExpiry = (decode(token) as JwtPayload | null)?.exp;
			if (tokenExpiry && Date.now() - tokenExpiry * 1000 < 0) {

				if (isLoginPage)
					return context.redirect('/admin/home/');

				return next();

			}

		}

		if (!isLoginPage) {

			return context.redirect('/admin/login/');

		}

	}

	return next();

});
