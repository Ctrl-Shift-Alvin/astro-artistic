import { defaultLanguageCode } from '@/backend/i18n';

export const dateOfBirth = new Date('2000-01-14');

export const calculateAge = (): number => {

	const today = new Date();
	let age = today.getFullYear() - dateOfBirth.getFullYear();
	const monthDifference = today.getMonth() - dateOfBirth.getMonth();

	if (
		(monthDifference < 0 || monthDifference === 0)
		&& today.getDate() < dateOfBirth.getDate()
	) {

		age--;

	}

	return age;

};

export function defaultFormatDateString(date: Date) {

	try {

		return date.toLocaleDateString(
			defaultLanguageCode,
			{
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			}
		);

	} catch(error) {

		console.error(
			'Error formatting date:',
			error
		);

		// Fallback to a simple date format
		return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

	}

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
