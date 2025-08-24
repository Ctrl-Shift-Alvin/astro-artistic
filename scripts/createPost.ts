// Npm run createPost {file_name} {title?}
import {
	existsSync, mkdirSync, writeFileSync
} from 'node:fs';
import { join } from 'node:path';

if (!process.argv[2]) {

	console.error('Usage: createPost <file_name> (title)');
	process.exit(1);

}

const fileDir = 'src/pages/blog/';
const fileName
	= process.argv[2].endsWith('.md')
		? process.argv[2]
		: `${process.argv[2]}.md`;
const filePath = join(
	process.cwd(),
	fileDir,
	fileName
);
const layout = '../../templates/BasePost.astro';
const imgSrc = '/images/xxx.png';

const title = process.argv[3];

const date = new Date().toISOString();

const frontmatter = `---
layout: '${layout}'
title: ${title || 'Title'}
description: Description
pubDate: ${date}
imgSrc: '${imgSrc}'
imgAlt: 'imageAlt'
---

Write your post
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
console.log(`Created post at '${filePath}' ${
	title
		? `titled '${title}'`
		: ''
}`);
