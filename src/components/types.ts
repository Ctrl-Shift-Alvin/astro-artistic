import { z } from 'zod';

// #region API General

/**
 * The body of a successful API response containing a `message` property.
 */
export const ZApiResponseSuccess = z.object({ message: z.string() });

/**
 * The body of a successful API response containing a `message` property.
 */
export type TApiResponseSuccess = z.infer<typeof ZApiResponseSuccess>;

/**
 * The body of an error API response containing an `error` and optional `message` property.
 */
export const ZApiResponseError = z.object({
	error: z.string(),
	message: z
		.string()
		.optional()
});

/**
 * The body of an error API response containing an `error` and optional `message` property.
 */
export type TApiResponseError = z.infer<typeof ZApiResponseError>;

/**
 * A union of the body of a successful and an error API response.
 */
export const ZApiResponse = z.union([
	ZApiResponseSuccess,
	ZApiResponseError
]);

/**
 * A union of a successful and an error API response.
 */
export type TApiResponse = z.infer<typeof ZApiResponse>;

/**
 * A valid status code between 100 and 599.
 */
export const ZStatusCode = z
	.int()
	.min(100)
	.max(599);

/**
 * A valid status code between 100 and 599.
 */
export type TStatusCode = z.infer<typeof ZStatusCode>;

/**
 * An array of valid status codes (`ZStatusCode`).
 */
export const ZStatusArray = z.array(ZStatusCode);

/**
 * An array of valid status codes (`TStatusCode`).
 */
export type TStatusArray = z.infer<typeof ZStatusArray>;

// #endregion

// #region Blog API

/**
 * The frontmatter of a blog post.
 */
export const ZBlogFrontmatter = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	imgSrc: z.string(),
	imgAlt: z.string(),
	draft: z
		.boolean()
		.default(false)
});

/**
 * The frontmatter of a blog post.
 */
export type TBlogFrontmatter = z.infer<typeof ZBlogFrontmatter>;

/**
 * An instace of a blog post, including its frontmatter and content.
 */
export const ZBlogMarkdownInstance = z.object({
	url: z.string(),
	fileName: z.string(),
	frontmatter: ZBlogFrontmatter,
	content: z.string()
});

/**
 * An instace of a blog post, including its frontmatter and content.
 */
export type TBlogMarkdownInstance = z.infer<typeof ZBlogMarkdownInstance>;

// #endregion

// #region Events

/**
 * An event entry. (represents a row in the events DB)
 */
export const ZEventEntry = z.object({
	id: z.coerce.number(),
	title: z
		.string()
		.nonempty(),
	dateTime: z.iso.datetime(),
	location: z
		.string()
		.nonempty(),
	enablePage: z.coerce.boolean(),
	createdAt: z.string()
});

/**
 * An event entry. (represents a row in the events DB)
 */
export type TEventEntry = z.infer<typeof ZEventEntry>;

/**
 * A to-be-added event entry. (represents the data needed, to add a new row to the events DB)
 */
export const ZNewEventEntry = z.object({
	title: z
		.string()
		.nonempty(),
	dateTime: z.iso.datetime(),
	location: z
		.string()
		.nonempty(),
	enablePage: z.boolean()
});

/**
 * A to-be-added event entry. (represents the data needed, to add a new row to the events DB)
 */
export type TNewEventEntry = z.infer<typeof ZNewEventEntry>;

/**
 * The frontmatter of an event page.
 */
export interface IEventFrontmatter { id: number }

/**
 * An instace of an event page, including its frontmatter and content.
 */
export interface IEventMarkdownInstance<T extends Record<string, any>> {
	url: string;
	frontmatter: IEventFrontmatter & T;
	content: string;
}

// #endregion

// #region Contact API

/**
 * A contact form submission. (represents a row to be added to the contact form submissions DB)
 */
export const ZContactFormSubmission = z.object({
	firstName: z.string(),
	lastName: z.string(),
	email: z.email(),
	phoneNumber: z.preprocess(
		(val) => (
			typeof val === 'string'
				? val.replaceAll(
					' ',
					''
				)
				: val),
		z.e164()
	),
	message: z
		.string()
		.nullish()
});

