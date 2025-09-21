import {
	useEffect,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { smoothScroll } from '@/frontend/windowTools';

export const ScrollUp = ({ scrollYThreshold }: { scrollYThreshold: number }) => {

	const [
		visible,
		setVisible
	] = useState(false);

	useEffect(
		() => {

			const handleScroll = () => {

				if (window.scrollY > scrollYThreshold) {

					setVisible(true);

				} else {

					setVisible(false);

				}

			};
			window.addEventListener(
				'scroll',
				handleScroll
			);
			return () => {

				window.removeEventListener(
					'scroll',
					handleScroll
				);

			};

		},
		[ scrollYThreshold ]
	);

	return (
		<div
			className={
				clsx(
					'fixed right-10 bottom-10 z-50 rounded-full border-2 border-white p-2 transition-opacity',
					visible
						? 'pointer-events-auto cursor-pointer opacity-100'
						:	'pointer-events-none opacity-0'
				)
			}
			onClick={
				() => {

					smoothScroll(0);

				}
			}
		>
			<svg
				className={'size-6 text-white'}
				xmlns={'http://www.w3.org/2000/svg'}
				fill={'none'}
				viewBox={'0 0 24 24'}
				stroke={'currentColor'}
				strokeWidth={'2'}
			>
				<path
					strokeLinecap={'round'}
					strokeLinejoin={'round'}
					d={'M5 15l7-7 7 7'}
				/>
			</svg>
		</div>
	);

};
