import fs from 'fs';
import { execSync } from 'child_process';
import {
	errors_getMaxBuildNumber,
	errors_addBuild
} from '../src/backend/database/errors';

const buildNumber = (errors_getMaxBuildNumber() || 0) + 1;

const swPath = './public/sw.js';
const swCode = fs
	.readFileSync(
		swPath,
		'utf8'
	)
	.replace(
		/cache-[\w.-]+/,
		`cache-${buildNumber}`
	);
fs.writeFileSync(
	swPath,
	swCode
);

const gitBranch = execSync('git rev-parse --abbrev-ref HEAD')
	.toString()
	.trim();
const gitCommit = execSync('git rev-parse HEAD')
	.toString()
	.trim();
const isGitDirty = execSync('git status --porcelain').toString().length > 0;

errors_addBuild({
	buildNumber: buildNumber,
	createdAt: new Date().toISOString(),
	gitBranch: gitBranch,
	gitCommit: gitCommit,
	isGitDirty: isGitDirty
});
