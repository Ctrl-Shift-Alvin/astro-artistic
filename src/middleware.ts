import { defineMiddleware } from 'astro/middleware';
import {
	getTranslation,
	getDefaultTranslation
} from '@/backend/i18n';
import { cGetUserLanguage } from '@/shared/cookies';

export const onRequest = defineMiddleware((
	context,
	next
) => {

	const lang = cGetUserLanguage(context);
	const translation = lang
		? getTranslation(lang) ?? getDefaultTranslation()
		: getDefaultTranslation();

	context.locals.translation = translation;

	return next();

});
