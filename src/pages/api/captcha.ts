import { randomUUID } from 'node:crypto';
import svgCaptcha from 'svg-captcha';
import {
	ZCaptchaResponse,
	ZErrorApiResponse
} from '@/components/types';
import { CaptchaConfig } from '@/shared/config/captcha';

/**
 * In-memory store for captcha challenges. A new Map is created on each server start.
 */
export const captchaStore = new Map<string, {
	text: string;
	expires: number;
	tries: number;
}>();

/**
 * Verify a captcha entry by its ID with a text to verify.
 * @param id The ID of the captcha instance.
 * @param text The text to verify.
 * @returns `false` if the ID doesn't exist, the entry has expired, or the text is incorrect. Otherwise, `true`.
 */
export const verifyCaptcha = (
	id: string,
	text: string
): boolean => {

	const result = captchaStore.get(id);

	if (!result) {

		return false;

	}
	if (result.expires < Date.now()) {

		captchaStore.delete(id);
		return false;

	}
	if (result.text !== text) {

		result.tries++;
		if (result.tries >= CaptchaConfig.maxTriesPerToken) {

			captchaStore.delete(id);

		}
		return false;

	}

	captchaStore.delete(id);
	return true;

};

const cleanupExpiredCaptchas = () => {

	for (const [
		id,
		{ expires }
	] of captchaStore.entries()) {

		if (expires < Date.now()) {

			captchaStore.delete(id);

		}

	}

};

setInterval(
	cleanupExpiredCaptchas,
	CaptchaConfig.tokenCleanupIntervalMs
);

export const GET = () => {

	try {

		if (captchaStore.size >= CaptchaConfig.maxTokenCount) {

			const errorResponse = ZErrorApiResponse.parse({ error: 'too-many-requests' });
			return new Response(
				JSON.stringify(errorResponse),
				{ status: 429 }
			);

		}

		const captcha = svgCaptcha.create({
			noise: 2,
			color: true,
			background: '#f4f4f4'
		});

		const id = randomUUID();
		const expires = Date.now() + CaptchaConfig.tokenExpiryMs;

		// Store the captcha with a unique ID
		captchaStore.set(
			id,
			{
				text: captcha.text,
				expires,
				tries: 0
			}
		);

		const response = ZCaptchaResponse.parse({
			id,
			svgData: captcha.data
		});
		return new Response(
			JSON.stringify(response),
			{ status: 200 }
		);

	} catch {

		const errorResponse = ZErrorApiResponse.parse({ error: 'server-error' });
		return new Response(
			JSON.stringify(errorResponse),
			{ status: 500 }
		);

	}

};
