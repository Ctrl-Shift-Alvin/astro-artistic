import {
	ZErrorApiRequest,
	type TErrorSubmission
} from '@/components/types';
import { ErrorsConfig } from '@/shared/config/errors';

async function submitError(error: TErrorSubmission) {

	const parsedRequest = ZErrorApiRequest.safeParse({ data: error });

	if (!parsedRequest.success) {

		console.error('Failed to submit error to API!');
		return;

	}

	try {

		const response = await fetch(
			'/api/errors/',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsedRequest.data)
			}
		);

		if (!response.ok) {

			console.error('Failed to submit error to API!');
			return;

		}

	} catch(err: any) {

		console.error(
			'Error submitting error to API:',
			err
		);

	}

}

export function setupJsErrorHandler() {

	if (!ErrorsConfig.enableJsLogging) {

		return;

	}

	window.addEventListener(
		'error',
		(event) => {

			void submitError({
				buildNumber: window.__BUILD__.buildNumber,
				url: location.href,
				isClient: true,
				errorMessage: event.message,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				errorStack: event.error && event.error.stack
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					? event.error.stack
					: undefined
			});

		}
	);

	window.addEventListener(
		'unhandledrejection',
		(event) => {

			if (event.reason instanceof Error) {

				void submitError({
					buildNumber: window.__BUILD__.buildNumber,
					isClient: true,
					url: location.href,
					errorMessage: event.reason.message,
					errorCause: String(event.reason.cause),
					errorStack: event.reason.stack
				});

			} else {

				void submitError({
					buildNumber: window.__BUILD__.buildNumber,
					isClient: true,
					url: location.href,
					errorMessage: String(event.reason)
				});

			}

		}
	);

}
