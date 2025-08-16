import { z } from 'zod';

export const ZBlogConfig = z.object({
	pagesPath: z
		.string()
		.nonempty()
});
export type TBlogConfig = z.infer<typeof ZBlogConfig>;

export const ZContactConfig = z.object({
	dbPath: z
		.string()
		.nonempty()
});
export type TContactConfig = z.infer<typeof ZContactConfig>;

export const ZEventsConfig = z.object({
	dbPath: z
		.string()
		.nonempty(),
	pagesPath: z
		.string()
		.nonempty()
});
export type TEventsConfig = z.infer<typeof ZEventsConfig>;
