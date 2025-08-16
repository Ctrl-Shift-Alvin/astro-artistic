import path from 'node:path';
import { ZContactConfig } from './configTypes';

export const ContactConfig = ZContactConfig.parse({
	dbPath: path.join(
		process.cwd(),
		'data',
		'contactForms.db'
	)
});
