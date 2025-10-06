import { z } from 'zod';

// #region Contact Config

/**
 * A single contact for a contact card component.
 */
export const ZContact = z.object({
	description: z
		.string()
		.optional(),
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

	/**
	 * The default number code to prefix if it's omitted.
	 */
	defaultNumberCode: z
		.string()
		.max(2)
});

/**
 * A single contact for a contact card component.
 */
export type TContact = z.infer<typeof ZContact>;

export const ZContactConfig = z.object({

	/**
	 * For the admin page only: The initial entry count to be showed in the contact submission table.
	 */
	tableInitialEntryCount: z
		.number()
		.default(5),

	/**
	 * A record of contacts that a contact card can use. The key `default` is required.
	 */
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

	/**
	 * The blog entry count per page. Recommended to use a multiple of 3, though it's not enforced.
	 */
	pageSize: z.number(),

	/**
	 * The maximum number of cards in the `Recent Blogs` component.
	 */
	maxRecentCardCount: z.number(),

	/**
	 * For the admin page only: The initial entry count to be showed in the blog entry table.
	 */
	tableInitialEntryCount: z
		.number()
		.default(5)
});
export type TBlogConfig = z.infer<typeof ZBlogConfig>;

// #endregion

// #region Dialog Config

export const ZDialogConfig = z.object({

	/**
	 * Close a dialog if the backdrop is clicked.
	 */
	closeOnBackdropClick: z.boolean(),

	/**
	 * Close a dialog by default if the 'Cancel' button is clicked.
	 */
	closeOnButtonClick: z.boolean()
});
export type TDialogConfig = z.infer<typeof ZDialogConfig>;

// #endregion

// #region Events Config

export const ZEventsConfig = z.object({

	/**
	 * Create and show an href for event entries that have a page.
	 */
	showLinks: z.boolean(),

	/**
	 * The range of events shown from today's date.
	 */
	ageRangeShown: z.object({

		/**
		 * Can be `Number.MIN_SAFE_INTEGER` to show all past entries. Should be negative, but it's not enforced.
		 */
		minDays: z.number(),

		/**
		 * Can be `Number.MAX_SAFE_INTEGER` to show all future entries. Should be positive, but it's not enforced.
		 */
		maxDays: z.number()
	})

});
export type TEventsConfig = z.infer<typeof ZEventsConfig>;

// #endregion

// #region Hero Config

/**
 * The properties of a single social button on the Hero card.
 */
export const ZHeroSocialButton = z.object({
	href: z.string(),
	imageSource: z.string(),
	imageAlt: z.string()
});

/**
 * The properties of a single social button on the Hero card.
 */
export type THeroSocialButton = z.infer<typeof ZHeroSocialButton>;

export const ZHeroConfig = z.object({
	avatarImageSource: z.string(),
	heroSocialButtons: ZHeroSocialButton.array()
});
export type THeroConfig = z.infer<typeof ZHeroConfig>;

// #endregion

// #region Navbar Config

/**
 * A single navbar button.
 */
export const ZNavbarItem = z.object({
	name: z.string(),
	href: z.string()
});

/**
 * A single navbar button.
 */
export type TNavbarItem = z.infer<typeof ZNavbarItem>;

export const ZNavbarConfig = z.object({ items: ZNavbarItem.array() });
export type TNavbarConfig = z.infer<typeof ZNavbarConfig>;

// #endregion

// #region Errors Config

export const ZErrorsConfig = z.object({

	/**
	 * Enable client sending JS errors to the errors API.
	 */
	enableJsLogging: z.boolean(),

	/**
	 * For the admin page only: The initial entry count to be showed in the build table.
	 */
	tableInitialBuildCount: z
		.number()
		.default(5),

	/**
	 * For the admin page only: The initial entry count to be showed in the error table.
	 */
	tableInitialErrorCount: z
		.number()
		.default(5)
});

// #endregion

// #region Captcha Config

export const ZCaptchaConfig = z.object({
	tokenExpiryMs: z.number(),
	maxTokenCount: z.number(),
	maxTriesPerToken: z.number(),
	tokenCleanupIntervalMs: z.number()
});

// #endregion

// #region Time Config

export const ZTimeZone = z
	.string()
	.refine(
		(val) => Intl
			.supportedValuesOf('timeZone')
			.includes(val),
		{ message: 'Invalid timezone' }
	);

export const ZTimeConfig = z.object({
	defaultTimezone: ZTimeZone
		.optional()
		.default('UTC')
});

// #endregion
