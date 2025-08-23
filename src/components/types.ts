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

export const ZEventsEntry = z.object({
	id: z.coerce.number(),
	title: z.string(),
	dateTime: z.iso.datetime(),
	location: z.string(),
	enablePage: z.coerce.boolean(),
	createdAt: z.string()
});
export type TEventsEntry = z.infer<typeof ZEventsEntry>;

export const ZNewEventsEntry = z.object({
	title: z.string(),
	dateTime: z.iso.datetime(),
	location: z.string(),
	enablePage: z.boolean()
});
export type TNewEventsEntry = z.infer<typeof ZNewEventsEntry>;

export interface IEventsFrontmatter { id: number }
export interface IEventsMarkdownInstance<T extends Record<string, any>> {
	url: string;
	frontmatter: IEventsFrontmatter & T;
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
		.optional()
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

export const ZFormSubmissionApiRequest = z.object({ data: ZContactFormSubmission });
export type TFormSubmissionApiRequest = z.infer<typeof ZFormSubmissionApiRequest>;

export const ZFormSubmissionApiResponse = ZApiResponse;
export type TFormSubmissionApiResponse = z.infer<typeof ZFormSubmissionApiResponse>;

// #endregion

// #region Protected API

export const ZProtectedGetApiResponse = z.union([
	ZApiResponseSuccess.extend({ expiry: z.number() }),
	ZApiResponseError
]);
export type TProtectedGetApiResponse = z.infer<typeof ZProtectedGetApiResponse>;
export const ZProtectedPostApiRequestMap = {
	'forms/index': z.undefined(),
	'forms/get': z.object({
		id: z
			.coerce
			.number()
			.positive()
	}),
	'forms/remove': z.object({
		id: z
			.coerce
			.number()
			.positive()
	}),
	'events/index': z.undefined(),
	'events/add': z.object({ data: ZNewEventsEntry }),
	'events/remove': z.object({
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
		data: ZNewEventsEntry
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
	})
} as const;

export const TProtectedPostApiResponseMap = {
	'forms/index': z.union([
		ZApiResponseSuccess.extend({ data: ZContactFormEntry.array() }),
		ZApiResponseError
	]),
	'forms/get': z.union([
		ZApiResponseSuccess.extend({ data: ZContactFormEntry }),
		ZApiResponseError
	]),
	'forms/remove': ZApiResponse,
	'events/index': z.union([
		ZApiResponseSuccess.extend({ data: ZEventsEntry.array() }),
		ZApiResponseError
	]),
	'events/add': ZApiResponse,
	'events/remove': ZApiResponse,
	'events/get': z.union([
		ZApiResponseSuccess.extend({ data: z.string() }),
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
	'blog/remove': ZApiResponse
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
