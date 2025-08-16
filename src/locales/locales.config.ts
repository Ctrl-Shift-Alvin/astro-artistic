export type ILocale = {
	name: string;
	code: string;
};
export type ILocalesConfig = {
	languages: ILocale[];
	preferredCode: string;
};

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
