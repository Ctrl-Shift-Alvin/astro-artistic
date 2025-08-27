import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import z from 'zod';
import { ErrorsConfig as SharedErrorsConfig } from '@/shared/config/errors';
import { ErrorsConfig } from '@/backend/config/errors';
import {
	TError,
	ZError,
	TErrorSubmission,
	TBuild,
	ZBuild
} from '@/components/types';

if (!SharedErrorsConfig.enable)
	process.exit(0);

process.on(
	'exit',
	() => db.close()
);

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Window { __BUILD__: TBuild }
}

const db = new Database(ErrorsConfig.dbPath);
const CURRENT_VERSION = 0;
const updateQueries: string[][] = []; // updateQueries[0] updates to 1, updateQueries[1] updates to 2, etc.

// Returns true if the database was just created
const errors_createDbIfNotExists = (): boolean => {

	if (fs.existsSync(ErrorsConfig.dbPath) && fs.statSync(ErrorsConfig.dbPath).size > 1) {

		return false;

	}

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
				+ 'id INTEGER PRIMARY KEY AUTOINCREMENT,'
				+ 'createdAt DATETIME DEFAULT (strftime(\'%Y-%m-%d %H:%M:%f\', \'now\')),'
				+ 'buildNumber INTEGER NOT NULL,'
				+ 'isClient BOOLEAN NOT NULL CHECK (isClient IN (0, 1)),'
				+ 'status INTEGER CHECK (status>0 AND status<600),'
				+ 'statusText TEXT,'
				+ 'errorMessage TEXT,'
				+ 'errorCause TEXT,'
				+ 'errorStack TEXT,'
				+ 'FOREIGN KEY (buildNumber) REFERENCES builds(buildNumber) ON DELETE CASCADE'
				+ ');'

				+ 'CREATE INDEX idx_errors_buildNumber ON errors(buildNumber);' // Index by buildNumber
				+ 'CREATE INDEX idx_errors_createdAt ON errors(createdAt);'; // Index by createdAt

		const dbVersionQuery = 'user_version = 0;';

		db.pragma('foreign_keys = 1');
		db
			.exec(dbSetupQuery)
			.pragma(dbVersionQuery);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (CURRENT_VERSION > 0) {

			errors_updateDb();

		}
		return true;

	} catch(err: any) {

		throw new Error(
			'Error creating database table:',
			{ cause: err }
		);

	}

};
const errors_updateDb = () => {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const result = db.pragma('user_version') as [{ user_version: number }];
	const startDbVersion = result[0].user_version;

	if (startDbVersion == CURRENT_VERSION) {

		return;

	}

	if (startDbVersion > CURRENT_VERSION) {

		throw new Error('Contact submissions database version is larger than the CURRENT_VERSION.');

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
			`Couldn\'t update errors database: ${err}`,
			{ cause: err }
		);

	}

};

export const errors_dbRun = (
	query: string,
	...params: unknown[]
): Database.RunResult => {

	try {

		return db
			.prepare(query)
			.run(params);

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
export const errors_dbGetBuild = (
	query: string,
	...params: unknown[]
): TBuild | undefined => {

	try {

		const result = db
			.prepare(query)
			.get(params);
		const parsed = ZBuild
			.optional()
			.parse(result);
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
export const errors_dbAllBuild = (
	query: string,
	...params: unknown[]
): TBuild[] => {

	try {

		const result = db
			.prepare(query)
			.all(params);
		const parsed = ZBuild
			.array()
			.parse(result);
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
export const errors_dbGetError = (
	query: string,
	...params: unknown[]
): TError | undefined => {

	try {

		const result = db
			.prepare(query)
			.get(params);
		const parsed = ZError
			.optional()
			.parse(result);
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
export const errors_dbAllError = (
	query: string,
	...params: unknown[]
): TError[] => {

	try {

		const result = db
			.prepare(query)
			.all(params);
		const parsed = ZError
			.array()
			.parse(result);
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

export const errors_getLastBuild = (): TBuild | undefined => {

	try {

		return errors_dbGetBuild('SELECT * FROM builds ORDER BY createdAt DESC LIMIT 1');

	} catch(err: any) {

		throw new Error(
			'Failed to get latest build number!',
			{ cause: err }
		);

	}

};
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
export const errors_getBuildCount = (): number => {

	try {

		const result = db
			.prepare('SELECT COUNT(*) AS count')
			.get();

		const parsed = z
			.object({
				count: z.coerce
					.number()
					.default(0)
			})
			.parse(result);
		return parsed.count;

	} catch(err: any) {

		throw new Error(
			'Failed to get the build row count!',
			{ cause: err }
		);

	}

};

export const errors_addErrorSubmission = (submission: TErrorSubmission) => {

	try {

		return errors_dbRun(
		// eslint-disable-next-line @stylistic/max-len
			'INSERT INTO errors (buildNumber, isClient, status, statusText, errorMessage, errorCause, errorStack) VALUES (?,?,?,?,?,?,?)',
			submission.buildNumber,
			submission.isClient,
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
export const errors_getAllErrors = (): TError[] => {

	try {

		return errors_dbAllError('SELECT * FROM errors');

	} catch(err: any) {

		throw new Error(
			'Failed to get all error submissions!',
			{ cause: err }
		);

	}

};
export const errors_getRecentErrors = (count: number): TError[] => {

	try {

		return errors_dbAllError(
			'SELECT * FROM errors ORDER BY createdAt DESC LIMIT ?',
			count
		);

	} catch(err: any) {

		throw new Error(
			'Failed to get recent errors!',
			{ cause: err }
		);

	}

};

errors_createDbIfNotExists();
errors_updateDb();
