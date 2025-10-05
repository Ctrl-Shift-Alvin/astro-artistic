import { ZCaptchaConfig } from './configTypes';

export const CaptchaConfig = ZCaptchaConfig.parse({
	tokenExpiryMs: 10 * 60 * 1000,
	maxTokenCount: 10000,
	maxTriesPerToken: 5,
	tokenCleanupIntervalMs: 30 * 60 * 1000
});
