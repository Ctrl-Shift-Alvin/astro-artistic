import path from 'node:path';
import { ZErrorsConfig } from './configTypes';

export const ErrorsConfig = ZErrorsConfig.parse({
	dbPath: path.join(
		process.cwd(),
		'data',
		'errors.db'
	),
	enableResponseLogging: true,
	responseLoggingStatusCodes: [
		400,
		401,
		403,
		404,
		414,
		421,
		431,
		451,
		500,
		501,
		502,
		504,
		508
	]
});
