import { spawn } from 'node:child_process';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import {
	ZEventsEntry,
	type TEventsEntry
} from '@/components/types';
import { EventsConfig } from '@/backend/config/events';
import { EventsConfig as SharedEventsConfig } from '@/shared/config/events';

const updateQueries: string[][] = []; // updateQueries[0] updates to 1, updateQueries[1] updates to 2, etc.
const CURRENT_VERSION = updateQueries.length;

const events_createDbIfNotExists = (): boolean => {

	try {

		if (fs.existsSync(EventsConfig.dbPath) && fs.statSync(EventsConfig.dbPath).size > 1)
			return false;

		if (!fs.existsSync('./data')) {

			fs.mkdirSync('./data');

		}

		const dbSetupQuery
		= 'CREATE TABLE IF NOT EXISTS events ('
			+ 'id INTEGER PRIMARY KEY AUTOINCREMENT,'
			+ 'title TEXT NOT NULL,'
			+ 'dateTime TEXT NOT NULL,'
			+ 'location TEXT NOT NULL,'
			+ 'enablePage BOOLEAN NOT NULL CHECK (enablePage IN (0, 1)),'
			+ 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
			+ ');';
		const dbVersionQuery = 'user_version = 1;';
		new Database(EventsConfig.dbPath)
			.exec(dbSetupQuery)
			.exec(dbVersionQuery)
			.close();

		return true;

	} catch {

		return false;

	}

};
const events_updateDb = () => {

	const startDbVersion = new Database(EventsConfig.dbPath).pragma('user_version') as number;

	if (startDbVersion < CURRENT_VERSION) {

		console.log(`Updating events database from version '${startDbVersion}' to '${CURRENT_VERSION}'!`);

		const db = new Database(EventsConfig.dbPath);
		try {

			db.transaction(() => {

				for (let i = startDbVersion; i < CURRENT_VERSION; i++) {

					updateQueries[i]?.forEach((q) => db.exec(q));
					db.pragma(`user_version = ${i + 1}`);

				}
				return true;

			});
			return true;

		} catch {

			throw new Error('Couldn\'t update events.db!');

		} finally {

			db.close();

		}

	} else if (startDbVersion > CURRENT_VERSION) {

		throw new Error('events.db version is larger than the CURRENT_VERSION.');

	}

	return false;

};

export const events_dbRun = (
	query: string,
	...searchParams: unknown[]
): Database.RunResult => {

	try {

		const db = new Database(EventsConfig.dbPath);
		const result = db
			.prepare(query)
			.run(searchParams);
		db.close();
		return result;

	} catch(e: any) {

		if (events_createDbIfNotExists()) {

			return events_dbRun(
				query,
				...searchParams
			);

		} else {

			throw new Error(`Failed to run query: ${e}`);

		}

	}

};
export function events_dbGet(
	query: string,
	...searchParams: unknown[]
) {

	try {

		const db = new Database(EventsConfig.dbPath);
		const result = db
			.prepare(query)
			.get(searchParams);
		db.close();
		return result;

	} catch(e: any) {

		if (events_createDbIfNotExists()) {

			return events_dbGet(
				query,
				...searchParams
			);

		} else {

			throw new Error(`Failed to run query: ${e}`);

		}

	}

}
export function events_dbAll(
	query: string,
	...searchParams: unknown[]
) {

	try {

		const db = new Database(EventsConfig.dbPath);
		const result = db
			.prepare(query)
			.all(searchParams);
		db.close();
		return result;

	} catch(e: any) {

		if (events_createDbIfNotExists()) {

			return events_dbAll(
				query,
				...searchParams
			);

		} else {

			throw new Error(`Failed to run query: ${e}`);

		}

	}

}

export const events_getAllEntries = (): TEventsEntry[] => {

	try {

		const result = events_dbAll('SELECT * FROM events');
		return ZEventsEntry
			.array()
			.parse(result);

	} catch(e: any) {

		throw new Error(`Failed to fetch all event entries: ${e}`);

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

		const result = events_dbAll(
			'SELECT * FROM events WHERE datetime(dateTime) BETWEEN ? AND ?',
			minDateString,
			maxDateString
		);
		return ZEventsEntry
			.array()
			.parse(result);

	} catch(e: any) {

		throw new Error(`Failed to fetch all timed events entries: ${e}`);

	}

};

export const events_getEntry = (id: string): TEventsEntry => {

	try {

		const result = events_dbGet(
			'SELECT * FROM events WHERE id=?',
			id
		);
		return ZEventsEntry.parse(result);

	} catch(e: any) {

		throw new Error(`Failed to fetch entry with id '${id}': ${e}`);

	}

};

export const events_createPage = async(id: string): Promise<boolean> => {

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
					id
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

		} catch(e: any) {

			// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
			reject(e);

		}

	});

	return result;

};

events_createDbIfNotExists();
events_updateDb();
