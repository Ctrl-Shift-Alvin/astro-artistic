/**
 * A locale with a name and a BCP47 code separated by a `-`.
 */
export interface ILocale {
	name: string;
	code: string;
}

/**
 * An array of `ILocale`s and a preferred BCP47 code that exists in the array.
 */
export interface ILocalesConfig {
	languages: ILocale[];
	preferredCode: string;
}

export const LocalesConfig = {
	languages: [
		{
			name: 'English',
			code: 'en-GB'
		},
		{
			name: 'Deutsch',
			code: 'de-AT'
		}
	],
	preferredCode: 'en-GB'
} as ILocalesConfig;
