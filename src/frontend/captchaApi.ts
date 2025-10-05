import {
	lsGetCurrentCaptcha,
	lsGetCurrentCaptchaAttempts,
	lsSetCurrentCaptcha,
	lsSetCurrentCaptchaAttempts
} from './localStorage';
import { CaptchaConfig } from '@/shared/config/captcha';
import {
	MultiEmitter,
	ZCaptchaResponse
} from '@/components/types';

interface ICaptcha {
	id: string;
	svgData: string;
}

/**
 * Emits every time a new captcha token is fetched.
 */
export const captchaChangeEmitter = new MultiEmitter<void>();

/**
 * Fetch a new captcha token from the captcha API and store it in local storage.
 *
 * @returns The newly fetched and stored captcha token.
 */
export const fetchNewCaptcha = async(): Promise<ICaptcha | null> => {

	const response = await fetch(
		'/api/captcha/',
		{
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		}
	);

	const parsedResponse = await ZCaptchaResponse.safeParseAsync(await response.json());
	if (!parsedResponse.success) {

		console.error('Failed to fetch a captcha try from the API!');
		return null;

	}

	lsSetCurrentCaptcha({
		...parsedResponse.data,
		expiry: Date.now() + CaptchaConfig.tokenExpiryMs
	});
	lsSetCurrentCaptchaAttempts(0);
	captchaChangeEmitter.emit();
	return parsedResponse.data;

};

/**
 * Gets the currently stored captcha token or fetches a new one from the captcha API.
 *
 * @returns The captcha token stored in local storage if not expired, otherwise the newly fetched one.
 */
export const getCaptcha = async(): Promise<ICaptcha | null> => {

	const storedCaptcha = lsGetCurrentCaptcha();
	return storedCaptcha && storedCaptcha.expiry > Date.now()
		? storedCaptcha
		: await fetchNewCaptcha();

};

/**
 * Clears the currently stored captcha token.
 */
export const clearCaptcha = () => {

	lsSetCurrentCaptcha(null);
	lsSetCurrentCaptchaAttempts(null);

	captchaChangeEmitter.emit();

};

/**
 * Increases the current captcha token attempts by one,
 * or fetches a new one if it would exceed the maximum tries per token.
 */
export const addCaptchaAttempt = () => {

	const newValue = (lsGetCurrentCaptchaAttempts() ?? 0) + 1;

	console.log(newValue);

	if (newValue >= CaptchaConfig.maxTriesPerToken) {

		void fetchNewCaptcha();

	} else {

		lsSetCurrentCaptchaAttempts(newValue);

	}

};
