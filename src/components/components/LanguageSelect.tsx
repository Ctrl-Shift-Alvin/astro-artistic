import clsx from 'clsx/lite';
import { type ILocale } from '@/locales/locales.config';

export const LanguageSelect = ({
	availableLanguages,
	selectedLanguageCode,
	defaultLanguageCode,
	onLanguageChange,
	className
}: {
	availableLanguages: ILocale[];
	selectedLanguageCode: string | null;
	defaultLanguageCode: string;
	onLanguageChange?: React.ChangeEventHandler;
	className?: string;
}) => (
	<div className={`flex flex-row items-center justify-center ${className}`}>
		<select
			value={selectedLanguageCode || defaultLanguageCode}
			className={
				clsx(
					'rounded border border-gray-300 bg-transparent px-4 py-2 text-white',
					'focus:ring-2 focus:ring-blue-600 focus:outline-none'
				)
			}
			name={'languageSelect'}
			onChange={onLanguageChange}
		>
			{
				availableLanguages.map((lang: ILocale) => (
					<option
						key={lang.code}
						value={lang.code}
						className={'border-gray-800 bg-black text-white'}
					>
						{lang.name}
					</option>
				))
			}
		</select>

		<svg
			className={'ml-4'}
			xmlns={'http://www.w3.org/2000/svg'}
			width={'32'}
			height={'32'}
			viewBox={'0 0 24 24'}
			fill={'none'}
			stroke={'white'}
			strokeWidth={'2'}
			strokeLinecap={'round'}
			strokeLinejoin={'round'}
		>
			<circle
				cx={'12'}
				cy={'12'}
				r={'10'}
			/>

			<line
				x1={'2'}
				y1={'12'}
				x2={'22'}
				y2={'12'}
			/>

			<path d={'M12 2a15.3 15.3 0 0 1 0 20'} />
			<path d={'M12 2a15.3 15.3 0 0 0 0 20'} />
		</svg>
	</div>
);
