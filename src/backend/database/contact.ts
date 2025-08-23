import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {
	ZContactFormEntry,
	type TContactFormEntry,
	type TContactFormSubmission
} from '@/components/types';
import { ContactConfig } from '@/backend/config/contact';

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

	const db = new Database(ContactConfig.dbPath);
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
		db.exec(dbSetupQuery);

		return true;

	} catch(err: any) {

		console.error(
			'Error creating database table:',
			err
		);
		return false;

	} finally {

		db.close();

	}

};

const contact_updateDb = () => {

	const startDbVersion = new Database(ContactConfig.dbPath).pragma('user_version') as number;

	if (startDbVersion < CURRENT_VERSION) {

		console.log(`Updating contact submissions database from version '${startDbVersion}' to '${CURRENT_VERSION}'!`);

		const db = new Database(ContactConfig.dbPath);
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

			throw new Error('Couldn\'t update contact submissions database!');

		} finally {

			db.close();

		}

	} else if (startDbVersion > CURRENT_VERSION) {

		throw new Error('Contact submissions database version is larger than the CURRENT_VERSION.');

	}

	return false;

};

export const contact_dbRun = (
	query: string,
	...searchParams: unknown[]
): void => {

	try {

		const db = new Database(ContactConfig.dbPath);
		db
			.prepare(query)
			.run(searchParams);
		db.close();

	} catch(e: any) {

		if (contact_createDbIfNotExists()) {

			contact_dbRun(
				query,
				...searchParams
			);

		} else {

			throw new Error(`Failed to run query: ${e}`);

		}

	}

};
export const contact_dbGet = (
	query: string,
	...searchParams: unknown[]
): TContactFormEntry => {

	try {

		const db = new Database(ContactConfig.dbPath);
		const result = db
			.prepare(query)
			.get(searchParams);
		db.close();
		const parsed = ZContactFormEntry.parse(result);
		return parsed;

	} catch(e: any) {

		if (contact_createDbIfNotExists()) {

			return contact_dbGet(
				query,
				...searchParams
			);

		} else {

			throw new Error(`Failed to run query: ${e}`);

		}

	}

};
export const contact_dbAll = (
	query: string,
	...searchParams: unknown[]
): TContactFormEntry[] => {

	try {

		const db = new Database(ContactConfig.dbPath);
		const result = db
			.prepare(query)
			.all(searchParams);
		db.close();
		const parsed = ZContactFormEntry
			.array()
			.parse(result);
		return parsed;

	} catch(e: any) {

		if (contact_createDbIfNotExists()) {

			return contact_dbAll(
				query,
				...searchParams
			);

		} else {

			throw new Error(`Failed to run query: ${e}`);

		}

	}

};

export const contact_isDbDuplicateEntry = (
	email: string,
	message?: string
): boolean => {

	try {

		const db = new Database(ContactConfig.dbPath);
		const { count } = db
			.prepare('SELECT COUNT(*) AS count FROM submissions WHERE email = ? AND message = ?')
			.get(
				email,
				message ?? null
			) as { count: number };

		db.close();
		return count > 0;

	} catch(e: any) {

		if (contact_createDbIfNotExists()) {

			return contact_isDbDuplicateEntry(
				email,
				message
			);

		} else {

			throw new Error(`Failed to verify duplicate entry: ${e}`);

		}

	}

};

export const contact_addForm = (form: TContactFormSubmission) => {

	contact_dbRun(
		'INSERT INTO submissions (firstName, lastName, email, phoneNumber, message) VALUES (?, ?, ?, ?, ?)',
		form.firstName,
		form.lastName,
		form.email,
		form.phoneNumber,
		form.message
	);

};

contact_createDbIfNotExists();
contact_updateDb();
