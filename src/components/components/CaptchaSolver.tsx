import {
	useState,
	useEffect,
	useCallback
} from 'react';
import { LabeledInput } from '../elements/LabeledInput';
import { RefreshIcon } from './icons/RefreshIcon';
import {
	getCaptcha,
	fetchNewCaptcha,
	captchaChangeEmitter
} from '@/frontend/captchaApi';

/**
 * A component that handles captcha token instances and allows the user to solve it.
 */
export const CaptchaSolver = ({
	value,
	setValue
}: {
	value: string;
	setValue: (newValue: string)=> any;
}) => {

	const [
		captchaSvg,
		setCaptchaSvg
	] = useState<string | null>(null);
	const [
		captchaId,
		setCaptchaId
	] = useState<string | null>(null);

	const handleRefresh = useCallback(
		async() => {

			const captcha = await fetchNewCaptcha();
			if (captcha) {

				setCaptchaSvg(captcha.svgData);
				setCaptchaId(captcha.id);
				setValue('');

			}

		},
		[ setValue ]
	);

	useEffect(
		() => {

			const loadCaptcha = async() => {

				const captcha = await getCaptcha();
				if (captcha) {

					setCaptchaSvg(captcha.svgData);
					setCaptchaId(captcha.id);
					setValue('');

				}

			};

			void loadCaptcha();
			const subId = captchaChangeEmitter.subscribe(() => void loadCaptcha());
			return () => {

				captchaChangeEmitter.unsubscribe(subId);

			};

		},
		[ setValue ]
	);

	return (
		<div>
			<h1 className={'block text-sm/8 font-medium text-white'}>
				{window
					.__TRANSLATION__
					.captcha
					.title}
			</h1>

			<div className={'flex items-center'}>
				{
					captchaSvg
					&& <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
				}

				<RefreshIcon
					className={'ml-2 cursor-pointer'}
					onClick={() => void handleRefresh()}
				/>
			</div>

			<LabeledInput
				required
				id={'captcha-solution'}
				name={'captcha-solution'}
				value={value}
				onChange={
					(e: React.ChangeEvent<HTMLInputElement>) => {

						setValue(e.target.value);

					}
				}
			>
				{window
					.__TRANSLATION__
					.captcha
					.solveField}
			</LabeledInput>

			{
				captchaId && (
					<input
						type={'hidden'}
						name={'captcha-id'}
						value={captchaId}
					/>
				)
			}
		</div>
	);

};
