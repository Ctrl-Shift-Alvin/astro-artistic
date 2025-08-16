// Npm run event {id}
import {
	existsSync, mkdirSync, writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';

const root = process.cwd();

const id = Number.parseInt(process.argv[2]);

const fileDir = 'src/pages/events/';
const fileName = `${process.argv[2]}${process.argv[2].endsWith('.md')
	? ''
	: '.md'}`;
const filePath = join(
	root,
	fileDir,
	fileName
);

const db = new Database('./data/events.db');
const entry = db
	.prepare('SELECT * FROM events WHERE id=?')
	.get(id);
if (entry === null)
	throw new Error(`Could not find entry with the ID '${id}'!`);

const layout = '../../templates/BaseEvent.astro';
const title = entry.title;

const frontmatter = `---
layout: '${layout}'
id: '${id}'
---

Write your event
`;

if (!existsSync(fileDir)) {

	mkdirSync(
		fileDir,
		{ recursive: true }
	);
	console.log(`File dir ${fileDir} did not exist, so it was created`);

}

if (existsSync(filePath)) {

	console.error('This file already exists.');
	process.exit(1);

}

writeFileSync(
	filePath,
	frontmatter
);
console.log(`Created post at '${filePath}'${title
	? ` titled '${title}`
	: ''}'`);