/**
 * A contact form submission. (represents a row to be added to the contact form submissions DB)
 */
export type TContactFormSubmission = z.infer<typeof ZContactFormSubmission>;

/**
 * A contact form submission entry. (represents a row in the contact form submissions DB)
 */
export const ZContactFormEntry = z.object({
	id: z.coerce.number(),
	createdAt: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.email(),
	phoneNumber: z.preprocess(
		(val) => (
			typeof val === 'string'
				? val.replaceAll(
					' ',
					''
				)
				: val),
		z.e164()
	),
	message: z
		.string()
		.optional()
});

/**
 * A contact form submission entry. (represents a row in the contact form submissions DB)
 */
export type TContactFormEntry = z.infer<typeof ZContactFormEntry>;

/**
 * The body of a contact API request.
 */
export const ZContactApiRequest = z.object({ data: ZContactFormSubmission });

/**
 * The body of a contact API request.
 */
export type TContactApiRequest = z.infer<typeof ZContactApiRequest>;

/**
 * The body of a contact API response.
 */
export const ZContactApiResponse = ZApiResponse;

/**
 * The body of a contact API response.
 */
export type TContactApiResponse = z.infer<typeof ZContactApiResponse>;

// #endregion

// #region Errors API

/**
 * A build entry. (represents a row in the builds DB)
 */
export const ZBuild = z.object({
	buildNumber: z.coerce.number(),
	createdAt: z.string(),
	gitBranch: z.string(),
	gitCommit: z
		.string()
		.min(40),
	isGitDirty: z.coerce.boolean()
});

/**
 * A build entry. (represents a row in the builds DB)
 */
export type TBuild = z.infer<typeof ZBuild>;

/**
 * An error entry. (represents a row in the errors DB)
 */
export const ZError = z.object({
	id: z.coerce.number(),
	createdAt: z.string(),
	buildNumber: z.coerce.number(),
	isClient: z.coerce.boolean(),
	url: z
		.string()
		.nonempty(),
	status: ZStatusCode.nullish(),
	statusText: z
		.string()
		.nullish(),
	errorMessage: z
		.string()
		.nullish(),
	errorCause: z
		.string()
		.nullish(),
	errorStack: z
		.string()
		.nullish()
});

/**
 * An error entry. (represents a row in the errors DB)
 */
export type TError = z.infer<typeof ZError>;

/**
 * An error submission. (represents a row to be added to the errors DB)
 */
export const ZErrorSubmission = z.object({
	buildNumber: z.coerce.number(),
	isClient: z.coerce.boolean(),
	url: z
		.string()
		.nonempty(),
	status: ZStatusCode.nullish(),
	statusText: z
		.string()
		.nullish(),
	errorMessage: z
		.string()
		.nullish(),
	errorCause: z
		.string()
		.nullish(),
	errorStack: z
		.string()
		.nullish()
});

/**
 * An error submission. (represents a row to be added to the errors DB)
 */
export type TErrorSubmission = z.infer<typeof ZErrorSubmission>;

/**
 * The body of an error submission API request.
 */
export const ZErrorApiRequest = z.object({ data: ZErrorSubmission });

/**
 * The body of an error submission API request.
 */
export type TErrorApiRequest = z.infer<typeof ZErrorApiRequest>;

/**
 * The body of an error submission API response.
 */
export const ZErrorApiResponse = ZApiResponse;

/**
 * The body of an error submission API response.
 */
export type TErrorApiResponse = z.infer<typeof ZErrorApiResponse>;

// #endregion

// #region Protected API

/**
 * The body of a protected API GET response.
 */
export const ZProtectedGetApiResponse = z.union([
	ZApiResponseSuccess.extend({ expiry: z.number() }),
	ZApiResponseError
]);

/**
 * The body of a protected API GET response.
 */
export type TProtectedGetApiResponse = z.infer<typeof ZProtectedGetApiResponse>;

