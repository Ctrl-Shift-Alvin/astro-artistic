// eslint-disable-next-line import/no-restricted-paths
import { defaultLanguageCode } from '@/backend/i18n';

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
