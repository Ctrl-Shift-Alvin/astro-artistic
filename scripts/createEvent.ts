// Npm run createEvent {id}
import {
	existsSync,
	mkdirSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { EventsConfig } from '@/backend/config/events';
import { events_getEntry } from '@/backend/database/events';

if (!process.argv[2]) {

	console.error('Usage: createEvent <id>');
	process.exit(1);

}

// Parse arguments and other values
const id = Number.parseInt(process.argv[2]);
const fileDir = EventsConfig.pagesPath;
const fileName // Append .md if it's missing
	= process.argv[2].endsWith('.md')
		? process.argv[2]
		: `${process.argv[2]}.md`;
const filePath = join(
	fileDir,
	fileName
);

const entry = events_getEntry(id);
if (!entry)
	throw new Error(`Could not find entry with the ID '${id}'!`);

const layout = '../../templates/BaseEvent.astro';
const title = entry.title;

const frontmatter = `---
layout: '${layout}'
id: '${id}'
---

Write your event
`;

// Create file if it doesn't exist
if (!existsSync(fileDir)) {

	mkdirSync(
		fileDir,
		{ recursive: true }
	);
	console.log(`File dir ${fileDir} did not exist, so it was created`);

} else if (existsSync(filePath)) { // If the file exists, don't override it

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
