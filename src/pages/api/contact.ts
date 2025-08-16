/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type APIContext } from 'astro';
import {
	FormSubmissionApiRequest,
	FormSubmissionApiResponse
} from '@/components/types';
import {
	contact_addForm, contact_isDbDuplicateEntry
} from '@/backend/database/contact';

export async function POST(context: APIContext) {

	if (context.url.pathname !== '/api/contact/') {

		const errorBody = FormSubmissionApiResponse.parse({ error: 'not-found' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 404 }
		);

	}
	const responseBody = await context.request.json();

	const {
		data, success
	} = await FormSubmissionApiRequest.safeParseAsync({ data: responseBody });
	if (!success) {

		const errorBody = FormSubmissionApiResponse.parse({ error: 'invalid-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	if (contact_isDbDuplicateEntry(
		data.data.email,
		data.data.message
	)
	) {

		const errorBody = FormSubmissionApiResponse.parse({ error: 'duplicate-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 409 }
		);

	}

	contact_addForm(data.data);

	const body = FormSubmissionApiResponse.parse({ message: 'success' });
	return new Response(
		JSON.stringify(body),
		{ status: 200 }
	);

}
