import path from 'node:path';
import { ZEventsConfig } from './configTypes';

export const EventsConfig = ZEventsConfig.parse({
	dbPath: path.join(
		process.cwd(),
		'data',
		'events.db'
	),
	pagesPath: path.join(
		process.cwd(),
		'src',
		'pages',
		'events'
	)
});