/**
 * A map of the body of a protected API POST request, based on the request type.
 */
export const ZProtectedPostApiRequestMap = {
	'contact/index': z.object({
		count: z.coerce.number(),
		offset: z.coerce
			.number()
			.optional()
	}),
	'contact/count': z.undefined(),
	'contact/get': z.object({
		id: z
			.coerce
			.number()
			.positive()
	}),
	'contact/delete': z.object({
		id: z
			.coerce
			.number()
			.positive()
	}),
	'events/index': z.undefined(),
	'events/add': z.object({ data: ZNewEventEntry }),
	'events/delete': z.object({
		id: z
			.coerce
			.number()
			.positive()
	}),
	'events/get': z.object({
		id: z.coerce
			.number()
			.positive()
	}),
	'events/save': z.object({
		id: z.coerce
			.number()
			.positive(),
		data: z.string()
	}),
	'events/edit': z.object({
		id: z.coerce
			.number()
			.positive(),
		data: ZNewEventEntry
	}),
	'blog/index': z.object({
		count: z.coerce.number(),
		offset: z.coerce
			.number()
			.optional()
	}),
	'blog/count': z.undefined(),
	'blog/get': z.object({
		fileName: z
			.string()
			.nonempty()
			.transform((val) => (
				val.endsWith('.md')
					? val
					: `${val}.md`
			))
	}),
	'blog/save': z.object({
		fileName: z
			.string()
			.nonempty()
			.endsWith('.md'),
		data: z.string()
	}),
	'blog/new': z.object({
		fileName: z
			.string()
			.nonempty()
			.regex(/^[a-zA-Z0-9_-]+(\.md)?$/)
			.transform((val) => (
				val.endsWith('.md')
					? val
					: `${val}.md`
			))
	}),
	'blog/remove': z.object({
		fileName: z
			.string()
			.nonempty()
			.endsWith('.md')
	}),
	'builds/index': z.object({
		count: z.coerce.number(),
		offset: z.coerce
			.number()
			.optional()
	}),
	'builds/count': z.undefined(),
	'builds/get': z.object({ buildNumber: z.coerce.number() }),
	'builds/delete': z.object({ buildNumber: z.coerce.number() }),
	'errors/index': z.object({
		count: z.coerce.number(),
		offset: z.coerce
			.number()
			.optional()
	}),
	'errors/count': z.undefined(),
	'errors/indexBuild': z.object({
		buildNumber: z.coerce.number(),
		count: z.coerce.number(),
		offset: z.coerce
			.number()
			.optional()
	}),
	'errors/countBuild': z.object({ buildNumber: z.coerce.number() }),
	'errors/get': z.object({ id: z.coerce.number() }),
	'errors/delete': z.object({ id: z.coerce.number() })
} as const;

/**
 * A map of the body of a protected API POST response, based on the request type.
 */
