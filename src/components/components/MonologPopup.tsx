import {
	useState, useEffect
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

	let positionClassName = '';

	switch (dialogPosition) {

		case MonologPosition.None:
			break;
		case MonologPosition.Center:
			positionClassName = 'top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2';
			break;
		case MonologPosition.Top:
			positionClassName = 'top-5 left-1/2 -translate-x-1/2';
			break;
		case MonologPosition.Bottom:
			positionClassName = 'bottom-5 left-1/2 -translate-x-1/2';
			break;
		case MonologPosition.Left:
			positionClassName = 'top-1/2 left-5 -translate-y-1/2';
			break;
		case MonologPosition.Right:
			positionClassName = 'top-1/2 right-5 -translate-y-1/2';
			break;
		case MonologPosition.TopLeft:
			positionClassName = 'top-5 left-5';
			break;
		case MonologPosition.TopRight:
			positionClassName = 'top-5 right-5';
			break;
		case MonologPosition.BottomLeft:
			positionClassName = 'bottom-5 left-5';
			break;
		case MonologPosition.BottomRight:
			positionClassName = 'bottom-5 right-5';
			break;

	}

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
		[]
	);

	return (
		<div
			className={`fixed z-50 ${positionClassName} border-2 border-white bg-gray-900 p-4 ${fadeDurationMs
				? `transition-opacity duration-${fadeDurationMs} ${visible
					? 'opacity-100'
					: 'opacity-0'}`
				: ''} ${className || ''}`}
		>
			<p className={'newlines text-center text-white'}>
				{text}
			</p>
		</div>
	);

};
