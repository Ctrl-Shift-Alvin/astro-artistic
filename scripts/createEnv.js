// Npm run createEnv <ADMIN_PASSWORD> [JWT_LENGTH]
import { randomBytes } from 'node:crypto';
import {
	existsSync, writeFileSync
} from 'node:fs';
import bcrypt from 'bcrypt';

const DEFAULT_JWT_LENGTH = '1000';

function parseDurationToSeconds(duration) {

	if (!duration)
		return Number(DEFAULT_JWT_LENGTH);
	if ((/^\d+$/).test(duration))
		return Number(duration);

	let total = 0;
	const regex = /(\d+)([smhd])/g;
	let match;
	while ((match = regex.exec(duration)) !== null) {

		const value = parseInt(
			match[1],
			10
		);
		switch (match[2]) {

			case 's':
				total += value;
				break;
			case 'm':
				total += value * 60;
				break;
			case 'h':
				total += value * 3600;
				break;
			case 'd':
				total += value * 86400;
				break;

		}

	}
	return total || Number(DEFAULT_JWT_LENGTH);

}

function parseArgs() {

	const [
		, , adminPassword,
		jwtLength
	] = process.argv;
	if (!adminPassword) {

		console.error('Usage: node createEnv <ADMIN_PASSWORD> [JWT_LENGTH]');
		process.exit(1);

	}
	return {
		adminPassword,
		jwtLength: parseDurationToSeconds(jwtLength)
	};

}

function generateJwtKey() {

	// 32 bytes = 256 bits, cryptographically strong
	return randomBytes(32).toString('base64url');

}

async function createEnvContent(
	adminPassword,
	jwtKey,
	jwtLength
) {

	const hash = await bcrypt.hash(
		adminPassword,
		14
	);
	return '# .env - Development Environment Variables\n\n'
		+ `ADMIN_PASSWORD_HASH=${hash.replaceAll(
			'$',
			'\\$'
		)}\n`
		+ `JWT_KEY=${jwtKey}\n`
		+ `JWT_LENGTH=${jwtLength}\n`;

}

function main() {

	if (existsSync('.env')) {

		console.error('.env file already exists. Aborting.');
		process.exit(1);

	}
	const {
		adminPassword, jwtLength
	} = parseArgs();
	const jwtKey = generateJwtKey();
	createEnvContent(
		adminPassword,
		jwtKey,
		jwtLength
	).then((envContent) => {

		writeFileSync(
			'.env',
			envContent,
			{ encoding: 'utf8' }
		);
		console.log('.env file created successfully.');

	});

}

main();
