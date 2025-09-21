import { z } from 'zod';

// #region API General

export const ZApiResponseSuccess = z.object({ message: z.string() });
export type TApiResponseSuccess = z.infer<typeof ZApiResponseSuccess>;

export const ZApiResponseError = z.object({
	error: z.string(),
	message: z
		.string()
		.optional()
});
export type TApiResponseError = z.infer<typeof ZApiResponseError>;

export const ZApiResponse = z.union([
	ZApiResponseSuccess,
	ZApiResponseError
]);
export type TApiResponse = z.infer<typeof ZApiResponse>;

export const ZStatusCode = z
	.int()
	.min(100)
	.max(599);
export type TStatusCode = z.infer<typeof ZStatusCode>;

export const ZStatusArray = z.array(ZStatusCode);
export type TStatusArray = z.infer<typeof ZStatusArray>;

// #endregion

// #region Blog API

export interface IBlogFrontmatter {
	title: string;
	description: string;
	pubDate: string;
	imgSrc: string;
	imgAlt: string;
	draft: boolean;
}
export interface IBlogMarkdownInstance<T extends Record<string, any>> {
	url: string;
	frontmatter: IBlogFrontmatter & T;
	content: string;
}

// #endregion

// #region Events

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
export type TEventEntry = z.infer<typeof ZEventEntry>;

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
export type TNewEventEntry = z.infer<typeof ZNewEventEntry>;

export interface IEventFrontmatter { id: number }
export interface IEventMarkdownInstance<T extends Record<string, any>> {
	url: string;
	frontmatter: IEventFrontmatter & T;
	content: string;
}

// #endregion

// #region Contact API

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
export type TContactFormSubmission = z.infer<typeof ZContactFormSubmission>;

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
export type TContactFormEntry = z.infer<typeof ZContactFormEntry>;

export const ZContactApiRequest = z.object({ data: ZContactFormSubmission });
export type TContactApiRequest = z.infer<typeof ZContactApiRequest>;

export const ZContactApiResponse = ZApiResponse;
export type TContactApiResponse = z.infer<typeof ZContactApiResponse>;

// #endregion

// #region Errors API

export const ZBuild = z.object({
	buildNumber: z.coerce.number(),
	createdAt: z.string(),
	gitBranch: z.string(),
	gitCommit: z
		.string()
		.min(40),
	isGitDirty: z.coerce.boolean()
});
export type TBuild = z.infer<typeof ZBuild>;

export const ZError = z.object({
	id: z.coerce.number(),
	createdAt: z.string(),
	buildNumber: z.coerce.number(),
	isClient: z.coerce.boolean(),
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
export type TError = z.infer<typeof ZError>;

export const ZErrorSubmission = z.object({
	buildNumber: z.coerce.number(),
	isClient: z.coerce.boolean(),
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
export type TErrorSubmission = z.infer<typeof ZErrorSubmission>;

// #endregion

// #region Protected API

export const ZProtectedGetApiResponse = z.union([
	ZApiResponseSuccess.extend({ expiry: z.number() }),
	ZApiResponseError
]);
export type TProtectedGetApiResponse = z.infer<typeof ZProtectedGetApiResponse>;
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
	'blog/index': z.undefined(),
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

export const TProtectedPostApiResponseMap = {
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
		ZApiResponseSuccess.extend({
			data: z
				.string()
				.endsWith('.md')
				.array()
		}),
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

export const ZAuthPostApiRequest = z.object({
	password: z
		.string()
		.optional()
});
export type TAuthPostApiRequest = z.infer<typeof ZAuthPostApiRequest>;

export const ZAuthPostApiResponse = ZApiResponse;
export type TAuthPostApiResponse = z.infer<typeof ZAuthPostApiResponse>;

export const ZAuthDeleteApiResponse = ZApiResponse;
export type TAuthDeleteApiResponse = z.infer<typeof ZAuthDeleteApiResponse>;

// #endregion
