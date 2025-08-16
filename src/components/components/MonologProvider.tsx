
import { createRoot } from 'react-dom/client';
import {
	MonologPopup, MonologPosition
} from './MonologPopup';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Monolog {

	static show({
		text,
		durationMs = 2000,
		dialogPosition = MonologPosition.Bottom,
		fadeDurationMs = 750,
		className
	}: {
		text: string;
		durationMs?: number;
		dialogPosition?: MonologPosition;
		fadeDurationMs?: number;
		className?: string;
	}) {

		const monologContainer = document.createElement('div');
		document.documentElement.appendChild(monologContainer);
		const root = createRoot(monologContainer);

		const cleanup = () => {

			root.unmount();
			document.documentElement.removeChild(monologContainer);

		};

		root.render((
			<MonologPopup
				text={text}
				dialogPosition={dialogPosition}
				durationMs={durationMs}
				fadeDurationMs={fadeDurationMs}
				className={className}
			/>
		));

		setTimeout(
			() => setTimeout(
				cleanup,
				fadeDurationMs
			),
			durationMs + fadeDurationMs
		);

	}

}

