import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {
	ZEventEntry,
	type TEventEntry,
	type TNewEventEntry
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

/**
 * Create the database if it doesn't exist, and initialize it.
 *
 * When changing the structure make sure to update the version by 1,
 * and add a new update query that yields the same exact structure
 * as a now newly created DB. **There should be no difference between an *updated* and *new* DB!**
 * @returns `true` if the database was just created. Otherwise `false`.
 */
const events_createDbIfNotExists = (): boolean => {

	// If file exists AND is not empty, do not proceed

	if (fs.existsSync(EventsConfig.dbPath) && fs.statSync(EventsConfig.dbPath).size > 1) {

		return false;

	}

	// Create directory if it doesn't exist
	const dir = path.dirname(EventsConfig.dbPath);
	if (!fs.existsSync(dir)) {

		fs.mkdirSync(
			dir,
			{ recursive: true }
		);

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
		const dbVersionQuery = `user_version = ${CURRENT_VERSION};`;
		db
			.exec(dbSetupQuery)
			.pragma(dbVersionQuery);

		return true;

	} catch(err: any) {

		throw new Error(
			'Error creating database table!',
			{ cause: err }
		);

	}

};

/**
 * Applies the update operations from `updateQueries` sequentially, based on the DB's version
 * compared to `CURRENT_VERSION`.
 *
 * E.g. updating from version 5 to latest version 10 applies `updateQueries[5-9][...]` sequentially.
 * @returns `true` if any update operations were applied successfully. Otherwise `false`.
 * @throws if any update operations should be applied but fail. The transaction is reversed and the DB is unchanged.
 */
const events_updateDb = () => {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const result = db.pragma('user_version') as [{ user_version: number }];
	const startDbVersion = result[0].user_version;

	if (startDbVersion > CURRENT_VERSION) {

		throw new Error('events.db version is larger than the CURRENT_VERSION.');

	}

	if (startDbVersion == CURRENT_VERSION) {

		return false;

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

/**
 * Run a query on the events database with params and return its results.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The result of the operation.
 */
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

/**
 * Run a query on the events database with params, then parse and validate its *first* result.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TEventsEntry` object. Otherwise, `undefined`.
 */
export const events_dbGet = (
	query: string,
	...params: unknown[]
): TEventEntry | undefined => {

	try {

		const result = db
			.prepare(query)
			.get(params);
		const parsed = ZEventEntry
			.optional()
			.parse(result);
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

/**
 * Run a query on the events database with params, then parse and validate all results.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TEventsEntry` array. Otherwise, an empty array.
 */
export const events_dbAll = (
	query: string,
	...params: unknown[]
): TEventEntry[] => {

	try {

		const result = db
			.prepare(query)
			.all(params);
		const parsed = ZEventEntry
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

/**
 * Get all entries from the events database.
 *
 * **WARNING: Can be *very* slow, this gets *ALL* entries in the database and loads them into RAM.**
 *
 * @returns All found entries in the database. Otherwise, an empty array.
 */
export const events_getAllEntries = (): TEventEntry[] => {

	try {

		return events_dbAll('SELECT * FROM events');

	} catch(err: any) {

		throw new Error(
			`Failed to fetch all event entries: ${err}`,
			{ cause: err }
		);

	}

};

/**
 * Get all entries based on the `EventsConfig.ageRangeShown` config option.
 *
 * @returns The entries between `TODAY - ageRangeShown.minDays` and `TODAY + ageRangeShown.maxDays`.
 */
export const events_getAllRelevantEntries = (): TEventEntry[] => {

	try {

		const timeRange = SharedEventsConfig.ageRangeShown;

		let minDateString = '';
		if (timeRange.minDays === Number.MIN_SAFE_INTEGER) {

			minDateString = '1970-01-01T00:00:00.001Z';

		} else {

			const minDate = new Date();
			minDate.setDate(minDate.getDate() + timeRange.minDays);
			minDate.setHours(
				0,
				0,
				0,
				0
			);
			minDateString = minDate.toISOString();

		}

		let maxDateString = '';
		if (timeRange.maxDays === Number.MAX_SAFE_INTEGER) {

			maxDateString = '9999-12-31T23:59:59.999Z';

		} else {

			const maxDate = new Date();
			maxDate.setDate(maxDate.getDate() + timeRange.maxDays);
			maxDate.setHours(
				23,
				59,
				59,
				999
			);
			maxDateString = maxDate.toISOString();

		}

		const result = events_dbAll(
			'SELECT * FROM events WHERE dateTime BETWEEN ? AND ?',
			minDateString,
			maxDateString
		);

		console.log(result);

		return result;

	} catch(err: any) {

		throw new Error(
			`Failed to fetch all timed events entries: ${err}`,
			{ cause: err }
		);

	}

};

/**
 * Get an entry by its ID from the events database.
 *
 * @returns The first parsed and validated entry that was found. Otherwise, `undefined`.
 */
export const events_getEntry = (id: string | number | bigint): TEventEntry | undefined => {

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

/**
 * Add a new entry to the events database.
 *
 * @returns
 */
export const events_createEntry = (entry: TNewEventEntry): Database.RunResult => {

	try {

		return events_dbRun(
			'INSERT INTO events (title, dateTime, location, enablePage) VALUES (?, ?, ?, ?)',
			entry.title,
			entry.dateTime,
			entry.location,
			entry.enablePage
				? 1
				: 0
		);

	} catch(err: any) {

		throw new Error(
			`Failed to add a new event entry: ${err}`,
			{ cause: err }
		);

	}

};

/**
 * Create a new event page belonging to an existing event entry in the events database.
 *
 * @param id The event ID associated with the new page.
 * @returns `true` if the event ID exists in the DB, and the page is successfully created. Otherwise, `false`.
 */
export const events_createPage = async(id: number | bigint): Promise<boolean> => {

	try {

		// Create the directory if it doesn't exist
		if (!fs.existsSync(EventsConfig.pagesPath)) {

			fs.mkdirSync(
				EventsConfig.pagesPath,
				{ recursive: true }
			);

		}

		const existingFiles = fs.readdirSync(
			EventsConfig.pagesPath,
			{ withFileTypes: true }
		);

		// If the file already exists or the event ID does not exist in the DB, do not proceed
		if (
			existingFiles
				.map((e) => e.name)
				.find((e) => e === `${id}.md`)
				|| events_getEntry(id) === undefined
		) {

			return false;

		}

		await new Promise((
			resolve,
			reject
		) => {

			try {

				const child = spawn(
					'npm',
					[
						'run',
						'createEvent',
						'--',
						id.toString()
					],
					{ shell: true }
				);

				child.on(
					'error',
					reject
				);

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
		return true;

	} catch(err: any) {

		console.error(
			'Failed to create a new event page with the ID ${id}:\n ',
			err
		);
		return false;

	}

};

events_createDbIfNotExists();
events_updateDb();
