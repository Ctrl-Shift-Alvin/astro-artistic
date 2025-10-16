// Npm run createPost {file_name} {title?}
import {
	existsSync,
	mkdirSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { BlogConfig } from '@/backend/config/blog';

if (!process.argv[2]) {

	console.error('Usage: createPost <file_name> (title)');
	process.exit(1);

}

// Parse arguments and other values
const fileDir = BlogConfig.pagesPath;
const fileName // Append .md if it's missing
	= process.argv[2].endsWith('.md')
		? process.argv[2]
		: `${process.argv[2]}.md`;
const filePath = join(
	fileDir,
	fileName
);
const layout = '../../templates/BasePost.astro';
const imgSrc = '/images/xxx.png';

const title = process.argv[3];

const date = new Date().toISOString();

const frontmatter = `---
layout: '${layout}'
title: ${title ?? 'Title'}
description: Description
pubDate: ${date}
imgSrc: '${imgSrc}'
imgAlt: 'imageAlt'
---

Write your post
`;

// Create the directory if it doesn't exist
if (!existsSync(fileDir)) {

	mkdirSync(
		fileDir,
		{ recursive: true }
	);
	console.log(`File dir ${fileDir} did not exist, so it was created`);

} else if (existsSync(filePath)) { // If the file already exists, don't override it

	console.error('This file already exists.');
	process.exit(1);

}

writeFileSync(
	filePath,
	frontmatter
);
console.log(
	`Created post at '${filePath}'${
		title
			? ` titled '${title}'`
			: ''
	}`
);
