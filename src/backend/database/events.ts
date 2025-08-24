import { spawn } from 'node:child_process';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import {
	ZEventsEntry,
	type TEventsEntry
} from '@/components/types';
import { EventsConfig } from '@/backend/config/events';
import { EventsConfig as SharedEventsConfig } from '@/shared/config/events';

process.on(
	'exit',
	() => db.close()
);

const db = new Database(EventsConfig.dbPath);
const updateQueries: string[][] = []; // updateQueries[0] updates to 1, updateQueries[1] updates to 2, etc.
const CURRENT_VERSION = updateQueries.length;

const events_createDbIfNotExists = (): boolean => {

	if (fs.existsSync(EventsConfig.dbPath) && fs.statSync(EventsConfig.dbPath).size > 1)
		return false;

	if (!fs.existsSync('./data')) {

		fs.mkdirSync('./data');

	}

	try {

		const dbSetupQuery
		= 'CREATE TABLE IF NOT EXISTS events ('
			+ 'id INTEGER PRIMARY KEY AUTOINCREMENT,'
			+ 'title TEXT NOT NULL,'
			+ 'dateTime TEXT NOT NULL,'
			+ 'location TEXT NOT NULL,'
			+ 'enablePage BOOLEAN NOT NULL CHECK (enablePage IN (0, 1)),'
			+ 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
			+ ');';
		const dbVersionQuery = 'user_version = 0;';

		db
			.exec(dbSetupQuery)
			.pragma(dbVersionQuery);

		if (CURRENT_VERSION > 0) {

			events_updateDb();

		}
		return true;

	} catch(err: any) {

		throw new Error(
			'Error creating database table!',
			{ cause: err }
		);

	}

};
const events_updateDb = () => {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const result = db.pragma('user_version') as [{ user_version: number }];
	const startDbVersion = result[0].user_version;

	if (startDbVersion > CURRENT_VERSION) {

		throw new Error('events.db version is larger than the CURRENT_VERSION.');

	}

	if (startDbVersion == CURRENT_VERSION) {

		return;

	}

	console.log(`Updating events database from version '${startDbVersion}' to '${CURRENT_VERSION}'!`);

	try {

		db.transaction(() => {

			for (let i = startDbVersion; i < CURRENT_VERSION; i++) {

				updateQueries[i]?.forEach((q) => db.exec(q));
				db.pragma(`user_version = ${i + 1}`);

			}
			return true;

		});
		return true;

	} catch(err: any) {

		throw new Error(
			`Couldn't update events database: ${err}`,
			{ cause: err }
		);

	}

};

export const events_dbRun = (
	query: string,
	...params: unknown[]
): Database.RunResult => {

	try {

		const result = db
			.prepare(query)
			.run(params);
		return result;

	} catch(err: any) {

		if (events_createDbIfNotExists()) {

			return events_dbRun(
				query,
				...params
			);

		} else {

			throw new Error(
				`Failed to run query ${query}: ${err}`,
				{ cause: err }
			);

		}

	}

};
export const events_dbGet = (
	query: string,
	...params: unknown[]
): TEventsEntry => {

	try {

		const result = db
			.prepare(query)
			.get(params);
		const parsed = ZEventsEntry.parse(result);
		return parsed;

	} catch(err: any) {

		if (events_createDbIfNotExists()) {

			return events_dbGet(
				query,
				...params
			);

		} else {

			throw new Error(
				`Failed to run query '${query}': ${err}`,
				{ cause: err }
			);

		}

	}

};
export const events_dbAll = (
	query: string,
	...params: unknown[]
): TEventsEntry[] => {

	try {

		const result = db
			.prepare(query)
			.all(params);
		const parsed = ZEventsEntry
			.array()
			.parse(result);
		return parsed;

	} catch(err: any) {

		if (events_createDbIfNotExists()) {

			return events_dbAll(
				query,
				...params
			);

		} else {

			throw new Error(
				`Failed to run query '${query}': ${err}`,
				{ cause: err }
			);

		}

	}

};

export const events_getAllEntries = (): TEventsEntry[] => {

	try {

		return events_dbAll('SELECT * FROM events');

	} catch(err: any) {

		throw new Error(
			`Failed to fetch all event entries: ${err}`,
			{ cause: err }
		);

	}

};

export const events_getAllRelevantEntries = (): TEventsEntry[] => {

	try {

		const timeRange = SharedEventsConfig.ageRangeShown;

		let minDateString = '';
		if (timeRange.minDays === Number.MIN_SAFE_INTEGER) {

			minDateString = '1970-01-01T00:00:00.001Z';

		} else {

			const minDate = new Date();
			minDate.setDate(minDate.getDate() + timeRange.minDays);
			minDateString = minDate.toISOString();

		}

		let maxDateString = '';
		if (timeRange.maxDays === Number.MAX_SAFE_INTEGER) {

			maxDateString = '9999-12-31T23:59:59.999Z';

		} else {

			const maxDate = new Date();
			maxDate.setDate(maxDate.getDate() + timeRange.maxDays);
			maxDateString = maxDate.toISOString();

		}

		return events_dbAll(
			'SELECT * FROM events WHERE datetime(dateTime) BETWEEN ? AND ?',
			minDateString,
			maxDateString
		);

	} catch(err: any) {

		throw new Error(
			`Failed to fetch all timed events entries: ${err}`,
			{ cause: err }
		);

	}

};

export const events_getEntry = (id: string): TEventsEntry => {

	try {

		return events_dbGet(
			'SELECT * FROM events WHERE id=?',
			id
		);

	} catch(err: any) {

		throw new Error(
			`Failed to fetch event entry with id '${id}': ${err}`,
			{ cause: err }
		);

	}

};

export const events_createPage = async(id: number | bigint): Promise<boolean> => {

	if (!fs.existsSync(EventsConfig.pagesPath))
		fs.mkdirSync(EventsConfig.pagesPath);

	const existingFiles = fs.readdirSync(
		EventsConfig.pagesPath,
		{ withFileTypes: true }
	);
	const existing = existingFiles.map((e) => e.name);

	if (existing.find((e) => e === `${id}.md`)) {

		return false;

	}

	const result: boolean = await new Promise((
		resolve,
		reject
	) => {

		try {

			const child = spawn(
				'node',
				[
					'./scripts/createEvent',
					id.toString()
				],
				{ shell: true }
			);

			child.on(
				'error',
				reject
			); // spawn failed (e.g. command not found)

			child.on(
				'close',
				(code) => {

					resolve(code === 0);

				}
			);

		} catch(err: any) {

			// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
			reject(err);

		}

	});

	return result;

};

events_createDbIfNotExists();
events_updateDb();
