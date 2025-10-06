import { z } from 'zod';
import { ZStatusArray } from '@/components/types';

export const ZBlogConfig = z.object({

	/** The absolute path to the blog pages directory. */
	pagesPath: z
		.string()
		.nonempty()
});
export type TBlogConfig = z.infer<typeof ZBlogConfig>;

export const ZContactConfig = z.object({

	/** The absolute path to the contact submissions database. */
	dbPath: z
		.string()
		.nonempty()
});
export type TContactConfig = z.infer<typeof ZContactConfig>;

export const ZEventsConfig = z.object({

	/** The absolute path to the events database. */
	dbPath: z
		.string()
		.nonempty(),

	/** The absolute path to the events pages directory. Must be somewhere inside `@/pages/`! */
	pagesPath: z
		.string()
		.nonempty()
});
export type TEventsConfig = z.infer<typeof ZEventsConfig>;

export const ZErrorsConfig = z.object({

	/**
	 * The absolute path to the errors database.
	 */
	dbPath: z
		.string()
		.nonempty(),

	/**
	 * Enable error response logging on the server.
	 */
	enableResponseLogging: z.boolean(),

	/**
	 * Only relevant when `enableResponseLogging` is `true`. An array of status codes for which responses to save.
	 */
	responseLoggingStatusCodes: ZStatusArray

});
export type TErrorsConfig = z.infer<typeof ZErrorsConfig>;
