import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import z from 'zod';
import { ErrorsConfig } from '@/backend/config/errors';
import {
	type TError,
	type TErrorSubmission,
	type TBuild
} from '@/components/types';
import {
	ZError,
	ZBuild
}
	from '@/components/types';

const db = new Database(ErrorsConfig.dbPath);
const CURRENT_VERSION = 0;
const updateQueries: string[][] = []; // updateQueries[0] updates to 1, updateQueries[1] updates to 2, etc.
process.on(
	'exit',
	() => db.close()
);

/**
 * Create the database if it doesn't exist, and initialize it.
 *
 * When changing the structure make sure to update the version by 1,
 * and add a new update query that yields the same exact structure
 * as a now newly created DB. **There should be no difference between an *updated* and *new* DB!**
 * @returns `true` if the database was just created. Otherwise `false`.
 */
const errors_createDbIfNotExists = (): boolean => {

	// If file exists AND is not empty, do not proceed
	if (fs.existsSync(ErrorsConfig.dbPath) && fs.statSync(ErrorsConfig.dbPath).size > 1) {

		return false;

	}

	// Create directory if it doesn't exist
	const dir = path.dirname(ErrorsConfig.dbPath);
	if (!fs.existsSync(dir)) {

		fs.mkdirSync(
			dir,
			{ recursive: true }
		);

	}

	try {

		const dbSetupQuery
			= 'CREATE TABLE IF NOT EXISTS builds ('
				+ 'buildNumber INTEGER PRIMARY KEY,'
				+ 'createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,'
				+ 'gitBranch TEXT NOT NULL,'
				+ 'gitCommit TEXT CHECK(LENGTH(gitCommit) >= 40),'
				+ 'isGitDirty BOOLEAN NOT NULL CHECK (isGitDirty IN (0, 1))'
				+ ');'

				+ 'CREATE TABLE IF NOT EXISTS errors ('
				+ 'id INTEGER PRIMARY KEY,'
				+ 'createdAt DATETIME DEFAULT (strftime(\'%Y-%m-%d %H:%M:%f\', \'now\')),'
				+ 'buildNumber INTEGER NOT NULL,'
				+ 'isClient BOOLEAN NOT NULL CHECK (isClient IN (0, 1)),'
				+ 'url TEXT NOT NULL,'
				+ 'status INTEGER CHECK (status>0 AND status<600),'
				+ 'statusText TEXT,'
				+ 'errorMessage TEXT,'
				+ 'errorCause TEXT,'
				+ 'errorStack TEXT,'
				+ 'FOREIGN KEY (buildNumber) REFERENCES builds(buildNumber) ON DELETE CASCADE'
				+ ');'

				+ 'CREATE INDEX idx_errors_buildNumber ON errors(buildNumber);' // Index by buildNumber
				+ 'CREATE INDEX idx_errors_createdAt ON errors(createdAt);'; // Index by createdAt

		const dbVersionQuery = `user_version = ${CURRENT_VERSION};`;
		db.pragma('foreign_keys = 1');
		db.exec(dbSetupQuery).pragma(dbVersionQuery);

		return true;

	} catch(err: any) {

		throw new Error(
			'Error creating database table:',
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
const errors_updateDb = () => {

	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-type-assertion
	const result = db.pragma('user_version') as [{ user_version: number }] | undefined;
	if (!result) {

		throw new Error('Could not read pragma \'user_version\' of errors database.');

	}
	const startDbVersion = result[0].user_version;
	if (startDbVersion === CURRENT_VERSION) {

		return false;

	}
	if (startDbVersion > CURRENT_VERSION) {

		throw new Error('Errors database version is larger than the CURRENT_VERSION.');

	}

	console.log(`Updating errors database from version '${startDbVersion}' to '${CURRENT_VERSION}'!`);

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
			`Couldn't update errors database: ${err}`,
			{ cause: err }
		);

	}

};

/**
 * Run a query on the errors/builds database with params and return its result.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The result of the operation.
 */
export const errors_dbRun = (
	query: string,
	...params: unknown[]
): Database.RunResult => {

	try {

		return db.prepare(query).run(params);

	} catch(err: any) {

		if (errors_createDbIfNotExists()) {

			return errors_dbRun(
				query,
				...params
			);

		} else {

			throw new Error(`Failed to run query '${query}': ${err}`);

		}

	}

};

/**
 * Run a query on the builds database with params, then parse and validate its *first* result.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TBuild` object. Otherwise, `undefined`.
 */
export const errors_dbGetBuild = (
	query: string,
	...params: unknown[]
): TBuild | undefined => {

	try {

		const result = db.prepare(query).get(params);
		const parsed = ZBuild.optional().parse(result);
		return parsed;

	} catch(err: any) {

		if (errors_createDbIfNotExists()) {

			return errors_dbGetBuild(
				query,
				...params
			);

		} else {

			throw new Error(`Failed to run query '${query}': ${err}`);

		}

	}

};

/**
 * Run a query on the builds database with params, then parse and validate all results.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TBuild` array. Otherwise, an empty array.
 */
export const errors_dbAllBuild = (
	query: string,
	...params: unknown[]
): TBuild[] => {

	try {

		const result = db.prepare(query).all(params);
		const parsed = ZBuild.array().parse(result);
		return parsed;

	} catch(err: any) {

		if (errors_createDbIfNotExists()) {

			return errors_dbAllBuild(
				query,
				...params
			);

		} else {

			throw new Error(`Failed to run query '${query}': ${err}`);

		}

	}

};

/**
 * Run a query on the errors database with params, then parse and validate its *first* result.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TError` object. Otherwise, `undefined`.
 */
export const errors_dbGetError = (
	query: string,
	...params: unknown[]
): TError | undefined => {

	try {

		const result = db.prepare(query).get(params);
		const parsed = ZError.optional().parse(result);
		return parsed;

	} catch(err: any) {

		if (errors_createDbIfNotExists()) {

			return errors_dbGetError(
				query,
				...params
			);

		} else {

			throw new Error(`Failed to run query '${query}': ${err}`);

		}

	}

};

/**
 * Run a query on the errors database with params, then parse and validate all results.
 * @param query The query to run.
 * @param params The params to provide to the query.
 * @returns The parsed and validated `TError` array. Otherwise, an empty array.
 */
export const errors_dbAllError = (
	query: string,
	...params: unknown[]
): TError[] => {

	try {

		const result = db.prepare(query).all(params);
		const parsed = ZError.array().parse(result);
		return parsed;

	} catch(err: any) {

		if (errors_createDbIfNotExists()) {

			return errors_dbAllError(
				query,
				...params
			);

		} else {

			throw new Error(`Failed to run query '${query}': ${err}`);

		}

	}

};

/**
 * Add a new entry to the builds database.
 *
 * @returns The result of the DB operation.
 */
export const errors_addBuild = (build: {
	createdAt: string;
	gitBranch: string;
	gitCommit: string;
	isGitDirty: boolean;
}) => {

	try {

		return errors_dbRun(
			'INSERT INTO builds (createdAt, gitBranch, gitCommit, isGitDirty) VALUES (?,?,?,?)',
			build.createdAt,
			build.gitBranch,
			build.gitCommit,
			build.isGitDirty
				? 1
				: 0
		);

	} catch(err: any) {

		throw new Error(
			'Failed to add a new build!',
			{ cause: err }
		);

	}

};

/**
 * Get an entry by its ID from the builds database.
 *
 * @returns The first parsed and validated entry that was found. Otherwise, `undefined`.
 */
export const errors_getBuild = (buildNumber: number): TBuild | undefined => {

	try {

		return errors_dbGetBuild(
			'SELECT * FROM builds WHERE buildNumber=?',
			buildNumber
		);

	} catch(err: any) {

		throw new Error(
			`Failed to get build with ID '${buildNumber}'!`,
			{ cause: err }
		);

	}

};

/**
 * Returns the latest entry from the builds database.
 *
 * Uses the `createdAt` field to order the entries in descending order, and returns the first result.
 *
 * @returns The latest (current) build from the builds database.
 */
export const errors_getCurrentBuild = (): TBuild | undefined => {

	try {

		return errors_dbGetBuild('SELECT * FROM builds ORDER BY buildNumber DESC LIMIT 1');

	} catch(err: any) {

		throw new Error(
			'Failed to get current build!',
			{ cause: err }
		);

	}

};

/**
 * Get all entries from the builds database.
 *
 * **WARNING: Can be *very* slow, this gets *ALL* entries in the database and loads them into RAM.**
 *
 * @returns All entries found in the database. Otherwise, an empty array.
 */
export const errors_getAllBuilds = (): TBuild[] => {

	try {

		return errors_dbAllBuild('SELECT * FROM builds');

	} catch(err: any) {

		throw new Error(
			'Failed to get all builds!',
			{ cause: err }
		);

	}

};

/**
 * Get a certain number of entries, by an optional offset, from the builds database.
 *
 * @param count The number of entries that should be retrieved.
 * @param offset The offset at which to start counting the entries.
 * @returns An array of length between `0` and `count`, depending on the available entries and `count`.
 * 	Otherwise, an empty array.
 */
export const errors_getFewBuilds = (
	count: number,
	offset: number = 0
): TBuild[] => {

	try {

		const result = errors_dbAllBuild(
			'SELECT * FROM builds ORDER BY createdAt DESC LIMIT ? OFFSET ?',
			count,
			offset
		);
		return result;

	} catch(err: any) {

		throw new Error(
			`Failed to get few builds with count '${count}' and offset '${offset}'!`,
			{ cause: err }
		);

	}

};

/**
 * Delete an entry by an ID from the builds database. Also deletes all errors that belong to this build!
 *
 * @returns The result of the DB operation.
 */
export const errors_deleteBuild = (buildNumber: number) => {

	try {

		return errors_dbRun(
			'DELETE FROM builds WHERE buildNumber=?',
			buildNumber
		);

	} catch(err: any) {

		throw new Error(
			`Failed to delete build '${buildNumber}'!`,
			{ cause: err }
		);

	}

};

/**
 * Get the number of entries in the builds database.
 */
export const errors_countBuilds = (): number => {

	try {

		const result = db.prepare('SELECT COUNT(*) AS count FROM builds').get();

		const parsedResult = z.object({
			count: z
				.coerce
				.number()
				.default(0)
		}).parse(result);

		return parsedResult.count;

	} catch(err: any) {

		throw new Error(
			'Failed to count all builds!',
			{ cause: err }
		);

	}

};

/**
 * Add a new entry to the errors database.
 *
 * @returns The result of the DB operation.
 */
export const errors_addErrorSubmission = (submission: TErrorSubmission) => {

	try {

		return errors_dbRun(
		// eslint-disable-next-line @stylistic/max-len
			'INSERT INTO errors (buildNumber, isClient, url, status, statusText, errorMessage, errorCause, errorStack) VALUES (?,?,?,?,?,?,?,?)',
			submission.buildNumber,
			submission.isClient
				? 1
				: 0,
			submission.url,
			submission.status,
			submission.statusText,
			submission.errorMessage,
			submission.errorCause,
			submission.errorStack
		);

	} catch(err: any) {

		throw new Error(
			'Failed to add an error submission!',
			{ cause: err }
		);

	}

};

/**
 * Check if an existing entry with equivalent parameters is found in the contact submissions database.
 *
 * The check works against the following values: `url`, `isClient`, `status`, `statusText`, `errorMessage`,
 * `errorCause`, `errorStack` and `createdAt` (positive within 24 hours).
 *
 * @param submission The object to check against.
 * @returns `true` if an existing entry is found. Otherwise, `false`.
 */
export const errors_isDuplicateError = (submission: TErrorSubmission): boolean => {

	try {

		const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();

		const result = errors_dbGetError(
			'SELECT * FROM errors WHERE '
			+ 'url IS ? AND '
			+ 'isClient IS ? AND '
			+ 'status IS ? AND '
			+ 'statusText IS ? AND '
			+ 'errorMessage IS ? AND '
			+ 'errorCause IS ? AND '
			+ 'errorStack IS ? AND '
			+ 'createdAt > ? LIMIT 1',
			submission.url,
			submission.isClient
				? 1
				: 0,
			submission.status ?? null,
			submission.statusText ?? null,
			submission.errorMessage ?? null,
			submission.errorCause ?? null,
			submission.errorStack ?? null,
			twentyFourHoursAgo
		);

		return result !== undefined;

	} catch(err: any) {

		throw new Error(
			'Failed to check for duplicate errors!',
			{ cause: err }
		);

	}

};

/**
 * Get an entry by its ID from the errors database.
 *
 * @returns The first parsed and validated entry that was found. Otherwise, `undefined`.
 */
export const errors_getError = (id: number): TError | undefined => {

	try {

		return errors_dbGetError(
			'SELECT * FROM errors WHERE id=?',
			id
		);

	} catch(err: any) {

		throw new Error(
			'Failed to get all errors!',
			{ cause: err }
		);

	}

};

/**
 * Get all entries from the errors database.
 *
 * **WARNING: Can be *very* slow, this gets *ALL* entries in the database and loads them into RAM.**
 *
 * @returns All entries found in the database. Otherwise, an empty array.
 */
export const errors_getAllErrors = (): TError[] => {

	try {

		return errors_dbAllError('SELECT * FROM errors');

	} catch(err: any) {

		throw new Error(
			'Failed to get all errors!',
			{ cause: err }
		);

	}

};

/**
 * Get a certain number of entries, by an optional offset, from the errors database.
 *
 * @param count The number of entries that should be retrieved.
 * @param offset The offset at which to start counting the entries.
 * @returns An array of length between `0` and `count`, depending on the available entries and `count`.
 * 	Otherwise, an empty array.
 */
export const errors_getFewErrors = (
	count: number,
	offset: number = 0
): TError[] => {

	try {

		const result = errors_dbAllError(
			'SELECT * FROM errors ORDER BY createdAt DESC LIMIT ? OFFSET ?',
			count,
			offset
		);

		return result;

	} catch(err: any) {

		throw new Error(
			`Failed to get few errors with count '${count}' and offset '${offset}'!`,
			{ cause: err }
		);

	}

};

/**
 * Get a certain number of entries, by an optional offset, from the errors database, that belong to a build number.
 *
 * @param buildNumber The build number from the builds database used to retrieve the errors.
 * @param count The number of entries that should be retrieved.
 * @param offset The offset at which to start counting the entries.
 * @returns An array of length between `0` and `count`, depending on the available entries and `count`.
 * 	Otherwise, an empty array.
 */
export const errors_getFewErrorsByBuild = (
	buildNumber: number,
	count: number,
	offset: number = 0
): TError[] => {

	try {

		const result = errors_dbAllError(
			'SELECT * FROM errors WHERE buildNumber=? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
			buildNumber,
			count,
			offset
		);

		return result;

	} catch(err: any) {

		throw new Error(
			`Failed to get few errors from build '${buildNumber}'!`,
			{ cause: err }
		);

	}

};

/**
 * Delete an entry by an ID from the errors database.
 *
 * @returns The result of the DB operation.
 */
export const errors_deleteError = (id: number) => {

	try {

		return errors_dbRun(
			'DELETE FROM errors WHERE id=?',
			id
		);

	} catch(err: any) {

		throw new Error(
			`Failed to delete error with ID '${id}'!`,
			{ cause: err }
		);

	}

};

/**
 * Get the number of entries in the errors database.
 */
export const errors_countErrors = (): number => {

	try {

		const result = db.prepare('SELECT COUNT(*) AS count FROM errors').get();

		const parsedResult = z.object({
			count: z
				.coerce
				.number()
				.default(0)
		}).parse(result);

		return parsedResult.count;

	} catch(err: any) {

		throw new Error(
			'Failed to count all errors!',
			{ cause: err }
		);

	}

};

/**
 * Get the number of entries, that belong to a build numbers, from the errors database.
 *
 * @param buildNumber The build number from the builds database used to retrieve the error count.
 */
export const errors_countErrorsByBuild = (buildNumber: number): number => {

	try {

		const result = db.prepare('SELECT COUNT(*) AS count FROM errors WHERE buildNumber=?').get(buildNumber);

		const parsedResult = z.object({
			count: z
				.coerce
				.number()
				.default(0)
		}).parse(result);
		return parsedResult.count;

	} catch(err: any) {

		throw new Error(
			`Failed to count errors of build '${buildNumber}'!`,
			{ cause: err }
		);

	}

};

errors_createDbIfNotExists();
errors_updateDb();
