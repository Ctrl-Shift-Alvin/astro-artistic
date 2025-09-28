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
import { ErrorsConfig } from '@/shared/config/errors';

export async function POST(context: APIContext) {

	if (
		context.url.pathname !== '/api/errors/'
		|| !ErrorsConfig.enableJsLogging
	) {

		const errorBody = ZErrorApiResponse.parse({ error: 'not-found' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 404 }
		);

	}
	const requestBody = await context.request.json();
	const parsedResponse = await ZErrorApiRequest.safeParseAsync(requestBody);

	if (!parsedResponse.success) {

		const errorBody = ZErrorApiResponse.parse({ error: 'invalid-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	if (errors_isDuplicateError(parsedResponse.data.data)) {

		const errorBody = ZErrorApiResponse.parse({ error: 'duplicate-data' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 409 }
		);

	}

	errors_addErrorSubmission({
		...parsedResponse.data.data,
		isClient: true
	});

	const body = ZErrorApiResponse.parse({ message: 'success' });
	return new Response(
		JSON.stringify(body),
		{ status: 200 }
	);

}
