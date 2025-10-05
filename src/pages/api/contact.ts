/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type APIContext } from 'astro';
import { verifyCaptcha } from './captcha';
import {
	ZContactApiRequest,
	ZContactApiResponse
} from '@/components/types';
import {
	contact_addEntry,
	contact_isDbDuplicateEntry
} from '@/backend/database/contact';

export async function POST(context: APIContext) {

	if (context.url.pathname !== '/api/contact/') {

		const errorBody = ZContactApiResponse.parse({ error: 'not-found' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 404 }
		);

	}
	const responseBody = await context.request.json();

	const {
		data,
		success
	} = await ZContactApiRequest.safeParseAsync(responseBody);
	if (!success) {

		const errorBody = ZContactApiResponse.parse({ error: 'invalid-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	if (
		!verifyCaptcha(
			data.captcha.id,
			data.captcha.text
		)
	) {

		const errorBody = ZContactApiResponse.parse({ error: 'invalid-captcha' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 401 }
		);

	}

	if (
		contact_isDbDuplicateEntry(
			data.data.email,
			data.data.message ?? undefined
		)
	) {

		const errorBody = ZContactApiResponse.parse({ error: 'duplicate-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 409 }
		);

	}

	contact_addEntry(data.data);

	const body = ZContactApiResponse.parse({ message: 'success' });
	return new Response(
		JSON.stringify(body),
		{ status: 200 }
	);

}
