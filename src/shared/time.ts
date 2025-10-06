import { LocalesConfig } from '@/locales/locales.config';

const defaultLanguageCode = LocalesConfig.preferredCode;

export const calculateAge = (dob: Date) => {

	const today = new Date();
	let _age = today.getFullYear() - dob.getFullYear();

	return (
		today.getMonth() <= dob.getMonth()
		&& today.getDate() < dob.getDate()
			? --_age
			: _age
	);

};

export const dateOfBirth = new Date(
	2000,
	1 - 1,
	1
);
export const age = calculateAge(dateOfBirth);
export const formatDateOfBirth = (locale: string) => formatDateString(
	dateOfBirth,
	locale
);
export const formatAge = (locale: string) => formatNumber(
	age,
	locale
);

export function defaultFormatDateString(date: Date) {

	return date.toLocaleDateString(
		defaultLanguageCode,
		{
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}
	);

}

export function defaultFormatTimeString(date: Date) {

	return date.toLocaleTimeString(
		defaultLanguageCode,
		{
			day: 'numeric',
			hour: 'numeric'
		}
	);

}

export function defaultFormatDateTimeString(date: Date) {

	return date.toLocaleString(
		defaultLanguageCode,
		{
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		}
	);

}

export function formatDateString(
	date: Date,
	locale: string
) {

	try {

		// Try parsing, code might be wrong
		const loc = new Intl.Locale(locale);
		return date.toLocaleDateString(
			loc,
			{
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			}
		);

	} catch(e: any) {

		throw new Error(
			`Failed to parse locale string '${locale}'`,
			{ cause: e }
		);

	}

}

export function formatTimeString(
	date: Date,
	locale: string
) {

	try {

		// Try parsing, code might be wrong
		const loc = new Intl.Locale(locale);
		return date.toLocaleTimeString(
			loc,
			{
				day: 'numeric',
				hour: 'numeric'
			}
		);

	} catch(e: any) {

		throw new Error(
			`Failed to parse locale string '${locale}'`,
			{ cause: e }
		);

	}

}

export function formatDateTimeString(
	date: Date,
	locale: string
) {

	try {

		// Try parsing, code might be wrong
		const loc = new Intl.Locale(locale);
		return date.toLocaleString(
			loc,
			{
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric'
			}
		);

	} catch(e: any) {

		throw new Error(
			`Failed to parse locale string '${locale}'`,
			{ cause: e }
		);

	}

}

// eslint-disable-next-line @typescript-eslint/max-params
export function formatNumber(
	num: number,
	locale: string,
	localeOptions?: Intl.LocaleOptions,
	formatOptions?: Intl.NumberFormatOptions
) {

	try {

		// Try parsing, code might be wrong
		const loc = new Intl.Locale(
			locale,
			localeOptions
		);
		return num.toLocaleString(
			loc,
			formatOptions
		);

	} catch(e: any) {

		throw new Error(
			`Failed to parse locale string '${locale}'`,
			{ cause: e }
		);

	}

}
