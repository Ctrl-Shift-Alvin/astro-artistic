/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type APIContext } from 'astro';
import {
	ZErrorApiResponse,
	ZErrorApiRequest
} from '@/components/types';
import {
	errors_addErrorSubmission,
	errors_isDuplicateError
} from '@/backend/database/errors';

export async function POST(context: APIContext) {

	if (context.url.pathname !== '/api/errors/') {

		const errorBody = ZErrorApiResponse.parse({ error: 'not-found' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 404 }
		);

	}
	const responseBody = await context.request.json();

	const {
		data, success
	} = await ZErrorApiRequest.safeParseAsync({ data: responseBody });
	if (!success) {

		const errorBody = ZErrorApiResponse.parse({ error: 'invalid-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	if (errors_isDuplicateError(data.data)) {

		const errorBody = ZErrorApiResponse.parse({ error: 'duplicate-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 409 }
		);

	}

	errors_addErrorSubmission(data.data);

	const body = ZErrorApiResponse.parse({ message: 'success' });
	return new Response(
		JSON.stringify(body),
		{ status: 200 }
	);

}
