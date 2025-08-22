import fs from 'fs';
import { hash } from 'node:crypto';

const swPath = './public/sw.js';
let swCode = fs.readFileSync(
	swPath,
	'utf8'
);

swCode = swCode.replace(
	/cache-[\w.-]+/,
	`cache-${hash(
		'sha256',
		Date
			.now()
			.toString()
	)}`
);
fs.writeFileSync(
	swPath,
	swCode
);
