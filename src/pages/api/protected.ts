import { spawn } from 'node:child_process';
import {
	existsSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import path from 'node:path';
import { type APIContext } from 'astro';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import {
	ZApiResponse,
	ZEventsEntry,
	ZProtectedGetApiResponse,
	ZProtectedPostApiRequestMap,
	TProtectedPostApiResponseMap
} from '@/components/types';
import { cGetAuthToken } from '@/shared/cookies';
import {
	contact_dbAll,
	contact_dbGet,
	contact_dbRun
} from '@/backend/database/contact';
import {
	events_createPage,
	events_dbGet,
	events_dbRun, events_getAllEntries
} from '@/backend/database/events';
import { EventsConfig } from '@/backend/config/events';
import { BlogConfig } from '@/backend/config/blog';
import {
	errors_dbGetBuild,
	errors_dbRun,
	errors_getBuildCount,
	errors_getRecentBuilds
} from '@/backend/database/errors';

const SECRET_KEY = import.meta.env.JWT_KEY as string;

export function GET(context: APIContext) {

	if (context.url.pathname !== '/api/protected/') {

		const errorBody = ZProtectedGetApiResponse.parse({ error: 'not-found' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 404 }
		);

	}

	const token = cGetAuthToken(context);

	if (!token) {

		const errorBody = ZProtectedGetApiResponse.parse({ error: 'unauthorized' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 401 }
		);

	}

	let decodedTokenPayload;

	// Verify token
	try {

		decodedTokenPayload = jwt.verify(
			token,
			SECRET_KEY,
			{ subject: 'admin-user' }
		) as JwtPayload;

	} catch {

		const errorBody = ZProtectedGetApiResponse.parse({ error: 'unauthorized' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 401 }
		);

	}

	if (!decodedTokenPayload.exp) {

		const errorBody = ZProtectedGetApiResponse.parse({ error: 'bad-token' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 500 }
		);

	}

	// Return expiry time
	const responseBody = ZProtectedGetApiResponse.parse({
		message: 'success',
		expiry: decodedTokenPayload.exp * 1000
	});

	return new Response(
		JSON.stringify(responseBody),
		{ status: 200 }
	);

}

export async function POST(context: APIContext) {

	if (context.url.pathname !== '/api/protected/') {

		const errorBody = ZProtectedGetApiResponse.parse({ error: 'not-found' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 404 }
		);

	}

	const token = cGetAuthToken(context);

	if (!token) {

		const errorBody = ZProtectedGetApiResponse.parse({ error: 'unauthorized' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 401 }
		);

	}

	// Verify token
	try {

		jwt.verify(
			token,
			SECRET_KEY
		);

	} catch {

		const errorBody = ZProtectedGetApiResponse.parse({ error: 'bad-token' });
		return new Response(
			JSON.stringify(errorBody),
			{ status: 401 }
		);

	}

	const url = context.url;
	const getParam = (param: string) => {

		const paramValue = url.searchParams.get(param);
		return paramValue === null
			? null
			: decodeURIComponent(paramValue);

	};

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const body = await context.request
		.json()
		.catch(() => undefined);

	const requestType = getParam('type');
	switch (requestType) {

		case 'forms/index': {

			try {

				const result = contact_dbAll('SELECT * FROM submissions');
				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: result
				});

				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'forms/get': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			try {

				const requestDataId = parsedBody.data.id;
				const result = contact_dbGet(
					'SELECT * FROM submissions WHERE id=?',
					requestDataId
				);
				if (!result) {

					const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'not-found' });
					return new Response(
						JSON.stringify(responseBody),
						{ status: 404 }
					);

				}
				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: result
				});

				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'forms/remove': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const requestDataId = parsedBody.data.id;
			try {

				contact_dbRun(
					'DELETE FROM submissions WHERE id=?',
					requestDataId
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

			const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
			return new Response(
				JSON.stringify(responseBody),
				{ status: 200 }
			);

		}

		case 'events/index': {

			try {

				const entries = events_getAllEntries();

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: entries
				});
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'events/add': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const newEntry = parsedBody.data.data;
			try {

				const { lastInsertRowid: id } = events_dbRun(
					'INSERT INTO events (title, dateTime, location, enablePage) VALUES (?, ?, ?, ?)',
					newEntry.title,
					newEntry.dateTime,
					newEntry.location,
					newEntry.enablePage
						? 1
						: 0
				);

				if (newEntry.enablePage) {

					if (!await events_createPage(id)) {

						throw new Error();

					}

				}

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'events/remove': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const { id } = parsedBody.data;
			try {

				events_dbRun(
					'DELETE FROM events WHERE id=?',
					id
				);

				const filePath = path.join(
					EventsConfig.pagesPath,
					`${id}.md`
				);
				if (existsSync(filePath)) {

					rmSync(filePath);

				}

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

			const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
			return new Response(
				JSON.stringify(responseBody),
				{ status: 200 }
			);

		}
		case 'events/get': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}
			const { id } = parsedBody.data;

			try {

				const filePath = path.join(
					EventsConfig.pagesPath,
					`${id}.md`
				);
				if (!existsSync(filePath)) {

					const errorBody = TProtectedPostApiResponseMap[requestType].safeParse({ error: 'not-found' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 404 }
					);

				}

				const fileContent = readFileSync(
					filePath,
					{ encoding: 'utf8' }
				);

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: fileContent
				});
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'events/save': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			try {

				const {
					id, data: fileContent
				} = parsedBody.data;

				const filePath = path.join(
					EventsConfig.pagesPath,
					`${id}.md`
				);
				if (!existsSync(filePath)) {

					const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 400 }
					);

				}

				writeFileSync(
					filePath,
					fileContent
				);
				const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'events/edit': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const {
				id, data
			} = parsedBody.data;

			try {

				const result = events_dbGet(
					'SELECT * FROM events WHERE id=?',
					id
				);
				const parsedResult = ZEventsEntry.safeParse(result);
				if (!parsedResult.success) {

					const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 400 }
					);

				}

				events_dbRun(
					'UPDATE events SET title=?, dateTime=?, location=?, enablePage=? WHERE id=?',
					data.title,
					data.dateTime,
					data.location,
					data.enablePage
						? 1
						: 0,
					id
				);

				if (
					data.enablePage
					&& !readdirSync(EventsConfig.pagesPath).some((v) => v === `${id}.md`)
				) {

					if (!await events_createPage(id)) {

						throw new Error();

					}

				}

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}

		case 'blog/index': {

			try {

				const files = readdirSync(
					BlogConfig.pagesPath,
					{
						recursive: false,
						withFileTypes: true
					}
				);

				const entries = files
					.filter((e) => e.isFile() && e.name.endsWith('.md'))
					.map((e) => e.name);

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: entries
				});
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'blog/get': {

			try {

				const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
				if (!parsedBody.success) {

					const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 400 }
					);

				}

				const fileName = parsedBody.data.fileName;

				const filePath = path.join(
					BlogConfig.pagesPath,
					fileName
				);
				if (!existsSync(filePath)) {

					const errorBody = TProtectedPostApiResponseMap[requestType].safeParse({ error: 'not-found' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 404 }
					);

				}

				const fileContent = readFileSync(
					filePath,
					{ encoding: 'utf8' }
				);

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: fileContent
				});
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(responseBody),
					{ status: 500 }
				);

			}

		}
		case 'blog/save': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const {
				fileName,
				data: fileContent
			} = parsedBody.data;

			const filePath = path.join(
				BlogConfig.pagesPath,
				fileName
			);
			if (!existsSync(filePath)) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			writeFileSync(
				filePath,
				fileContent
			);
			const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
			return new Response(
				JSON.stringify(responseBody),
				{ status: 200 }
			);

		}
		case 'blog/new': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const { fileName } = parsedBody.data;

			const existingFiles = readdirSync(
				BlogConfig.pagesPath,
				{ withFileTypes: true }
			);
			const existing = existingFiles.map((e) => e.name);

			if (existing.find((e) => e === fileName)) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 409 }
				);

			}

			const result: boolean = await new Promise((
				resolve,
				reject
			) => {

				try {

					const child = spawn(
						'node',
						[
							'./scripts/createPost',
							fileName
						],
						{ shell: true }
					);

					child.on(
						'error',
						reject
					); // spawn failed (e.g. command not found)

					child.on(
						'close',
						(code) => {

							resolve(code === 0);

						}
					);

				} catch(e: any) {

					// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
					reject(e);

				}

			});

			if (result) {

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} else {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'blog/remove': {

			const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
			if (!parsedBody.success) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const { fileName } = parsedBody.data;

			const filePath = path.join(
				BlogConfig.pagesPath,
				fileName
			);
			if (!existsSync(filePath)) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-filename' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			const files = readdirSync(
				BlogConfig.pagesPath,
				{
					recursive: false,
					withFileTypes: true
				}
			);

			if (!files
				.map((e) => e.name)
				.find((e) => e === fileName)
			) {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-filename' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 400 }
				);

			}

			rmSync(filePath);

			const responseBody = TProtectedPostApiResponseMap[requestType].parse({ message: 'success' });
			return new Response(
				JSON.stringify(responseBody),
				{ status: 200 }
			);

		}

		case 'builds/index': {

			try {

				const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
				if (!parsedBody.success) {

					const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 400 }
					);

				}

				const result = errors_getRecentBuilds(parsedBody.data.count);

				const countResult = errors_getBuildCount();

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					count: countResult,
					data: result
				});
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'builds/get': {

			try {

				const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
				if (!parsedBody.success) {

					const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 400 }
					);

				}

				const result = errors_dbGetBuild(
					'SELECT * FROM builds WHERE buildNumber=?',
					parsedBody.data.buildNumber
				);

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: result
				});
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}
		case 'builds/remove': {

			try {

				const parsedBody = ZProtectedPostApiRequestMap[requestType].safeParse(body);
				if (!parsedBody.success) {

					const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'bad-request' });
					return new Response(
						JSON.stringify(errorBody),
						{ status: 400 }
					);

				}

				const result = errors_dbRun(
					'DELETE FROM builds WHERE buildNumber=?',
					parsedBody.data.buildNumber
				);

				const responseBody = TProtectedPostApiResponseMap[requestType].parse({
					message: 'success',
					data: result
				});
				return new Response(
					JSON.stringify(responseBody),
					{ status: 200 }
				);

			} catch {

				const errorBody = TProtectedPostApiResponseMap[requestType].parse({ error: 'server-error' });
				return new Response(
					JSON.stringify(errorBody),
					{ status: 500 }
				);

			}

		}

		default: {

			const errorBody = ZApiResponse.parse({ error: 'bad-request-type' });
			return new Response(
				JSON.stringify(errorBody),
				{ status: 400 }
			);

		}

	}

}
