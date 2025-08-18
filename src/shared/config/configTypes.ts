import { z } from 'zod';

// #region Contact Config

export const ZContact = z.object({
	email: z.email(),
	telNumber: z.preprocess(
		(val) => (
			typeof val === 'string'
				? val.replaceAll(
					' ',
					''
				)
				: val
		),
		z.e164()
	),
	defaultNumberCode: z
		.string()
		.max(2)
});
export type TContact = z.infer<typeof ZContact>;

export const ZContactConfig = z.object({
	contacts: z
		.record(
			z.string(),
			ZContact
		)
		.refine(
			(val) => 'default' in val,
			{ message: 'Key \'default\' is required in contacts' }
		)

});
export type TContactConfig = z.infer<typeof ZContactConfig>;

// #endregion

// #region Blog Config

export const ZBlogConfig = z.object({
	title: z.string(),
	description: z.string(),
	pageSize: z.number(),
	recentBlogsCard: z.object({
		title: z.string(),
		gotoBlogButton: z.string(),
		maxCardCount: z.number()
	})
});
export type TBlogConfig = z.infer<typeof ZBlogConfig>;

// #endregion

// #region Dialog Config

export const ZDialogConfig = z.object({
	closeOnBackdropClick: z.boolean(),
	closeOnButtonClick: z.boolean()
});
export type TDialogConfig = z.infer<typeof ZDialogConfig>;

// #endregion

// #region Events Config

export const ZEventsConfig = z.object({
	showLinks: z.boolean(),
	ageRangeShown: z.object({
		minDays: z.number(),
		maxDays: z.number()
	}),
	pagesPath: z.string()
});
export type TEventsConfig = z.infer<typeof ZEventsConfig>;

// #endregion

// #region Hero Config

export const ZHeroSocialButton = z.object({
	href: z.string(),
	imageSource: z.string(),
	imageAlt: z.string()
});
export type THeroSocialButton = z.infer<typeof ZHeroSocialButton>;

export const ZHeroConfig = z.object({
	title: z.string(),
	description: z.string(),
	avatarImageSource: z.string(),
	heroSocialButtons: ZHeroSocialButton.array()
});
export type THeroConfig = z.infer<typeof ZHeroConfig>;

// #endregion

// #region Navbar Config

export const ZNavbarItem = z.object({
	name: z.string(),
	href: z.string()
});
export type TNavbarItem = z.infer<typeof ZNavbarItem>;

export const ZNavbarConfig = ZNavbarItem.array();
export type TNavbarConfig = z.infer<typeof ZNavbarConfig>;

// #endregion
