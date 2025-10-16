import fs from 'fs';
import { execSync } from 'child_process';
import path from 'node:path';
import { errors_addBuild } from '../src/backend/database/errors';
import { type TBuild } from '@/components/types';

const gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const gitCommit = execSync('git rev-parse HEAD').toString().trim();
const isGitDirty = execSync('git status --porcelain').toString().length > 0;

const addResult = errors_addBuild({
	createdAt: new Date().toISOString(),
	gitBranch: gitBranch,
	gitCommit: gitCommit,
	isGitDirty: isGitDirty
});
const build: TBuild = {

	// Fine in this case, since buildNumber being a INTEGER PRIMARY KEY (ASC) is an alias for rowid: https://www.sqlite.org/lang_createtable.html#rowid
	buildNumber: addResult.lastInsertRowid,
	createdAt: new Date().toISOString(),
	gitBranch: gitBranch,
	gitCommit: gitCommit,
	isGitDirty: isGitDirty
};

const outputPath = path.join(
	process.cwd(),
	'public/build.js'
);

// Overwrite /public/build.js script, that will be imported by the sw for build info
fs.writeFileSync(
	outputPath,
	`self.__BUILD__ = ${JSON.stringify(build)};\n`
);
