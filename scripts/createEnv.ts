// Npm run createEnv <ADMIN_PASSWORD> [JWT_LENGTH]
import { randomBytes } from 'node:crypto';
import {
	existsSync,
	writeFileSync
} from 'node:fs';
import bcrypt from 'bcrypt';

const DEFAULT_JWT_LENGTH = 1000;

function parseDurationToSeconds(duration?: string): number {

	if (!duration)
		return DEFAULT_JWT_LENGTH;
	if ((/^\d+$/).test(duration)) // Only numbers?
		return parseInt(duration);

	let total: number | undefined = 0;
	let match;
	while ((match = (/(\d+)([smhd])/g).exec(duration)) !== null) {

		if (!match[1]) {

			total = undefined;
			break;

		}
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
			case undefined:
				throw new Error('Couldn\'t parse duration');

		}

	}
	if (total) {

		return total;

	} else {

		console.warn('Failed to parse duration to seconds, returning default value!');
		return DEFAULT_JWT_LENGTH;

	}

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

/**
 * Generates a random 32-byte JWT key, and converts it to a Base-64 string.
 * @returns A Base-64 string that represents the new 32-byte JWT key.
 */
function generateJwtKey() {

	// 32 bytes = 256 bits, cryptographically strong
	return randomBytes(32).toString('base64url');

}

async function createEnvContent(
	adminPassword: string,
	jwtKey: string,
	jwtLength: number
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

async function main() {

	// If .env already exists, don't override it
	if (existsSync('.env')) {

		console.error('.env file already exists. Aborting.');
		process.exit(1);

	}
	const {
		adminPassword,
		jwtLength
	} = parseArgs();

	await createEnvContent(
		adminPassword,
		generateJwtKey(),
		jwtLength
	).then(
		(envContent) => {

			writeFileSync(
				'.env',
				envContent,
				{ encoding: 'utf8' }
			);
			console.log('.env file created successfully.');

		}
	);

}

await main();
