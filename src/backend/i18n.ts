import { type ILocale } from '../locales/locales.config';
import { type TTranslation } from '@/locales/global';

// Get locales config json file and parse
const localesModule = await import('../locales/locales.config');
const locales = localesModule.LocalesConfig;

const { preferredCode } = locales;
const translations: Record<string, TTranslation> = {};

// Load all languages into translations
const promises = locales.languages.map(async(lang) => {

	try {

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { Translation: translationModule } = await import(`../locales/${lang.code}.ts`) as { Translation: TTranslation };
		translations[lang.code] = translationModule;

	} catch(error: any) {

		throw new Error(`Error loading translations for ${lang.code}: ${error}`);

	}

});

// Wait for all translation files to be loaded
await Promise.all(promises);

/**
 *
 * @param langCode The language code used to find the translation.
 * @returns If found, the `ITranslation` object. Otherwise, `undefined`.
 */
export function getTranslation(langCode: string): TTranslation | undefined {

	const translation = translations[langCode];
	return translation;

}

/**
 * An array of all loaded available languages.
 */
export const availableLanguages: ILocale[] = locales.languages;

/**
 * The default language code set in the locale config.
 */
export const defaultLanguageCode = preferredCode;

/**
 * Get the translation using `defaultLanguageCode`.
 */
export function getDefaultTranslation(): TTranslation {

	const translation = getTranslation(defaultLanguageCode);
	if (!translation)
		throw new Error('Couldn\'t get default translation!');

	return translation;

}
