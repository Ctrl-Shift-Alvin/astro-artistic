// Npm run post {file_name} {title?}
import {
	existsSync, mkdirSync, writeFileSync
} from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const fileDir = 'src/pages/blog/';
const fileName = `${process.argv[2]}${process.argv[2].endsWith('.md')
	? ''
	: '.md'}`;
const filePath = join(
	root,
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
console.log(`Created post at '${filePath}'${title
	? ` titled '${title}`
	: ''}'`);
