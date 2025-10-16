import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import z from 'zod';
import {
	ZContactFormEntry,
	type TContactFormEntry,
	type TContactFormSubmission
} from '@/components/types';
import { ContactConfig } from '@/backend/config/contact';

const db = new Database(ContactConfig.dbPath);
const CURRENT_VERSION = 0;
process.on(
	'exit',
	() => db.close()
);
const updateQueries: string[][] = []; // updateQueries[0] updates to 1, updateQueries[1] updates to 2, etc.

/**
 * Create the database if it doesn't exist, and initialize it.
 *
 * When changing the structure make sure to update the version by 1,
 * and add a new update query that yields the same exact structure
 * as a now newly created DB. **There should be no difference between an *updated* and *new* DB!**
 * @returns `true` if the database was just created. Otherwise `false`.
 */
const contact_createDbIfNotExists = (): boolean => {

	// If file exists AND is not empty, do not proceed
	if (fs.existsSync(ContactConfig.dbPath) && fs.statSync(ContactConfig.dbPath).size > 1) {

		return false;

	}

	// Create directory if it doesn't exist
	const dir = path.dirname(ContactConfig.dbPath);
	if (!fs.existsSync(dir)) {

		fs.mkdirSync(
			dir,
			{ recursive: true }
		);

	}

	try {

		const dbSetupQuery
			= 'CREATE TABLE IF NOT EXISTS submissions ('
				+ 'id INTEGER PRIMARY KEY AUTOINCREMENT,'
				+ 'firstName TEXT NOT NULL,'
				+ 'lastName TEXT NOT NULL,'
				+ 'email TEXT NOT NULL,'
				+ 'phoneNumber TEXT NOT NULL,'
				+ 'message TEXT NOT NULL,'
				+ 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
				+ ');';
		const dbVersionQuery = `user_version = ${CURRENT_VERSION};`;
		db.exec(dbSetupQuery).pragma(dbVersionQuery);

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
 * E.g. Updating from version 5 to latest version 10 applies `updateQueries[5-9][...]` sequentially.
 * @returns `true` if any update operations were applied successfully. Otherwise `false`.
 * @throws if any update operations should be applied but fail. The transaction is reversed and the DB is unchanged.
 */
const contact_updateDb = () => {

	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-type-assertion
	const result = db.pragma('user_version') as [{ user_version: number }] | undefined;
	if (!result) {

		throw new Error('Could not read pragma \'user_version\'.');

	}
	const startDbVersion = result[0].user_version;

	if (startDbVersion === CURRENT_VERSION) {

		return false;

	}
	if (startDbVersion > CURRENT_VERSION) {

		throw new Error('Contact submissions database version is larger than the CURRENT_VERSION.');

	}

	console.log(`Updating contact submissions database from version '${startDbVersion}' to '${CURRENT_VERSION}'!`);

	try {

		db.transaction(
			() => {

				for (let i = startDbVersion; i < CURRENT_VERSION; i++) {

					updateQueries[i]?.forEach((q) => db.exec(q));
					db.pragma(`user_version = ${i + 1}`);

				}
				return true;

			}
		);

		return true;

	} catch(err: any) {

		throw new Error(
			`Couldn't update contact submissions database: ${err}`,
			{ cause: err }
		);

	}

};

/**
 * Run a query on the contact submissions database with params and return its result.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The result of the operation.
 */
export const contact_dbRun = (
	query: string,
	...params: unknown[]
): Database.RunResult => {

	try {

		return db.prepare(query).run(params);

	} catch(err: any) {

		if (contact_createDbIfNotExists()) {

			return contact_dbRun(
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
 * Run a query on the contact submissions database with params, then parse and validate its *first* result.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TContactFormEntry` object. Otherwise, `undefined`.
 */
export const contact_dbGet = (
	query: string,
	...params: unknown[]
): TContactFormEntry | undefined => {

	try {

		const result = db.prepare(query).get(params);
		const parsed = ZContactFormEntry.optional().parse(result);
		return parsed;

	} catch(err: any) {

		if (contact_createDbIfNotExists()) {

			return contact_dbGet(
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
 * Run a query on the contact submissions database with params, then parse and validate all results.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TContactFormEntry` array. Otherwise, an empty array.
 */
export const contact_dbAll = (
	query: string,
	...params: unknown[]
): TContactFormEntry[] => {

	try {

		const result = db.prepare(query).all(params);
		const parsed = ZContactFormEntry.array().parse(result);
		return parsed;

	} catch(err: any) {

		if (contact_createDbIfNotExists()) {

			return contact_dbAll(
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
 * Check if an existing entry with the same email and message is found in the contact submissions database.
 *
 * @param email The email to check against.
 * @param message The message to check against.
 * @returns `true` if an existing entry is found. Otherwise, `false`.
 */
export const contact_isDbDuplicateEntry = (
	email: string,
	message?: string
): boolean => {

	try {

		const result = db.prepare('SELECT COUNT(*) AS count FROM submissions WHERE email = ? AND message = ?').get(
			email,
			message ?? null
		);
		const parsed = z.object({ count: z.coerce.number() }).parse(result);

		return parsed.count > 0;

	} catch(err: any) {

		if (contact_createDbIfNotExists()) {

			return contact_isDbDuplicateEntry(
				email,
				message
			);

		} else {

			throw new Error(
				`Failed to verify duplicate entry: ${err}`,
				{ cause: err }
			);

		}

	}

};

/**
 * Add a new entry to the contact submissions database.
 *
 * @returns The result of the DB operation.
 */
export const contact_addEntry = (form: TContactFormSubmission) => {

	try {

		return contact_dbRun(
			'INSERT INTO submissions (firstName, lastName, email, phoneNumber, message) VALUES (?, ?, ?, ?, ?)',
			form.firstName,
			form.lastName,
			form.email,
			form.phoneNumber,
			form.message
		);

	} catch(err: any) {

		throw new Error(
			`Failed to add contact entry from first name '${form.firstName}'!`,
			{ cause: err }
		);

	}

};

/**
 * Get an entry by its ID from the contact submissions database.
 *
 * @returns The first parsed and validated entry that was found. Otherwise, `undefined`.
 */
export const contact_getEntry = (id: number): TContactFormEntry | undefined => {

	try {

		return contact_dbGet(
			'SELECT * FROM submissions WHERE id=?',
			id
		);

	} catch(err: any) {

		throw new Error(
			`Failed to get contact entry with ID '${id}'!`,
			{ cause: err }
		);

	}

};

/**
 * Get all entries from the contact submissions database.
 *
 * **WARNING: Can be *very* slow, this gets *ALL* entries in the database and loads them into RAM.**
 *
 * @returns All entries found in the database. Otherwise, an empty array.
 */
export const contact_getAllEntries = (): TContactFormEntry[] => {

	try {

		return contact_dbAll('SELECT * FROM submissions');

	} catch(err: any) {

		throw new Error(
			'Failed to get all contact entries!',
			{ cause: err }
		);

	}

};

/**
 * Get a certain number of entries, by an optional offset, from the contact submissions database.
 *
 * @param count The number of entries that should be retrieved.
 * @param offset The offset at which to start counting the entries.
 * @returns An array of length between `0` and `count`, depending on the available entries and `count`.
 * 	Otherwise, an empty array.
 */
export const contact_getFewEntries = (
	count: number,
	offset: number = 0
): TContactFormEntry[] => {

	try {

		const result = contact_dbAll(
			'SELECT * FROM submissions ORDER BY createdAt DESC LIMIT ? OFFSET ?',
			count,
			offset
		);
		return result;

	} catch(err: any) {

		throw new Error(
			`Failed to get few contact entries with count '${count}' and offset '${offset}'!`,
			{ cause: err }
		);

	}

};

/**
 * Delete an entry by an ID from the contact submissions database.
 *
 * @returns The result of the DB operation.
 */
export const contact_deleteEntry = (id: number) => {

	try {

		return contact_dbRun(
			'DELETE FROM submissions WHERE id=?',
			id
		);

	} catch(err: any) {

		throw new Error(
			`Failed to delete contact entry with ID '${id}'!`,
			{ cause: err }
		);

	}

};

/**
 * Get the number of entries in the contact submissions database.
 */
export const contact_countEntries = (): number => {

	try {

		const result = db.prepare('SELECT COUNT(*) AS count FROM submissions').get();

		const parsedResult = z.object({
			count: z
				.coerce
				.number()
				.default(0)
		}).parse(result);

		return parsedResult.count;

	} catch(err: any) {

		throw new Error(
			'Failed to count all contact entries!',
			{ cause: err }
		);

	}

};

contact_createDbIfNotExists();
contact_updateDb();
