import { z } from 'zod';

export const GlobalTranslation = {
	siteName: 'Maxwell Max Maxunwell',
	author: 'Maxwell Max Maxunwell'
};

export const ZTranslation = z.object({
	meta: z.object({
		title: z.string(),
		description: z.string()
	}),
	navbar: z.object({
		title: z.string(),
		homepage: z.string(),
		events: z.string(),
		others: z.string(),
		blog: z.string(),
		contact: z.string()
	}),
	footer: z.object({
		admin: z.string(),
		siteInfo: z.string()
	}),
	fourOfour: z.object({
		title: z.string(),
		description: z.string(),
		button: z.string()
	}),
	heroAvatar: z.object({
		title: z.string(),
		description: z.string()
	}),
	card1: z.object({
		title: z.string(),
		description: z.string(),
		buttonText: z.string()
	}),
	card2: z.object({
		title: z.string(),
		description: z.string(),
		buttonText: z.string()
	}),
	contact: z.object({
		title: z.string(),
		formDescription: z.string(),
		email: z.string(),
		phoneNumber: z.string(),
		firstName: z.string(),
		lastName: z.string(),
		message: z.string(),
		submit: z.string(),
		feedback: z.object({
			noError: z.string(),
			resendError: z.string(),
			nameError: z.string(),
			emailError: z.string(),
			phoneNumberError: z.string(),
			messageError: z.string(),
			sendingError: z.string(),
			duplicateError: z.string()
		})
	}),
	siteInfo: z.object({
		title: z.string(),
		madeUsing: z
			.string()
			.array(),
		basedOn: z
			.string()
			.array(),
		madeBy: z
			.string()
			.array()
	}),
	blog: z.object({
		title: z.string(),
		description: z.string(),
		recentPosts: z.string(),
		gotoBlogButton: z.string()
	}),
	pagination: z.object({ pageWord: z.string() }),
	others: z.object({
		title: z.string(),
		description: z.string(),
		card1: z.object({
			title: z.string(),
			description: z.string()
		}),
		card2: z.object({
			title: z.string(),
			description: z.string()
		}),
		card3: z.object({
			title: z.string(),
			description: z.string()
		}),
		card4: z.object({
			title: z.string(),
			points: z
				.string()
				.array()
		})
	}),
	events: z.object({
		title: z.string(),
		description: z.string(),
		dateRow: z.string(),
		locationRow: z.string(),
		titleRow: z.string()
	}),
	sizeError: z.object({
		body: z.string(),
		ignoreButton: z.string()
	}),
	offline: z.object({
		title: z.string(),
		description: z.string(),
		body: z.string()
	}),
	fourTwentyNine: z.object({
		title: z.string(),
		description: z.string(),
		body: z.string(),
		reloadIn: z
			.string()
			.array()
			.length(2),
		reloadInUnknown: z.string(),
		shouldReload: z.string()
	})
});
export type ITranslation = z.infer<typeof ZTranslation>;