export const ZProtectedPostApiResponseMap = {
	'contact/index': z.union([
		ZApiResponseSuccess.extend({ data: ZContactFormEntry.array() }),
		ZApiResponseError
	]),
	'contact/count': z.union([
		ZApiResponseSuccess.extend({ count: z.coerce.number() }),
		ZApiResponseError
	]),
	'contact/get': z.union([
		ZApiResponseSuccess.extend({ data: ZContactFormEntry }),
		ZApiResponseError
	]),
	'contact/delete': ZApiResponse,
	'events/index': z.union([
		ZApiResponseSuccess.extend({ data: ZEventEntry.array() }),
		ZApiResponseError
	]),
	'events/add': ZApiResponse,
	'events/delete': ZApiResponse,
	'events/get': z.union([
		ZApiResponseSuccess.extend({
			data: ZEventEntry,
			file: z
				.string()
				.optional()
		}),
		ZApiResponseError
	]),
	'events/save': ZApiResponse,
	'events/edit': ZApiResponse,
	'blog/index': z.union([
		ZApiResponseSuccess.extend({ data: ZBlogMarkdownInstance.array() }),
		ZApiResponseError
	]),
	'blog/count': z.union([
		ZApiResponseSuccess.extend({ count: z.coerce.number() }),
		ZApiResponseError
	]),
	'blog/get': z.union([
		ZApiResponseSuccess.extend({ data: z.string() }),
		ZApiResponseError
	]),
	'blog/save': ZApiResponse,
	'blog/new': ZApiResponse,
	'blog/remove': ZApiResponse,
	'builds/index': z.union([
		ZApiResponseSuccess.extend({ data: ZBuild.array() }),
		ZApiResponseError
	]),
	'builds/count': z.union([
		ZApiResponseSuccess.extend({ count: z.coerce.number() }),
		ZApiResponseError
	]),
	'builds/get': z.union([
		ZApiResponseSuccess.extend({ data: ZBuild }),
		ZApiResponseError
	]),
	'builds/delete': ZApiResponse,
	'errors/index': z.union([
		ZApiResponseSuccess.extend({ data: ZError.array() }),
		ZApiResponseError
	]),
	'errors/count': z.union([
		ZApiResponseSuccess.extend({ count: z.coerce.number() }),
		ZApiResponseError
	]),
	'errors/indexBuild': z.union([
		ZApiResponseSuccess.extend({ data: ZError.array() }),
		ZApiResponseError
	]),
	'errors/countBuild': z.union([
		ZApiResponseSuccess.extend({ count: z.coerce.number() }),
		ZApiResponseError
	]),
	'errors/get': z.union([
		ZApiResponseSuccess.extend({ data: ZError }),
		ZApiResponseError
	]),
	'errors/delete': ZApiResponse
} as const;

// #endregion

// #region Auth API

/**
 * The body of an auth API POST request.
 */
export const ZAuthPostApiRequest = z.object({
	password: z
		.string()
		.optional()
});

/**
 * The body of an auth API POST request.
 */
export type TAuthPostApiRequest = z.infer<typeof ZAuthPostApiRequest>;

/**
 * The body of an auth API POST response.
 */
export const ZAuthPostApiResponse = ZApiResponse;

/**
 * The body of an auth API POST response.
 */
export type TAuthPostApiResponse = z.infer<typeof ZAuthPostApiResponse>;

/**
 * The body of an auth API DELETE response.
 */
export const ZAuthDeleteApiResponse = ZApiResponse;

/**
 * The body of an auth API DELETE response.
 */
export type TAuthDeleteApiResponse = z.infer<typeof ZAuthDeleteApiResponse>;

// #endregion

// #region Captcha API

export const ZCaptchaResponse = z.object({
	id: z
		.string()
		.nonempty(),
	svgData: z
		.string()
		.nonempty()
});

// #endregion

/**
 * A subscription emitter.
 */
export class Emitter<T> {

	private listener: ((value: T)=> void) | null = null;

	subscribe(l: (value: T)=> void) {

		this.listener = l;

	}

	unsubscribe() {

		this.listener = null;

	}

	emit(value: T) {

		this.listener?.(value);

	}

}

/**
 * A subscription emitter that allows multiple listeners.
 */
export class MultiEmitter<T> {

	private nextId = 0;

	private listeners: ({
		callback: (value: T)=> void;
		id: number;
	})[] = [];

	/**
	 * Add a new subscriber to the emitter instance.
	 * @param l The listener callback.
	 * @returns The unique listener ID number. Use it to unsubscribe.
	 */
	subscribe(l: (value: T)=> void): number {

		const id = this.nextId++;
		this.listeners.push({
			callback: l,
			id
		});
		return id;

	}

	/**
	 * Unsubscribe a existing subscriber with an ID.
	 *
	 * @param id The ID number returned by the earlier `subscribe()` call.
	 */
	unsubscribe(id: number) {

		this.listeners = this.listeners.filter((l) => l.id !== id);

	}

	/**
	 * Emit a value to all current subscribers.
	 */
	emit(value: T) {

		// Iterate over a copy in case a listener unsubscribes itself during the emit.
		this.listeners
			.slice()
			.forEach((l) => {

				l.callback(value);

			});

	}

}
