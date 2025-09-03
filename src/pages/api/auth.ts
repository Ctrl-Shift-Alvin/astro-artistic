import { randomUUID } from 'node:crypto';
import { type APIContext } from 'astro';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cSetAuthToken } from '@/shared/cookies';
import {
	ZAuthDeleteApiResponse, ZAuthPostApiRequest, ZAuthPostApiResponse
} from '@/components/types';
import { isAdminSetup } from '@/backend/admin';

if (!isAdminSetup)
	throw new Error('Admin page is not setup but accessed!');

const ADMIN_PASSWORD_HASH = import.meta.env.ADMIN_PASSWORD_HASH as string;
const JWT_KEY = import.meta.env.JWT_KEY as string;
const JWT_LENGTH = Number(import.meta.env.JWT_LENGTH);

export async function POST(context: APIContext) {

	if (context.url.pathname !== '/api/auth/') {

		const errorBody = ZAuthPostApiResponse.parse({ error: 'bad-request' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	const parsedRequest = await ZAuthPostApiRequest.safeParseAsync(await context.request.json());
	if (!parsedRequest.success || !parsedRequest.data.password) {

		const errorBody = ZAuthPostApiResponse.parse({ error: 'bad-request' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	const compareResult = await bcrypt.compare(
		parsedRequest.data.password,
		ADMIN_PASSWORD_HASH
	);

	if (!compareResult) {

		const errorBody = ZAuthPostApiResponse.parse({ error: 'unauthorized' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 401 }
		);

	}

	try {

		// Generate JWT token
		const token = jwt.sign(
			{ admin: true },
			JWT_KEY,
			{
				expiresIn: `${JWT_LENGTH}s`,
				subject: 'admin-user',
				jwtid: randomUUID()
			}
		);

		// Set cookie
		cSetAuthToken(
			token,
			context
		);

		const responseBody = ZAuthPostApiResponse.parse({ message: 'success' });
		return new Response(
			JSON.stringify(responseBody),
			{ status: 200 }
		);

	} catch {

		const errorBody = ZAuthPostApiResponse.parse({ error: 'server-error' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 500 }
		);

	}

}

export function DELETE(context: APIContext) {

	if (context.url.pathname !== '/api/auth/') {

		const errorBody = ZAuthDeleteApiResponse.parse({ error: 'bad-request' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 400 }
		);

	}

	cSetAuthToken(
		null,
		context
	);
	const responseBody = ZAuthDeleteApiResponse.parse({ message: 'success' });
	return new Response(
		JSON.stringify(responseBody),
		{ status: 200 }
	);

}
