import {
	errors_addErrorSubmission,
	errors_getCurrentBuild,
	errors_isDuplicateError
} from '@/backend/database/errors';
import { ZErrorSubmission } from '@/components/types';

/**
 * Log an error response by the server to a client, in the errors database.
 * @param url The source URL of the `error` response.
 * @param error The error response.
 */
export const submitErrorResponse = (
	url: string,
	error: Response
) => {

	try {

		const errorSubmission = ZErrorSubmission.parse({
			buildNumber: errors_getCurrentBuild()?.buildNumber ?? -1,
			url,
			isClient: false,
			status: error.status,
			statusText: error.statusText
		});
		if (!errors_isDuplicateError(errorSubmission)) {

			errors_addErrorSubmission(errorSubmission);

		}

	} catch(err: any) {

		console.error(`Error: Failed to log error submission on the server. Cause:\n ${err}`);

	}

};
