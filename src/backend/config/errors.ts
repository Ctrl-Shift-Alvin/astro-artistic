import path from 'node:path';
import { ZErrorsConfig } from './configTypes';

export const ErrorsConfig = ZErrorsConfig.parse({
	dbPath: path.join(
		process.cwd(),
		'data',
		'errors.db'
	)
});
