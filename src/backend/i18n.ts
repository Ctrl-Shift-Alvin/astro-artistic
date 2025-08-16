import { type ILocale } from '../locales/locales.config';
import { type ITranslation } from '@/locales/global';

declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		__TRANSLATION__: ITranslation;
	}
}

// Get locales config json file and parse
const localesModule = await import('../locales/locales.config');
const locales = localesModule.LocalesConfig;

const { preferredCode } = locales;
const translations: Record<string, ITranslation> = {};

// Load all languages into translations
const promises = locales.languages.map(async(lang) => {

	try {

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { Translation: translationModule } = await import(`../locales/${lang.code}.ts`) as { Translation: ITranslation };
		translations[lang.code] = translationModule;

	} catch(error: any) {

		throw new Error(`Error loading translations for ${lang.code}: ${error}`);

	}

});

// Wait for all translation files to be loaded
await Promise.all(promises);

export function getTranslation(langCode: string): ITranslation {

	const translation = translations[langCode];
	if (!translation)
		throw new Error('Failed to load default translation!');
	return translation;

}

export const availableLanguages: ILocale[] = locales.languages;

export const defaultLanguageCode = preferredCode;

export function getDefaultTranslation(): ITranslation {

	return getTranslation(defaultLanguageCode);

}
