import {
	useState,
	useEffect
} from 'react';
import clsx from 'clsx';

export type TMonologProps = {
	text: string;
	durationMs: number;
	fadeDurationMs: number;
	className?: string;
	onClose?: ()=> void;
};

/**
 * A monolog popup. Use is not recommended.
 *
 * @see MonologProvider
 */
export const MonologPopup = (props: TMonologProps) => {

	const [
		visible,
		setVisible
	] = useState(false);

	useEffect(
		() => {

			requestAnimationFrame(() => {

				setVisible(true);

			});

			const fadeOutTimer = setTimeout(
				() => {

					setVisible(false);

				},
				props.durationMs
			);

			const closeTimer = setTimeout(
				() => {

					props.onClose?.();

				},
				props.durationMs + props.fadeDurationMs
			);

			return () => {

				clearTimeout(fadeOutTimer);
				clearTimeout(closeTimer);

			};

		},
		[ props ]
	);

	return (
		<div
			className={
				clsx(
					'z-50 border-2 border-white bg-gray-900 p-4',
					props.fadeDurationMs && `transition-opacity duration-${props.fadeDurationMs}`,
					visible
						? 'opacity-100'
						: 'opacity-0',
					props.className
				)
			}
		>
			<p className={'newlines text-center text-white'}>
				{props.text}
			</p>
		</div>
	);

};
