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

process.on(
	'exit',
	() => db.close()
);

const db = new Database(ContactConfig.dbPath);
const CURRENT_VERSION = 0;
const updateQueries: string[][] = []; // updateQueries[0] updates to 1, updateQueries[1] updates to 2, etc.

// Returns true if the database was just created
const contact_createDbIfNotExists = (): boolean => {

	if (fs.existsSync(ContactConfig.dbPath) && fs.statSync(ContactConfig.dbPath).size > 1) {

		return false;

	}

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
		const dbVersionQuery = 'user_version = 0;';

		db
			.exec(dbSetupQuery)
			.pragma(dbVersionQuery);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (CURRENT_VERSION > 0) {

			contact_updateDb();

		}
		return true;

	} catch(err: any) {

		throw new Error(
			'Error creating database table!',
			{ cause: err }
		);

	}

};

const contact_updateDb = () => {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const result = db.pragma('user_version') as [{ user_version: number }];
	const startDbVersion = result[0].user_version;

	if (startDbVersion > CURRENT_VERSION) {

		throw new Error('Contact submissions database version is larger than the CURRENT_VERSION.');

	}

	if (startDbVersion == CURRENT_VERSION) {

		return;

	}

	console.log(`Updating contact submissions database from version '${startDbVersion}' to '${CURRENT_VERSION}'!`);

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
			`Couldn't update contact submissions database: ${err}`,
			{ cause: err }
		);

	}

};

export const contact_dbRun = (
	query: string,
	...params: unknown[]
): Database.RunResult => {

	try {

		return db
			.prepare(query)
			.run(params);

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
export const contact_dbGet = (
	query: string,
	...params: unknown[]
): TContactFormEntry | undefined => {

	try {

		const result = db
			.prepare(query)
			.get(params);
		const parsed = ZContactFormEntry
			.optional()
			.parse(result);
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
export const contact_dbAll = (
	query: string,
	...params: unknown[]
): TContactFormEntry[] => {

	try {

		const result = db
			.prepare(query)
			.all(params);
		const parsed = ZContactFormEntry
			.array()
			.parse(result);
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

export const contact_isDbDuplicateEntry = (
	email: string,
	message?: string
): boolean => {

	try {

		const result = db
			.prepare('SELECT COUNT(*) AS count FROM submissions WHERE email = ? AND message = ?')
			.get(
				email,
				message ?? null
			);
		const parsed = z
			.object({ count: z.coerce.number() })
			.parse(result);

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
export const contact_countEntries = (): number => {

	try {

		const result = db
			.prepare('SELECT COUNT(*) AS count FROM submissions')
			.get();

		const parsedResult = z
			.object({
				count: z.coerce
					.number()
					.default(0)
			})
			.parse(result);

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
