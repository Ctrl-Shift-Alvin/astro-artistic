import {
	useState, useEffect,
	useMemo
} from 'react';

export enum MonologPosition {
	None = 'none',
	Center = 'center',
	Top = 'top',
	Bottom = 'bottom',
	Left = 'left',
	Right = 'right',
	TopLeft = 'top-left',
	TopRight = 'top-right',
	BottomLeft = 'bottom-left',
	BottomRight = 'bottom-right'
}

export const MonologPopup = ({
	text,
	dialogPosition,
	durationMs,
	fadeDurationMs,
	className
}: {
	text: string;
	dialogPosition: MonologPosition;
	durationMs: number;
	fadeDurationMs?: number;
	className?: string;
}) => {

	const positionClassName = useMemo(
		() => {

			switch (dialogPosition) {

				case MonologPosition.None:
					return '';
				case MonologPosition.Center:
					return 'top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2';
				case MonologPosition.Top:
					return 'top-5 left-1/2 -translate-x-1/2';
				case MonologPosition.Bottom:
					return 'bottom-5 left-1/2 -translate-x-1/2';
				case MonologPosition.Left:
					return 'top-1/2 left-5 -translate-y-1/2';
				case MonologPosition.Right:
					return 'top-1/2 right-5 -translate-y-1/2';
				case MonologPosition.TopLeft:
					return 'top-5 left-5';
				case MonologPosition.TopRight:
					return 'top-5 right-5';
				case MonologPosition.BottomLeft:
					return 'bottom-5 left-5';
				case MonologPosition.BottomRight:
					return 'bottom-5 right-5';

			}

		},
		[ dialogPosition ]
	);

	const [
		visible,
		setVisible
	] = useState(false);

	useEffect(
		() => {

			requestAnimationFrame(() => {

				setVisible(true);

			});
			setTimeout(
				() => {

					setVisible(false);

				},
				durationMs
			);

		},
		[ durationMs ]
	);

	return (
		<div
			className={
				`fixed z-50 ${positionClassName} border-2 border-white bg-gray-900 p-4 ${fadeDurationMs
					? `transition-opacity duration-${fadeDurationMs} ${visible
						? 'opacity-100'
						: 'opacity-0'}`
					: ''} ${className || ''}`
			}
		>
			<p className={'newlines text-center text-white'}>
				{text}
			</p>
		</div>
	);

};
