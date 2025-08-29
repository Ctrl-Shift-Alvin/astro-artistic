/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type APIContext } from 'astro';
import {
	ZFormSubmissionApiRequest,
	ZFormSubmissionApiResponse
} from '@/components/types';
import {
	contact_addForm, contact_isDbDuplicateEntry
} from '@/backend/database/contact';

export async function POST(context: APIContext) {

	if (context.url.pathname !== '/api/contact/') {

		const errorBody = ZFormSubmissionApiResponse.parse({ error: 'not-found' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 404 }
		);

	}
	const responseBody = await context.request.json();

	const {
		data, success
	} = await ZFormSubmissionApiRequest.safeParseAsync({ data: responseBody });
	if (!success) {

		const errorBody = ZFormSubmissionApiResponse.parse({ error: 'invalid-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	if (contact_isDbDuplicateEntry(
		data.data.email,
		data.data.message ?? undefined
	)
	) {

		const errorBody = ZFormSubmissionApiResponse.parse({ error: 'duplicate-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 409 }
		);

	}

	contact_addForm(data.data);

	const body = ZFormSubmissionApiResponse.parse({ message: 'success' });
	return new Response(
		JSON.stringify(body),
		{ status: 200 }
	);

}
